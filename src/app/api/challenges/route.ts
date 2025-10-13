import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-server";

export async function GET() {
  const sb = sbAdmin();
  const { data, error } = await sb.from("challenges").select("id, title, points").eq("is_active", true).order("points", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
