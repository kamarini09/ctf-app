"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sb } from "@/lib/supabase-browser";

type TeamRow = { id: string; name: string; score: number };

export default function LeaderboardPage() {
  const router = useRouter();
  const [rows, setRows] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);

  // simple auth guard
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
    <main className="max-w-3xl mx-auto p-6">
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
                <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">{r.name}</td>
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
