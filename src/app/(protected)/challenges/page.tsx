// app/challenges/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sb } from "@/lib/supabase-browser";

type ChallengeListItem = { id: string; title: number | string; points: number };
type ChallengeDetail = {
  id: string;
  title: string;
  description: string;
  points: number;
  attachment_url: string | null;
  link_url: string | null;
};

const FLAG_RE = /^CTF\{[A-Za-z0-9_]{1,80}\}$/;

export default function ChallengesPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ChallengeListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [solved, setSolved] = useState<Set<string>>(new Set());

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<ChallengeDetail | null>(null);

  const [flag, setFlag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const flagInputRef = useRef<HTMLInputElement | null>(null);

  // auth
  useEffect(() => {
    sb.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) {
        router.replace("/login");
        return;
      }
      setUserId(user.id);
    });
  }, [router]);

  // load challenges (no-store)
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/challenges", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load challenges");
        const json = (await res.json()) as ChallengeListItem[];
        setItems(Array.isArray(json) ? json : []);
      } catch (e: any) {
        setError(e.message || "Error loading challenges");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // load solved (no-store)
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await fetch(`/api/me/solves?userId=${userId}`, { cache: "no-store" });
        const ids: string[] = await res.json();
        setSolved(new Set(ids));
      } catch {}
    })();
  }, [userId]);

  // modal helpers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeModal();
    if (modalOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  useEffect(() => {
    if (modalOpen && selected && flagInputRef.current) flagInputRef.current.focus();
  }, [modalOpen, selected]);

  const openModal = async (id: string) => {
    setSelected(null);
    setModalOpen(true);
    setFlag("");
    setNotice(null);
    try {
      const res = await fetch(`/api/challenges/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Not found");
      const data = (await res.json()) as ChallengeDetail;
      setSelected(data);
    } catch {
      setSelected({
        id,
        title: "Challenge unavailable",
        points: 0,
        description: "We could not load this challenge. Try again later.",
        attachment_url: null,
        link_url: null,
      });
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
    setFlag("");
    setNotice(null);
  };

  const handleDownload = async () => {
    if (!selected?.attachment_url) return;
    setDownloadLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/attachments/sign-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: selected.attachment_url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to get link");
      window.open(json.url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      setNotice(e.message || "Download error");
    } finally {
      setDownloadLoading(false);
    }
  };

  const refetchSolved = async (uid: string) => {
    try {
      const res = await fetch(`/api/me/solves?userId=${uid}`, { cache: "no-store" });
      const ids: string[] = await res.json();
      setSolved(new Set(ids));
    } catch {}
  };

  const handleSubmitFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected?.id || !userId) return;
    const trimmed = flag.trim();
    if (!FLAG_RE.test(trimmed)) {
      setNotice("Invalid flag format. Use CTF{ANSWER}.");
      return;
    }
    setSubmitting(true);
    setNotice(null);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, challengeId: selected.id, flag: trimmed }),
      });
      const ct = res.headers.get("content-type") || "";
      const raw = await res.text();
      const json = ct.includes("application/json") ? JSON.parse(raw) : { ok: false, message: raw.slice(0, 200) };
      if (!res.ok) throw new Error(json.error || json.message || "Submit failed");

      if (json.correct) {
        setNotice(json.alreadySolved ? "✅ Correct — but your team already solved this." : `✅ Correct! +${json.points} pts`);
        setSolved((prev) => new Set(prev).add(selected!.id));
        await refetchSolved(userId); // keep UI honest
      } else {
        setNotice("❌ Not correct. Keep trying!");
      }
    } catch (e: any) {
      setNotice(e.message || "Submission error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl p-6">
      {/* Paper card wrapper */}
      <div className="paper">
        {/* Title — shared across Rules & Challenges */}
        <h1 className="font-display text-center text-brand" style={{ fontWeight: 900, letterSpacing: "-0.5px", fontSize: "clamp(32px, 6vw, 64px)" }}>
          Challenges
        </h1>

        {error && <div className="mb-4 mt-4 border-2 border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

        {/* GRID */}
        {loading ? (
          <div className="mt-6 grid gap-1 [grid-auto-rows:1fr] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square border-2 border-[color-mix(in_srgb,var(--ctf-red)30%,white)] bg-white p-3">
                <div className="h-full w-full animate-pulse bg-gray-100" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-6 border-2 border-[color-mix(in_srgb,var(--ctf-red)30%,white)] bg-white p-6 text-center text-gray-600">No challenges yet. Check back soon.</div>
        ) : (
          <div className="mt-6 grid gap-1 [grid-auto-rows:1fr] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((c) => {
              const isSolved = solved.has(String(c.id));
              return (
                <button key={String(c.id)} onClick={() => openModal(String(c.id))} className={["group relative block aspect-square transition-transform focus-ring", "border-2", isSolved ? "border-transparent" : "border-[color-mix(in_srgb,var(--ctf-red)65%,white)] bg-white"].join(" ")}>
                  {/* solved: solid red gradient */}
                  {isSolved && (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(135deg, var(--ctf-red) 0%, color-mix(in srgb, var(--ctf-red) 85%, white) 100%)",
                      }}
                    />
                  )}

                  {/* subtle lift for unsolved */}
                  {!isSolved && <div className="absolute inset-0 shadow-[var(--shadow-coral)] transition-transform group-hover:-translate-y-0.5" />}

                  {/* inner double border for unsolved */}
                  {!isSolved && <div className="pointer-events-none absolute inset-[2px] border-2 border-[var(--ctf-red)]" />}

                  {/* content */}
                  <div className={["relative z-10 grid h-full w-full place-items-center px-3 text-center", isSolved ? "text-white" : "text-brand"].join(" ")}>
                    <span className="text-sm font-semibold leading-tight">{String(c.title)}</span>
                    <span className={["absolute right-2 top-2 text-xs font-semibold tracking-wide", isSolved ? "text-white/90" : "text-brand"].join(" ")}>{c.points} pts</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" onClick={closeModal}>
          <div className="double-border w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="inner p-6">
              {/* Header row */}
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-[1.35rem] text-brand">{selected?.title ?? "Loading…"}</h3>

                  {/* meta: points • category • solved */}
                  {selected && (
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                      <span className="font-semibold text-brand">{selected.points} pts</span>

                      {"category" in (selected as any) && (selected as any).category && <span className="badge">{(selected as any).category}</span>}

                      {selected?.id && solved.has(selected.id) && (
                        <span className="inline-flex items-center gap-1 text-brand">
                          <svg width="16" height="16" viewBox="0 0 24 24" className="-mt-[2px]">
                            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Solved
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Close (X) */}
                <button onClick={closeModal} aria-label="Close" title="Close" className="btn btn-ghost btn-sm focus-ring">
                  ×
                </button>
              </div>

              {/* Description */}
              {!selected ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 w-1/2 bg-gray-200" />
                  <div className="h-24 w-full bg-gray-200" />
                </div>
              ) : (
                <>
                  <p className="text-[15px] leading-relaxed text-gray-800">{selected.description}</p>

                  {/* Links / Attachments */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    {selected.link_url && (
                      <a href={selected.link_url} target="_blank" rel="noreferrer" className="btn btn-outline focus-ring">
                        Open link
                      </a>
                    )}
                    {selected.attachment_url && (
                      <button onClick={handleDownload} disabled={downloadLoading} className="btn btn-outline disabled:opacity-60 focus-ring">
                        {downloadLoading ? "Preparing…" : "Download attachment"}
                      </button>
                    )}
                  </div>

                  {/* Submit Flag */}
                  <form className="mt-6 space-y-2" onSubmit={handleSubmitFlag}>
                    <label className="block text-sm font-medium text-brand">Submit Flag</label>
                    <div className="flex gap-2">
                      <input ref={flagInputRef} type="text" placeholder="CTF{ANSWER}" className="input" value={flag} onChange={(e) => setFlag(e.target.value)} required />
                      <button className="btn btn-solid disabled:opacity-60 focus-ring" disabled={submitting}>
                        {submitting ? "Submitting…" : "Submit"}
                      </button>
                    </div>
                  </form>

                  {notice && <p className="mt-3 text-sm text-gray-800">{notice}</p>}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
