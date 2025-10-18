// app/api/me/solves/route.ts
import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-server";

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const noStore = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400, headers: noStore });
  }

  const sb = sbAdmin();

  // Find user's team
  const { data: prof, error: pErr } = await sb.from("profiles").select("team_id").eq("id", userId).single();

  // No team or profile error → return empty list
  if (pErr || !prof?.team_id) {
    return NextResponse.json([], { headers: noStore });
  }

  // All solves for that team → list of challenge IDs
  const { data, error } = await sb.from("submissions").select("challenge_id").eq("team_id", prof.team_id);

  if (error) {
    return NextResponse.json([], { status: 200, headers: noStore });
  }

  return NextResponse.json(
    (data ?? []).map((r) => r.challenge_id),
    { headers: noStore }
  );
}
