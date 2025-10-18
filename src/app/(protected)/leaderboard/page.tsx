"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { sb } from "@/lib/supabase-browser";

type TeamRow = {
  id: string;
  name: string;
  score: number;
  members: { id: string; display_name: string }[];
};

export default function LeaderboardPage() {
  const router = useRouter();
  const [rows, setRows] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Fredoka One (client-only)
  useEffect(() => {
    const href = "https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap";
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement("link");
      link.href = href;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/login");
    });
  }, [router]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((json) => setRows(Array.isArray(json) ? json : []))
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => rows.slice().sort((a, b) => b.score - a.score), [rows]);

  // Total available points from all active challenges
  const [totalPoints, setTotalPoints] = useState<number | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/challenges");
        if (!res.ok) return;
        const data = await res.json();
        const total = Array.isArray(data) ? data.reduce((sum: number, c: any) => sum + (Number(c.points) || 0), 0) : 0;
        if (total > 0) setTotalPoints(total);
      } catch {}
    })();
  }, []);
  const maxScore = useMemo(() => {
    const leader = Math.max(0, ...sorted.map((r) => r.score));
    const base = totalPoints ?? leader;
    return base === 0 ? 1 : base;
  }, [sorted, totalPoints]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="mb-2 text-center text-[#FF5757]" style={{ fontFamily: "Fredoka One, sans-serif" }}>
          Leaderboard
        </h1>
        <p className="mb-8 text-center text-[#FF5757]/80">Points update as flags are submitted.</p>

        {/* Card with double coral border */}
        <section className="border-2 border-[#FF5757] bg-white p-1">
          <div className="border-2 border-[#FF5757] bg-white">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-4 border-b-2 border-[#FF5757] bg-[#FF5757] px-6 py-3">
              <div className="col-span-1 text-xs uppercase text-white" style={{ fontFamily: "Fredoka One, sans-serif" }}>
                #
              </div>
              <div className="col-span-6 text-xs uppercase text-white" style={{ fontFamily: "Fredoka One, sans-serif" }}>
                Team
              </div>
              <div className="col-span-3 text-xs uppercase text-white" style={{ fontFamily: "Fredoka One, sans-serif" }}>
                Progress
              </div>
              <div className="col-span-2 text-right text-xs uppercase text-white" style={{ fontFamily: "Fredoka One, sans-serif" }}>
                Score
              </div>
            </div>

            {/* Body */}
            <div>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 border-b-2 border-[#FF5757] px-6 py-4">
                    <div className="col-span-1 flex items-center">
                      <div className="h-4 w-6 animate-pulse rounded bg-[#FF5757]/20" />
                    </div>
                    <div className="col-span-6">
                      <div className="h-5 w-48 animate-pulse rounded bg-[#FF5757]/20" />
                      <div className="mt-2 flex gap-2">
                        <div className="h-6 w-24 animate-pulse rounded-full bg-[#FF5757]/20" />
                        <div className="h-6 w-16 animate-pulse rounded-full bg-[#FF5757]/20" />
                      </div>
                    </div>
                    <div className="col-span-3 flex items-center">
                      <div className="h-6 w-full animate-pulse rounded bg-[#FF5757]/15" />
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <div className="h-5 w-12 animate-pulse rounded bg-[#FF5757]/20" />
                    </div>
                  </div>
                ))
              ) : sorted.length === 0 ? (
                <div className="px-6 py-10 text-center text-[#FF5757]/80">No teams yet — be the first to create one ✨</div>
              ) : (
                sorted.map((r, i) => (
                  <div key={r.id} className="grid grid-cols-12 gap-4 border-b-2 border-[#FF5757] px-6 py-4 last:border-b-0">
                    {/* rank */}
                    <div className="col-span-1 flex items-center">
                      <span className="text-[#FF5757]" style={{ fontFamily: "Fredoka One, sans-serif" }}>
                        {i + 1}
                      </span>
                    </div>

                    {/* team + members UNDER the name */}
                    <div className="col-span-6">
                      <div className="text-[#FF5757]" style={{ fontFamily: "Fredoka One, sans-serif" }}>
                        {r.name}
                      </div>
                      {r.members.length ? (
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {r.members.map((m) => (
                            <li key={m.id} className="rounded border-2 border-[#FF5757] bg-[#FF5757] px-2 py-1 text-xs text-white" title={m.display_name} style={{ fontFamily: "Fredoka One, sans-serif" }}>
                              {m.display_name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="mt-2 text-xs text-[#FF5757]/70">No members yet</div>
                      )}
                    </div>

                    {/* progress (coral, not green) */}
                    <div className="col-span-3 flex items-center">
                      <ProgressBar value={r.score} max={maxScore} />
                    </div>

                    {/* score */}
                    <div className="col-span-2 flex items-center justify-end">
                      <span className="text-[#FF5757]" style={{ fontFamily: "Fredoka One, sans-serif" }}>
                        {r.score.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {!loading && sorted.length > 0 && <p className="mt-6 text-center text-sm text-[#FF5757]/80">Ties are shown by rank order but share the same score.</p>}
      </main>
    </div>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Number.isFinite(value) && Number.isFinite(max) && max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0;

  return (
    <div className="relative h-6 w-full overflow-hidden border-2 border-[#FF5757] bg-gray-100" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <div className="h-full bg-[#FF5757] transition-[width] duration-500" style={{ width: pct + "%" }} />
      <div className="absolute inset-0 flex items-center justify-center text-xs">
        <span className="relative z-10 text-white mix-blend-difference" style={{ fontFamily: "Fredoka One, sans-serif" }}>
          {value} / {max}
        </span>
      </div>
    </div>
  );
}
