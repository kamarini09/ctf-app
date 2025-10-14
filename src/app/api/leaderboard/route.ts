import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-server";

export async function GET() {
  const sb = sbAdmin();

  // All teams (so teams with 0 points still appear)
  const { data: teams, error: teamErr } = await sb.from("teams").select("id, name");
  if (teamErr) return NextResponse.json({ error: teamErr.message }, { status: 500 });

  // Members by team — ONLY display_name (no email fallback)
  const { data: members, error: memErr } = await sb.from("profiles").select("id, display_name, team_id");
  if (memErr) return NextResponse.json({ error: memErr.message }, { status: 500 });

  // Solves with points
  const { data: solves, error: solErr } = await sb.from("submissions").select("team_id, challenges(points)");
  if (solErr) return NextResponse.json({ error: solErr.message }, { status: 500 });

  // Aggregate points per team
  const scores = new Map<string, number>();
  for (const row of (solves ?? []) as any[]) {
    const tid = row.team_id as string | null;
    if (!tid) continue;
    const pts = row.challenges?.points ?? 0;
    scores.set(tid, (scores.get(tid) ?? 0) + pts);
  }

  // Group members per team — keep only display_name (or show 'Unnamed')
  const membersByTeam = new Map<string, Array<{ id: string; display_name: string }>>();
  for (const m of (members ?? []) as any[]) {
    const tid = m.team_id as string | null;
    if (!tid) continue;
    const name = (m.display_name ?? "").trim();
    const arr = membersByTeam.get(tid) ?? [];
    arr.push({ id: m.id, display_name: name || "Unnamed" });
    membersByTeam.set(tid, arr);
  }

  const out = (teams ?? [])
    .map((t) => ({
      id: t.id,
      name: t.name,
      score: scores.get(t.id) ?? 0,
      members: (membersByTeam.get(t.id) ?? []).sort((a, b) => a.display_name.localeCompare(b.display_name)),
    }))
    .sort((a, b) => b.score - a.score);

  return NextResponse.json(out);
}
