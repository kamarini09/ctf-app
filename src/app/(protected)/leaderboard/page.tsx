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

/**
 * Leaderboard – Signature Purple, Bigger Card, Simple Table
 * - Full-page subtle purple background
 * - Single large violet card for the teams table
 * - No podium/top-3
 * - Progress bar fixed & labeled (value / max)
 */
export default function LeaderboardPage() {
  const router = useRouter();
  const [rows, setRows] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);

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
        // Your /api/challenges returns an array of { id, title, points }
        const res = await fetch("/api/challenges");
        if (!res.ok) return;
        const data = await res.json();
        const total = Array.isArray(data) ? data.reduce((sum: number, c: any) => sum + (Number(c.points) || 0), 0) : 0;
        if (total > 0) setTotalPoints(total);
      } catch {}
    })();
  }, []);
  const maxScore = useMemo(() => {
    // Prefer total challenge points; fallback to current leader
    const leader = Math.max(0, ...sorted.map((r) => r.score));
    const base = totalPoints ?? leader;
    return base === 0 ? 1 : base;
  }, [sorted, totalPoints]);

  return (
    <main className="min-h-[90vh] bg-[radial-gradient(1200px_600px_at_20%_-10%,_rgba(139,92,246,0.12),_transparent),radial-gradient(900px_500px_at_100%_10%,_rgba(139,92,246,0.10),_transparent)]">
      <div className="mx-auto max-w-6xl p-6">
        <header className="mb-5">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Team Leaderboard</h1>
          <p className="mt-1 text-sm text-gray-600">Points update as flags are submitted.</p>
        </header>

        {/* Big signature-purple card */}
        <section className="overflow-hidden rounded-3xl bg-violet-600 text-white shadow-xl ring-1 ring-violet-500/50">
          {/* top shine */}
          <div className="h-1 w-full bg-gradient-to-r from-white/30 via-white/60 to-white/30" />

          <div className="w-full overflow-x-auto">
            <table className="w-full text-base">
              {/* bigger text */}
              <thead className="bg-white/10">
                <tr className="text-left uppercase text-[11px] tracking-widest text-violet-100">
                  <th className="px-5 py-4 w-14">#</th>
                  <th className="px-5 py-4 min-w-[260px]">Team</th>
                  <th className="px-5 py-4">Progress</th>
                  <th className="px-5 py-4 text-right w-28">Score</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} aria-busy="true" className="animate-pulse">
                      <td className="px-5 py-5">
                        <div className="h-4 w-6 rounded bg-white/20" />
                      </td>
                      <td className="px-5 py-5">
                        <div className="h-5 w-48 rounded bg-white/20" />
                        <div className="mt-2 flex gap-2">
                          <div className="h-6 w-24 rounded-full bg-white/20" />
                          <div className="h-6 w-16 rounded-full bg-white/20" />
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <div className="h-2 w-full rounded bg-white/15" />
                      </td>
                      <td className="px-5 py-5 text-right">
                        <div className="ml-auto h-5 w-12 rounded bg-white/20" />
                      </td>
                    </tr>
                  ))
                ) : sorted.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-violet-100">
                      No teams yet — be the first to create one ✨
                    </td>
                  </tr>
                ) : (
                  sorted.map((r, i) => (
                    <tr key={r.id} className="align-middle transition-colors hover:bg-white/5">
                      <td className="px-5 py-5">
                        <PurpleRank rank={i + 1} />
                      </td>
                      <td className="px-5 py-5">
                        <div className="font-semibold drop-shadow-sm">{r.name}</div>
                        {r.members.length ? (
                          <ul className="mt-1 flex flex-wrap gap-1.5">
                            {r.members.map((m) => (
                              <li key={m.id} className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[12px] text-violet-50" title={m.display_name}>
                                {m.display_name}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="mt-1 text-xs text-violet-100/80">No members yet</div>
                        )}
                      </td>
                      <td className="px-5 py-5">
                        <ProgressBar value={r.score} max={maxScore} />
                        <div className="mt-1 text-[11px] text-violet-100/80">
                          {r.score} / {maxScore} {totalPoints ? "total" : "max"} pts
                        </div>
                      </td>
                      <td className="px-5 py-5 text-right">
                        <span className="inline-flex items-center justify-end rounded-md bg-white/15 px-3 py-1 text-base font-semibold text-white ring-1 ring-inset ring-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">{r.score}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* footer note */}
          {!loading && sorted.length > 0 && <div className="bg-white/10 px-5 py-3 text-xs text-violet-100">Ties are shown by rank order but share the same score.</div>}
        </section>
      </div>
    </main>
  );
}

function PurpleRank({ rank }: { rank: number }) {
  const base = "inline-grid h-8 w-8 place-items-center rounded-full font-bold";
  if (rank === 1) return <span className={`${base} bg-amber-300 text-gray-900`}>1</span>;
  if (rank === 2) return <span className={`${base} bg-gray-300 text-gray-900`}>2</span>;
  if (rank === 3) return <span className={`${base} bg-orange-300 text-gray-900`}>3</span>;
  return <span className={`${base} bg-white/15 text-white ring-1 ring-inset ring-white/20`}>{rank}</span>;
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  // Clamp and avoid NaN/Infinity
  const pct = Number.isFinite(value) && Number.isFinite(max) && max > 0 ? Math.round((value / max) * 100) : 0;
  const safePct = Math.max(0, Math.min(100, pct));
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/15" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <div className="h-full w-0 rounded-full bg-gradient-to-r from-violet-200 via-white to-violet-50 shadow-[0_0_12px_rgba(255,255,255,0.35)] transition-[width] duration-700" style={{ width: safePct + "%" }} />
    </div>
  );
}
