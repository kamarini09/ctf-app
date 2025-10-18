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
  const { path } = await req.json().catch(() => ({}));

  if (!path || typeof path !== "string") {
    return NextResponse.json({ error: "Missing path" }, { status: 400, headers: noStore });
  }

  const sb = sbAdmin();
  const { data, error } = await sb.storage.from("attachments").createSignedUrl(path, 60 * 5); // 5 minutes

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400, headers: noStore });
  }

  return NextResponse.json({ url: data.signedUrl }, { headers: noStore });
}
