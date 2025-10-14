import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-server";

type Params = { id: string };

// In Next.js latest, `params` is async in route handlers.
export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  const { id } = await params;

  const sb = sbAdmin();
  const { data, error } = await sb.from("challenges").select("id, title, description, points, attachment_url, link_url, is_active").eq("id", id).single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!data.is_active) return NextResponse.json({ error: "Inactive" }, { status: 404 });

  const { is_active, ...safe } = data; // never return flag_hash
  return NextResponse.json(safe);
}
