import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-server";

// Opt out of all caching for this route file
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const noStore = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export async function GET() {
  const sb = sbAdmin();
  const { data, error } = await sb.from("challenges").select("id, title, points").eq("is_active", true).order("points", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: noStore });
  }

  return NextResponse.json(data ?? [], { headers: noStore });
}
