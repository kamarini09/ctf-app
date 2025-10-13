import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { joinCode, userId } = await req.json();
  if (!joinCode || !userId) {
    return NextResponse.json({ error: "Missing joinCode or userId" }, { status: 400 });
  }

  const admin = sbAdmin();
  const { data: team, error } = await admin.from("teams").select("id, name, code").eq("code", joinCode.trim().toUpperCase()).single();

  if (error || !team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  await admin.from("profiles").update({ team_id: team.id }).eq("id", userId);

  return NextResponse.json({ team });
}
