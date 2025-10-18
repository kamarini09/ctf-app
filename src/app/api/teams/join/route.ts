// app/api/teams/join/route.ts
import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-server";

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const noStore = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export async function POST(req: Request) {
  const { joinCode, userId } = await req.json().catch(() => ({}));
  if (!joinCode || !userId) {
    return NextResponse.json({ error: "Missing joinCode or userId" }, { status: 400, headers: noStore });
  }

  const admin = sbAdmin();
  const code = String(joinCode).trim().toUpperCase();

  const { data: team, error } = await admin.from("teams").select("id, name, code").eq("code", code).single();

  if (error || !team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404, headers: noStore });
  }

  await admin.from("profiles").update({ team_id: team.id }).eq("id", userId);

  return NextResponse.json({ team }, { headers: noStore });
}
