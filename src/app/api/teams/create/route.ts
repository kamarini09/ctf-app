// app/api/teams/create/route.ts
import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-server";
import { randomCode } from "@/lib/randomCode";

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const noStore = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export async function POST(req: Request) {
  const { name, userId } = await req.json().catch(() => ({}));
  if (!name || !userId) {
    return NextResponse.json({ error: "Missing name or userId" }, { status: 400, headers: noStore });
  }

  const admin = sbAdmin();
  const code = randomCode(6);

  const { data: team, error } = await admin.from("teams").insert({ name, code, created_by: userId }).select("*").single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400, headers: noStore });
  }

  await admin.from("profiles").update({ team_id: team.id }).eq("id", userId);

  return NextResponse.json({ team }, { headers: noStore });
}
