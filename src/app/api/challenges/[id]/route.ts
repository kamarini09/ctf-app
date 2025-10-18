import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-server";

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const noStore = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

type Params = { id: string };

// In Next.js latest, `params` can be async in route handlers.
export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  const { id } = await params;

  const sb = sbAdmin();
  const { data, error } = await sb.from("challenges").select("id, title, description, points, attachment_url, link_url, is_active").eq("id", id).single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: noStore });
  }
  if (!data.is_active) {
    return NextResponse.json({ error: "Inactive" }, { status: 404, headers: noStore });
  }

  const { is_active, ...safe } = data; // do not return flag_hash
  return NextResponse.json(safe, { headers: noStore });
}
