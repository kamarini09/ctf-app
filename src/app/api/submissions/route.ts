// app/api/submissions/route.ts
import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-server";

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const noStore = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

// Web Crypto hash (Edge/Node)
async function sha256Hex(input: string) {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const FLAG_RE = /^KCTF\{[A-Za-z0-9_]{1,80}\}$/;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body?.userId as string | undefined;
    const challengeId = body?.challengeId as string | undefined;
    const flag = body?.flag as string | undefined;

    if (!userId || !challengeId || typeof flag !== "string") {
      return NextResponse.json({ ok: false, message: "Missing fields" }, { status: 400, headers: noStore });
    }

    const trimmed = flag.trim();
    if (!FLAG_RE.test(trimmed)) {
      return NextResponse.json({ ok: false, message: "Invalid flag format (use KCTF{ANSWER})" }, { status: 400, headers: noStore });
    }

    const sb = sbAdmin();

    // Challenge (active + hash)
    const { data: ch, error: chErr } = await sb.from("challenges").select("id, flag_hash, points, is_active").eq("id", challengeId).single();

    if (chErr || !ch) {
      return NextResponse.json({ ok: false, message: "Challenge not found" }, { status: 404, headers: noStore });
    }
    if (!ch.is_active) {
      return NextResponse.json({ ok: false, message: "Challenge inactive" }, { status: 400, headers: noStore });
    }

    // User must be on a team
    const { data: prof, error: profErr } = await sb.from("profiles").select("team_id").eq("id", userId).single();

    if (profErr || !prof) {
      return NextResponse.json({ ok: false, message: "Profile not found" }, { status: 400, headers: noStore });
    }
    if (!prof.team_id) {
      return NextResponse.json({ ok: false, message: "Join a team first." }, { status: 400, headers: noStore });
    }

    // Check flag correctness
    const correct = (await sha256Hex(trimmed)) === ch.flag_hash;
    if (!correct) {
      return NextResponse.json({ ok: true, correct: false }, { headers: noStore });
    }

    // Already solved by this team?
    const { data: existing } = await sb.from("submissions").select("id").eq("team_id", prof.team_id).eq("challenge_id", challengeId).maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          ok: true,
          correct: true,
          alreadySolved: true,
          message: "Correct — but your team already solved this.",
          points: ch.points,
        },
        { headers: noStore }
      );
    }

    // Insert team solve (idempotent) — requires UNIQUE(team_id, challenge_id)
    const { error: upErr } = await sb.from("submissions").upsert({ user_id: userId, team_id: prof.team_id, challenge_id: challengeId }, { onConflict: "team_id,challenge_id", ignoreDuplicates: true });

    if (upErr) {
      return NextResponse.json({ ok: false, message: upErr.message }, { status: 400, headers: noStore });
    }

    return NextResponse.json({ ok: true, correct: true, points: ch.points }, { headers: noStore });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "Server error" }, { status: 500, headers: noStore });
  }
}
