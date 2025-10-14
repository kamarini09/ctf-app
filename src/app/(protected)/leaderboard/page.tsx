"use client";

import { useEffect, useState } from "react";
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

  return (
    <main className="mx-auto max-w-5xl p-6">
      <header className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Team Leaderboard</h1>
        <p className="mt-1 text-sm text-gray-600">Points update as flags are submitted.</p>
      </header>

      {/* Card */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Purple accent bar */}
        <div className="h-1.5 w-full bg-violet-600" />

        {/* Table wrapper for horizontal scroll on small screens */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-700">
                <th scope="col" className="px-4 py-3 w-14">
                  #
                </th>
                <th scope="col" className="px-4 py-3 min-w-[220px]">
                  Team
                </th>
                <th scope="col" className="px-4 py-3 text-right w-24">
                  Score
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} aria-busy="true">
                      <td className="px-4 py-4">
                        <div className="h-3 w-5 animate-pulse rounded bg-gray-200" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                        <div className="mt-2 flex gap-2">
                          <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200" />
                          <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="ml-auto h-4 w-10 animate-pulse rounded bg-gray-200" />
                      </td>
                    </tr>
                  ))}
                </>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-600">
                    No teams yet — be the first to create one and grab the top spot ✨
                  </td>
                </tr>
              ) : (
                rows
                  .slice()
                  .sort((a, b) => b.score - a.score)
                  .map((r, i) => (
                    <tr key={r.id} className="align-top hover:bg-gray-50/60">
                      <td className="px-4 py-4">
                        <RankBadge rank={i + 1} />
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-900">{r.name}</div>

                        {r.members.length ? (
                          <div className="mt-1 text-gray-600">
                            <span className="text-xs uppercase tracking-wide">Members</span>
                            <ul className="mt-1 flex flex-wrap gap-1.5">
                              {r.members.map((m) => (
                                <li key={m.id} className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700" title={m.display_name}>
                                  {m.display_name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="mt-1 text-xs text-gray-500">No members yet</div>
                        )}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <span className="inline-flex items-center justify-end rounded-md bg-violet-50 px-2.5 py-1 text-sm font-semibold text-violet-700 ring-1 ring-inset ring-violet-100">{r.score}</span>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* footer note */}
        {!loading && rows.length > 0 && <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-500">Ties are shown by rank order but share the same score.</div>}
      </section>
    </main>
  );
}

/* --- Small presentational component: rank badge --- */
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-gray-900 font-bold" aria-label="Rank 1" title="1st place">
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-300 text-gray-900 font-bold" aria-label="Rank 2" title="2nd place">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-300 text-gray-900 font-bold" aria-label="Rank 3" title="3rd place">
        3
      </span>
    );
  }
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-700 font-semibold ring-1 ring-inset ring-gray-200" aria-label={`Rank ${rank}`} title={`${rank} place`}>
      {rank}
    </span>
  );
}
