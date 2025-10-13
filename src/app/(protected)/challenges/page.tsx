"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { sb } from "@/lib/supabase-browser";

type ChallengeListItem = { id: string; title: string; points: number };
type ChallengeDetail = {
  id: string;
  title: string;
  prompt: string;
  points: number;
  attachment_url: string | null;
  link_url: string | null;
};

export default function ChallengesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ChallengeListItem[]>([]);
  const [selected, setSelected] = useState<ChallengeDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // simple client-side auth guard
  useEffect(() => {
    sb.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/login");
    });
  }, [router]);

  // load challenges (may be empty initially)
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/challenges");
        if (!res.ok) throw new Error("Failed to load challenges");
        const json = (await res.json()) as ChallengeListItem[];
        setItems(json || []);
      } catch (e: any) {
        setError(e.message || "Error loading challenges");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // placeholder cards if DB is empty (for design preview)
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
    if (placeholder) {
      // show a template modal for design
      setSelected({
        id,
        title: "Sample Challenge",
        points: 100,
        prompt: "This is a template modal. When you add challenges in Supabase, this will show the real prompt.\n\nFlags must look like `CTF{ANSWER}`.",
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
        prompt: "We could not load this challenge. Try again later.",
        attachment_url: null,
        link_url: null,
      });
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
  };

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Challenges</h1>
        {items.length === 0 && <span className="text-sm text-gray-600">Showing template cards — add challenges in Supabase to replace these.</span>}
      </div>

      {error && <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy={loading ? "true" : "false"}>
        {listToRender.map((c) => (
          <button key={c.id} onClick={() => openModal(c.id, (c as any).placeholder ? true : false)} className="group rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold group-hover:underline">{c.title}</h2>
              <span className="text-sm rounded-full border px-2 py-0.5">{c.points} pts</span>
            </div>
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">Click to view details and submit a flag.</p>
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

                <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm">{selected.prompt}</pre>

                <div className="mt-4 flex flex-wrap gap-3">
                  {selected.link_url && (
                    <a className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700" href={selected.link_url} target="_blank" rel="noreferrer">
                      Open Link
                    </a>
                  )}
                  {selected.attachment_url && (
                    <button className="rounded bg-slate-700 px-3 py-2 text-white hover:bg-slate-800" onClick={() => alert("Download will be wired via signed URL later.")}>
                      Download Attachment
                    </button>
                  )}
                </div>

                {/* Flag input (stubbed – real submit next step) */}
                <form
                  className="mt-6 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("Flag submit will be implemented next.");
                  }}
                >
                  <input type="text" inputMode="text" placeholder="CTF{ANSWER}" className="flex-1 rounded border px-3 py-2" />
                  <button className="rounded bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700">Submit</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
