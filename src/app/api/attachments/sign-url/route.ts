import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { path } = await req.json();
  if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  const sb = sbAdmin();
  const { data, error } = await sb.storage.from("attachments").createSignedUrl(path, 60 * 5);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ url: data.signedUrl });
}
