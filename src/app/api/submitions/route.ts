// src/app/api/submissions/route.ts
import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-server";
import crypto from "crypto";

const FLAG_RE = /^CTF\{[A-Za-z0-9_]{1,80}\}$/;
const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { userId, challengeId, flag } = await req.json();

    if (!userId || !challengeId || typeof flag !== "string") {
      return NextResponse.json({ ok: false, message: "Missing fields" }, { status: 400 });
    }

    const trimmed = flag.trim();
    if (!FLAG_RE.test(trimmed)) {
      return NextResponse.json({ ok: false, message: "Invalid flag format (use CTF{ANSWER})" }, { status: 400 });
    }

    const sb = sbAdmin();

    // 1) Load challenge (must be active)
    const { data: ch, error: chErr } = await sb.from("challenges").select("id, flag_hash, points, is_active").eq("id", challengeId).single();

    if (chErr || !ch) {
      return NextResponse.json({ ok: false, message: "Challenge not found" }, { status: 404 });
    }
    if (!ch.is_active) {
      return NextResponse.json({ ok: false, message: "Challenge is inactive" }, { status: 400 });
    }

    // 2) User must be on a team
    const { data: prof, error: profErr } = await sb.from("profiles").select("team_id").eq("id", userId).single();

    if (profErr) {
      return NextResponse.json({ ok: false, message: "Profile not found" }, { status: 400 });
    }
    if (!prof?.team_id) {
      return NextResponse.json({ ok: false, message: "Join a team first." }, { status: 400 });
    }

    // 3) Check correctness
    const correct = sha256(trimmed) === ch.flag_hash;
    if (!correct) {
      return NextResponse.json({ ok: true, correct: false });
    }

    // 4) Insert solve (idempotent: ignore if already solved by this user)
    const row = {
      user_id: userId as string,
      team_id: prof.team_id as string,
      challenge_id: challengeId as string,
    };

    const { error: upErr } = await sb.from("submissions").upsert(row, { onConflict: "user_id,challenge_id", ignoreDuplicates: true });

    if (upErr) {
      return NextResponse.json({ ok: false, message: upErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, correct: true, points: ch.points });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "Server error" }, { status: 500 });
  }
}
