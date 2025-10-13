import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-server";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const sb = sbAdmin();
  const { data, error } = await sb.from("challenges").select("id, title, prompt, points, attachment_url, link_url, is_active").eq("id", params.id).single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!data.is_active) return NextResponse.json({ error: "Inactive" }, { status: 404 });

  // never return flag_hash
  const { is_active, ...safe } = data;
  return NextResponse.json(safe);
}
