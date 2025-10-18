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
    <div className="min-h-screen bg-[var(--background)]">
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="font-display mb-2 text-center text-3xl text-brand">Leaderboard</h1>
        <p className="mb-8 text-center text-[color-mix(in_srgb,var(--ctf-red)70%,black)]/80">Points update as flags are submitted.</p>

        {/* Double-border card */}
        <section className="double-border">
          <div className="inner">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-4 bg-[var(--ctf-red)] px-6 py-3 text-white">
              <div className="col-span-1 text-xs uppercase">#</div>
              <div className="col-span-6 text-xs uppercase">Team</div>
              <div className="col-span-3 text-xs uppercase">Progress</div>
              <div className="col-span-2 text-right text-xs uppercase">Score</div>
            </div>

            {/* Body */}
            <div>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 border-t-2 border-[var(--ctf-red)]/20 px-6 py-4">
                    <div className="col-span-1 flex items-center">
                      <div className="h-4 w-6 animate-pulse bg-[var(--ctf-red)]/20" />
                    </div>
                    <div className="col-span-6">
                      <div className="h-5 w-48 animate-pulse bg-[var(--ctf-red)]/20" />
                      <div className="mt-2 flex gap-2">
                        <div className="h-6 w-24 animate-pulse bg-[var(--ctf-red)]/20" />
                        <div className="h-6 w-16 animate-pulse bg-[var(--ctf-red)]/20" />
                      </div>
                    </div>
                    <div className="col-span-3 flex items-center">
                      <div className="h-6 w-full animate-pulse bg-[var(--ctf-red)]/15" />
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <div className="h-5 w-12 animate-pulse bg-[var(--ctf-red)]/20" />
                    </div>
                  </div>
                ))
              ) : sorted.length === 0 ? (
                <div className="px-6 py-10 text-center text-[var(--ctf-red)]/80">No teams yet — be the first to create one ✨</div>
              ) : (
                sorted.map((r, i) => {
                  const rank = i + 1;
                  const top3 = rank <= 3;

                  return (
                    <div key={r.id} className="grid grid-cols-12 gap-4 border-t-2 border-[var(--ctf-red)]/20 px-6 py-4 first:border-t-0">
                      {/* rank */}
                      <div className="col-span-1 flex items-center">
                        {top3 ? (
                          <span aria-label={`Rank ${rank}`} className="grid h-7 w-7 place-items-center rounded-full bg-[var(--ctf-red)] text-white font-semibold">
                            {rank}
                          </span>
                        ) : (
                          <span className="font-display text-brand">{rank}</span>
                        )}
                      </div>

                      {/* team + members */}
                      <div className="col-span-6">
                        <div className="font-display text-brand">{r.name}</div>
                        {r.members.length ? (
                          <ul className="mt-2 flex flex-wrap gap-1.5">
                            {r.members.map((m) => (
                              <li key={m.id} className="badge" title={m.display_name}>
                                {m.display_name}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="mt-2 text-xs text-brand/70">No members yet</div>
                        )}
                      </div>

                      {/* progress */}
                      <div className="col-span-3 flex items-center">
                        <ProgressBar value={r.score} max={maxScore} label={`${r.name} progress`} />
                      </div>

                      {/* score */}
                      <div className="col-span-2 flex items-center justify-end">
                        <span className="font-display text-brand">{r.score.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {!loading && sorted.length > 0 && <p className="mt-6 text-center text-sm text-brand/80">Ties are shown by rank order but share the same score.</p>}
      </main>
    </div>
  );
}

function ProgressBar({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label?: string; // accessible name
}) {
  const pct = Number.isFinite(value) && Number.isFinite(max) && max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0;

  return (
    <div role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label ?? "Progress"} className="relative h-6 w-full overflow-hidden border-2 border-[var(--ctf-red)] bg-gray-100">
      <div className="h-full bg-[var(--ctf-red)] transition-[width] duration-500" style={{ width: pct + "%" }} />
      <div className="absolute inset-0 flex items-center justify-center text-xs">
        <span className="relative z-10 text-white mix-blend-difference">
          {value} / {max}
        </span>
      </div>

      <span className="sr-only">
        {label ?? "Progress"}: {value} of {max} ({pct}%)
      </span>
    </div>
  );
}
