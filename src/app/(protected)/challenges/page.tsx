"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sb } from "@/lib/supabase-browser";

type ChallengeListItem = { id: string; title: string; points: number };
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

  // load challenges
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/challenges");
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

  // load solved
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await fetch(`/api/me/solves?userId=${userId}`);
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
      const res = await fetch(`/api/challenges/${id}`);
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
      {/* Paper card wrapper to feel like a printed bingo sheet */}
      <div
        className="
    relative mx-auto w-full max-w-3xl 
      border-2 border-[#efe7df] bg-[#fffdf8]
      p-8 md:p-12 shadow-[0_12px_30px_rgba(0,0,0,0.08)]
    "
        style={{
          backgroundImage: "radial-gradient(rgba(0,0,0,0.035) 0.6px, transparent 0.6px)",
          backgroundSize: "10px 10px",
        }}
      >
        <h1 className="mb-6 text-center text-4xl font-black tracking-tight text-[var(--ctf-red)] font-display">Challenges</h1>

        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

        {/* GRID inside the paper */}
        {loading ? (
          <div className="grid gap-1 [grid-auto-rows:1fr] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-none border-2 border-[var(--ctf-red)]/30 bg-white p-3">
                <div className="h-full w-full animate-pulse rounded-none bg-gray-100" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-600 shadow-sm">No challenges yet. Check back soon.</div>
        ) : (
          <div className="grid gap-1 [grid-auto-rows:1fr] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((c) => {
              const isSolved = solved.has(c.id);
              return (
                <button key={c.id} onClick={() => openModal(c.id)} className={["group relative block aspect-square transition-transform", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ctf-red)]", isSolved ? "border-0" : "bg-white border-1 border-[var(--ctf-red)]", "rounded-none"].join(" ")} style={{ fontFamily: "Fredoka One, sans-serif" }}>
                  {/* solved: solid red gradient */}
                  {isSolved && <div className="absolute inset-0 rounded-none bg-gradient-to-br from-[#ff6b6b] to-[var(--ctf-red)] shadow-lg" />}

                  {/* very subtle lift for unsolved (keeps print vibe tight) */}
                  {!isSolved && <div className="absolute inset-0 rounded-none shadow-[0_6px_14px_rgba(255,87,87,0.06)] transition-transform group-hover:-translate-y-0.5" />}

                  {/* double border (tiny gap) */}
                  {!isSolved && <div className="pointer-events-none absolute inset-[2px] rounded-none border-1 border-[var(--ctf-red)]" />}

                  {/* content */}
                  <div className={["relative z-10 grid h-full w-full place-items-center px-3 text-center", isSolved ? "text-white" : "text-[var(--ctf-red)]"].join(" ")}>
                    <span className="text-sm font-semibold leading-tight">{c.title}</span>

                    {/* points — plain text, no rounded background */}
                    <span className={["absolute right-2 top-2 text-xs font-semibold tracking-wide", isSolved ? "text-white/90" : "text-[var(--ctf-red)]"].join(" ")}>{c.points} pts</span>
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
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {!selected ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-6 w-1/3 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                  <div className="h-24 w-full rounded bg-gray-200" />
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-2xl font-black text-[var(--ctf-red)]">{selected.title}</h3>
                      <p className="mt-0.5 text-sm text-gray-600">{selected.points} pts</p>
                    </div>
                    <button onClick={closeModal} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50">
                      Close
                    </button>
                  </div>

                  <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-800 ring-1 ring-inset ring-gray-200">{selected.description}</pre>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {selected.link_url && (
                      <a className="rounded-lg bg-[var(--ctf-red)] px-3 py-2 text-sm font-semibold text-white hover:bg-[#ff4444]" href={selected.link_url} target="_blank" rel="noreferrer">
                        Open link
                      </a>
                    )}

                    {selected.attachment_url && (
                      <button className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-60" onClick={handleDownload} disabled={downloadLoading}>
                        {downloadLoading ? "Preparing…" : "Download attachment"}
                      </button>
                    )}
                  </div>

                  <form className="mt-6 flex gap-2" onSubmit={handleSubmitFlag}>
                    <input ref={flagInputRef} type="text" placeholder="CTF{ANSWER}" className="flex-1 rounded-lg border-2 border-[var(--ctf-red)]/30 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-[var(--ctf-red)] focus:ring-2 focus:ring-[var(--ctf-red)]/40" value={flag} onChange={(e) => setFlag(e.target.value)} required />
                    <button className="rounded-lg bg-[var(--ctf-red)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ff4444] disabled:opacity-60" disabled={submitting}>
                      {submitting ? "Submitting…" : "Submit"}
                    </button>
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
