import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-server";
import { randomCode } from "@/lib/randomCode";

export async function POST(req: Request) {
  const { name, userId } = await req.json();
  if (!name || !userId) {
    return NextResponse.json({ error: "Missing name or userId" }, { status: 400 });
  }

  const admin = sbAdmin();
  const join_code = randomCode(6);

  const { data: team, error } = await admin.from("teams").insert({ name, join_code, created_by: userId }).select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await admin.from("profiles").update({ team_id: team.id }).eq("id", userId);

  return NextResponse.json({ team });
}
