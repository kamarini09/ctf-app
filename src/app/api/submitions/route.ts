// Run safely on Edge or Node
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-server";

// Use Web Crypto (works on Edge/Node) instead of `import crypto from 'crypto'`
async function sha256Hex(input: string) {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const FLAG_RE = /^CTF\{[A-Za-z0-9_]{1,80}\}$/;

export async function POST(req: Request) {
  // Be tolerant to empty/invalid JSON so we never throw HTML
  let userId: string | undefined;
  let challengeId: string | undefined;
  let flag: string | undefined;

  try {
    const body = await req.json().catch(() => ({} as any));
    userId = body?.userId;
    challengeId = body?.challengeId;
    flag = body?.flag;
  } catch {
    // ignore; handled below
  }

  if (!userId || !challengeId || typeof flag !== "string") {
    return NextResponse.json({ ok: false, message: "Missing fields" }, { status: 400 });
  }

  const trimmed = flag.trim();
  if (!FLAG_RE.test(trimmed)) {
    return NextResponse.json({ ok: false, message: "Invalid flag format (use CTF{ANSWER})" }, { status: 400 });
  }

  try {
    const sb = sbAdmin(); // requires SUPABASE_SERVICE_ROLE_KEY to be set

    // 1) Load challenge (must be active, select hash)
    const { data: ch, error: chErr } = await sb.from("challenges").select("id, flag_hash, points, is_active").eq("id", challengeId).single();

    if (chErr || !ch) {
      return NextResponse.json({ ok: false, message: "Challenge not found" }, { status: 404 });
    }
    if (!ch.is_active) {
      return NextResponse.json({ ok: false, message: "Challenge is inactive" }, { status: 400 });
    }

    // 2) Require user to be on a team
    const { data: prof, error: profErr } = await sb.from("profiles").select("team_id").eq("id", userId).single();

    if (profErr || !prof) {
      return NextResponse.json({ ok: false, message: "Profile not found" }, { status: 400 });
    }
    if (!prof.team_id) {
      return NextResponse.json({ ok: false, message: "Join a team first." }, { status: 400 });
    }

    // 3) Check flag
    const hash = await sha256Hex(trimmed);
    const correct = hash === ch.flag_hash;
    if (!correct) {
      return NextResponse.json({ ok: true, correct: false });
    }

    // 4) Insert solve (idempotent)
    const { error: upErr } = await sb.from("submissions").upsert({ user_id: userId, team_id: prof.team_id, challenge_id: challengeId }, { onConflict: "user_id,challenge_id", ignoreDuplicates: true });

    if (upErr) {
      return NextResponse.json({ ok: false, message: upErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, correct: true, points: ch.points });
  } catch (e: any) {
    // Always return JSON on error
    return NextResponse.json({ ok: false, message: e?.message || "Server error" }, { status: 500 });
  }
}
