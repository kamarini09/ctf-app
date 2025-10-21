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
    <main className="min-h-[calc(100vh-3.5rem)] bg-[var(--ctf-red)]">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="font-display text-center text-white text-4xl md:text-5xl mb-6">Welcome to the KvaliCTF</h1>

        <p className="text-center text-white mb-12 opacity-90">Read the rules, join a team, and start solving!</p>

        <section className="space-y-6 text-white">
          <p className="leading-relaxed opacity-95">
            <strong>CTFs</strong> (short for <em>capture the flag</em>) are a type of computer security competition. Contestants are presented with a set of challenges which test their creativity, technical (and AI) skills, and problem-solving ability. Challenges usually cover a number of categories, and when solved, each yields a string (called a <strong>flag</strong>) which is submitted to an online scoring service.
          </p>

          <p className="leading-relaxed opacity-95">CTFs are a great way to learn a wide array of computer security skills in a safe, legal environment, and are hosted and played by many security groups around the world for fun and practice.</p>

          <p className="leading-relaxed opacity-95">
            For <strong>KvaliCTF</strong>, the questions are more general so everyone can join in and have fun 😊
          </p>

          <p className="leading-relaxed opacity-95">
            This CTF follows the <strong>Jeopardy</strong> style. Jeopardy style CTFs provide a list of challenges and award points to teams that complete the challenges. The team with the most points wins.{" "}
            <Link href="/rules" className="font-medium underline underline-offset-4 hover:opacity-80 focus-ring">
              Start by reading the rules
            </Link>
            .
          </p>
        </section>

        {!user && (
          <div className="mt-8 flex justify-center gap-3">
            {/* Outline-on-dark: ghost + white border/text */}
            <Link href="/login" className="btn btn-ghost border border-white text-white hover:bg-white/10 focus-ring">
              Log in
            </Link>

            {/* Solid inverse CTA */}
            <Link href="/signup" className="btn bg-white text-[var(--ctf-red)] hover:bg-white/90 focus-ring">
              Create account
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
