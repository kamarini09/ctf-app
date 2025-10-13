import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-server";

export async function GET() {
  const sb = sbAdmin();

  // 1) Fetch all teams (so teams with 0 points still show up)
  const { data: teams, error: teamErr } = await sb.from("teams").select("id, name");
  if (teamErr) return NextResponse.json({ error: teamErr.message }, { status: 500 });

  // 2) Fetch all solves joined with challenge points
  const { data: solves, error: solveErr } = await sb.from("submissions").select("team_id, challenges(points)").not("team_id", "is", null);
  if (solveErr) return NextResponse.json({ error: solveErr.message }, { status: 500 });

  // 3) Reduce points per team
  const scores = new Map<string, number>();
  for (const row of (solves ?? []) as any[]) {
    const tid = row.team_id as string;
    const pts = row.challenges?.points ?? 0;
    scores.set(tid, (scores.get(tid) ?? 0) + pts);
  }

  // 4) Build full list with zeros, sort desc
  const out = (teams ?? []).map((t) => ({ id: t.id, name: t.name, score: scores.get(t.id) ?? 0 })).sort((a, b) => b.score - a.score);

  return NextResponse.json(out);
}
