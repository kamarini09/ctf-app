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

  // Require auth
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

  // Load challenges
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

  // Load solved challenges
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await fetch(`/api/me/solves?userId=${userId}`);
        const ids: string[] = await res.json();
        setSolved(new Set(ids));
      } catch {
        // ignore
      }
    })();
  }, [userId]);

  // Close modal on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    if (modalOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  // Auto-focus input
  useEffect(() => {
    if (modalOpen && selected && flagInputRef.current) {
      flagInputRef.current.focus();
    }
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
        setSolved((prev) => {
          const next = new Set(prev);
          next.add(selected!.id);
          return next;
        });
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
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Challenges</h1>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

      {/* Loading / Empty / List */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="animate-pulse space-y-3">
                <div className="h-5 w-2/3 rounded bg-gray-200" />
                <div className="h-4 w-1/3 rounded bg-gray-200" />
                <div className="h-3 w-full rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-gray-600 shadow-sm">No challenges yet. Check back soon.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => {
            const isSolved = solved.has(c.id);
            return (
              <button key={c.id} onClick={() => openModal(c.id)} className={["group rounded-2xl border p-4 text-left shadow-sm transition", "hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-500", isSolved ? "border-violet-200 bg-violet-50" : "border-gray-200 bg-white"].join(" ")}>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:underline">{c.title}</h2>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-200">{c.points} pts</span>
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-gray-600">Click to view details and submit a flag.</p>

                {isSolved && (
                  <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 ring-1 ring-inset ring-violet-200">
                    <span aria-hidden>✓</span> Solved
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" onClick={closeModal}>
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            {/* Removed purple top bar */}

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
                      <h3 className="text-xl font-bold text-gray-900">{selected.title}</h3>
                      <p className="text-sm text-gray-600">{selected.points} pts</p>
                    </div>
                    <button onClick={closeModal} className="rounded-lg border border-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50">
                      Close
                    </button>
                  </div>

                  <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-800 ring-1 ring-inset ring-gray-200">{selected.description}</pre>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {selected.link_url && (
                      <a className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700" href={selected.link_url} target="_blank" rel="noreferrer">
                        Open link
                      </a>
                    )}

                    {selected.attachment_url && (
                      <button className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black/90 disabled:opacity-60" onClick={handleDownload} disabled={downloadLoading}>
                        {downloadLoading ? "Preparing…" : "Download attachment"}
                      </button>
                    )}
                  </div>

                  <form className="mt-6 flex gap-2" onSubmit={handleSubmitFlag}>
                    <input ref={flagInputRef} type="text" placeholder="CTF{ANSWER}" className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none ring-violet-500 focus:border-violet-500 focus:ring-2" value={flag} onChange={(e) => setFlag(e.target.value)} required />
                    <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60" disabled={submitting}>
                      {submitting ? "Submitting…" : "Submit"}
                    </button>
                  </form>

                  <p className="mt-3 text-sm text-gray-700">{notice}</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
