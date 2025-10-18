"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { sb } from "@/lib/supabase-browser";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  // Load Google Font (Fredoka One) once
  useEffect(() => {
    const href = "https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap";
    if (!document.querySelector(`link[href="${href}"]`)) {
      const fontLink = document.createElement("link");
      fontLink.href = href;
      fontLink.rel = "stylesheet";
      document.head.appendChild(fontLink);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await sb.auth.getUser();
      setUser(data.user ?? null);
    })();
  }, []);

  return (
    // Solid coral background, no gradient/vignette
    <main className="min-h-[calc(100vh-3.5rem)] bg-[#EB6B6B]">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="mb-6 text-center text-white" style={{ fontFamily: "Fredoka One, sans-serif", fontSize: "2.5rem" }}>
          Welcome to the CTF
        </h1>
        <p className="mb-12 text-center text-white/90">Read the rules, join a team, and start solving!</p>

        <section className="space-y-6 text-white">
          <p className="leading-relaxed text-white/95">
            <strong>CTFs</strong> (short for <em>capture the flag</em>) are a type of computer security competition. Contestants are presented with a set of challenges which test their creativity, technical (and AI) skills, and problem-solving ability. Challenges usually cover a number of categories, and when solved, each yields a string (called a <strong>flag</strong>) which is submitted to an online scoring service.
          </p>

          <p className="leading-relaxed text-white/95">CTFs are a great way to learn a wide array of computer security skills in a safe, legal environment, and are hosted and played by many security groups around the world for fun and practice.</p>

          <p className="leading-relaxed text-white/95">
            For <strong>KraliCTF</strong>, the questions are more general so everyone can join in and have fun 😊
          </p>

          <p className="leading-relaxed text-white/95">
            This CTF follows the <strong>Jeopardy</strong> style. Jeopardy style CTFs provide a list of challenges and award points to teams that complete the challenges. The team with the most points wins.{" "}
            <Link href="/rules" className="underline underline-offset-4 hover:opacity-80">
              Start by reading the rules
            </Link>
            .
          </p>
        </section>

        {/* Keep CTAs (only when logged out); style minimal to match screenshot */}
        {!user && (
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/login" className="rounded-md bg-white/15 px-4 py-2 text-white ring-1 ring-inset ring-white/30 hover:bg-white/20">
              Log in
            </Link>
            <Link href="/signup" className="rounded-md bg-white px-4 py-2 text-[#EB6B6B] hover:bg-white/90">
              Create account
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
