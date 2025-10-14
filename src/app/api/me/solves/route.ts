import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const sb = sbAdmin();

  // Find user's team
  const { data: prof, error: pErr } = await sb.from("profiles").select("team_id").eq("id", userId).single();

  if (pErr || !prof?.team_id) return NextResponse.json([]);

  // All solves for that team → list of challenge IDs
  const { data, error } = await sb.from("submissions").select("challenge_id").eq("team_id", prof.team_id);

  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json((data ?? []).map((r) => r.challenge_id));
}
