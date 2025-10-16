"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { sb } from "@/lib/supabase-browser";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await sb.auth.getUser();
      setUser(data.user ?? null);
    })();
  }, []);

  return (
    // Full-page violet gradient, no card
    <main className="relative min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-violet-600 via-violet-700 to-purple-800">
      {/* depth: top highlight & vignette */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-white/30" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_400px_at_30%_0%,rgba(255,255,255,0.18),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_800px_at_80%_120%,rgba(0,0,0,0.35),transparent)]" />

      <div className="relative mx-auto max-w-3xl p-6">
        {/* White text with depth */}
        <h1 className="mb-3 text-3xl font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">Welcome to the CTF</h1>
        <p className="mb-8 text-white/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]">Read the rules, join a team, and start solving!</p>

        {/* Content copy (white), no card */}
        <section className="leading-relaxed text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]">
          <p className="mb-3">
            <strong className="text-white">CTFs</strong> (short for <em>capture the flag</em>) are a type of computer security competition. Contestants are presented with a set of challenges which test their creativity, technical (and AI) skills, and problem-solving ability. Challenges usually cover a number of categories, and when solved, each yields a string (called a <strong className="text-white">flag</strong>) which is submitted to an online scoring service.
          </p>
          <p className="mb-3">CTFs are a great way to learn a wide array of computer security skills in a safe, legal environment, and are hosted and played by many security groups around the world for fun and practice.</p>
          <p className="mb-3">
            For <strong className="text-white">KvaliCTF</strong>, the questions are more general so everyone can join in and have fun 😊
          </p>
          <p className="mb-6">
            This CTF follows the <strong className="text-white">Jeopardy</strong> style. Jeopardy style CTFs provide a list of challenges and award points to teams that complete the challenges. The team with the most points wins.{" "}
            <Link href="/rules" className="font-semibold text-white underline underline-offset-4 hover:text-white/90">
              Start by reading the rules
            </Link>
            .
          </p>
        </section>

        {/* CTA at the end (only when logged out) */}
        {!user && (
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-lg bg-white/15 px-4 py-2 text-white ring-1 ring-inset ring-white/30 backdrop-blur hover:bg-white/20">
              Log in
            </Link>
            <Link href="/signup" className="rounded-lg bg-white px-4 py-2 text-violet-700 hover:bg-violet-50">
              Create account
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
