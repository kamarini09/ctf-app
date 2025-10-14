"use client";

import { useEffect, useMemo, useState } from "react";
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

  // auth + user
  const [userId, setUserId] = useState<string | null>(null);

  // list + loading
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ChallengeListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<ChallengeDetail | null>(null);

  // actions state
  const [flag, setFlag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // simple client-side auth guard + userId
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

  // load challenges once
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

  // placeholder cards for empty DB
  const placeholders = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        id: `placeholder-${i + 1}`,
        title: `Challenge #${i + 1}`,
        points: (i + 1) * 50,
        placeholder: true,
      })),
    []
  ) as Array<ChallengeListItem & { placeholder?: true }>;

  const listToRender = items.length ? items : placeholders;

  const openModal = async (id: string, placeholder?: boolean) => {
    setSelected(null);
    setModalOpen(true);
    setFlag("");
    setNotice(null);

    if (placeholder) {
      setSelected({
        id,
        title: "Sample Challenge",
        points: 100,
        description: "This is a template. Once you add challenges in Supabase, this will show the real description.\n\nFlags must look like `CTF{ANSWER}`.",
        attachment_url: null,
        link_url: null,
      });
      return;
    }

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
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submit failed");

      if (json.correct) {
        setNotice(`✅ Correct! +${json.points} pts`);
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
    <main className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Challenges</h1>
        {items.length === 0 && <span className="text-sm text-gray-600">Showing template cards — add challenges in Supabase to replace these.</span>}
      </div>

      {error && <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy={loading ? "true" : "false"}>
        {listToRender.map((c) => (
          <button key={c.id} onClick={() => openModal(c.id, (c as any).placeholder ? true : false)} className="group rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold group-hover:underline">{c.title}</h2>
              <span className="rounded-full border px-2 py-0.5 text-sm">{c.points} pts</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">Click to view details and submit a flag.</p>
          </button>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" onClick={closeModal}>
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
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
                    <h3 className="text-xl font-bold">{selected.title}</h3>
                    <p className="text-sm text-gray-600">{selected.points} pts</p>
                  </div>
                  <button onClick={closeModal} className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50">
                    Close
                  </button>
                </div>

                <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm">{selected.description}</pre>

                <div className="mt-4 flex flex-wrap gap-3">
                  {selected.link_url && (
                    <a className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700" href={selected.link_url} target="_blank" rel="noreferrer">
                      Open Link
                    </a>
                  )}

                  {selected.attachment_url && (
                    <button className="rounded bg-slate-700 px-3 py-2 text-white hover:bg-slate-800 disabled:opacity-60" onClick={handleDownload} disabled={downloadLoading}>
                      {downloadLoading ? "Preparing…" : "Download Attachment"}
                    </button>
                  )}
                </div>

                <form className="mt-6 flex gap-2" onSubmit={handleSubmitFlag}>
                  <input type="text" placeholder="CTF{ANSWER}" className="flex-1 rounded border px-3 py-2" value={flag} onChange={(e) => setFlag(e.target.value)} required />
                  <button className="rounded bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-60" disabled={submitting}>
                    {submitting ? "Submitting…" : "Submit"}
                  </button>
                </form>

                {notice && <p className="mt-3 text-sm">{notice}</p>}
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
