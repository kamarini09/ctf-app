"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sb } from "@/lib/supabase-browser";

type TeamRow = { id: string; name: string; score: number; members: { id: string; display_name: string }[] };

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
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Team Leaderboard</h1>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Team</th>
              <th className="px-3 py-2 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-3 py-3">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-3">
                  No teams yet.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={r.id} className="odd:bg-white even:bg-gray-50 align-top">
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">
                    <div className="font-semibold">{r.name}</div>
                    {r.members.length ? (
                      <div className="mt-1 text-gray-600">
                        <span className="text-xs uppercase tracking-wide">Members:</span>
                        <ul className="mt-1 flex flex-wrap gap-2">
                          {r.members.map((m) => (
                            <li key={m.id} className="rounded border px-2 py-0.5 text-xs">
                              {m.display_name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-gray-500">No members yet</div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold">{r.score}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
