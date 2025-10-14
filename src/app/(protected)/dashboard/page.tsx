"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { sb } from "@/lib/supabase-browser";

export default function DashboardPage() {
  const { loading } = useRequireAuth();
  const [displayName, setDisplayName] = useState<string>("Player");

  useEffect(() => {
    (async () => {
      const { data } = await sb.auth.getUser();
      const user = data.user;
      if (!user) return;
      const { data: prof } = await sb.from("profiles").select("display_name").eq("id", user.id).single();
      if (prof?.display_name) setDisplayName(prof.display_name);
      else if (user.email) setDisplayName(user.email);
    })();
  }, []);

  if (loading) return <main className="max-w-3xl mx-auto p-6">Loading…</main>;

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6 min-h-[calc(100vh-3.5rem)]">
      <header className="pt-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{displayName}, welcome to KvaliCTF 👋</h1>
      </header>

      {/* Email-like card with purple top bar */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="h-1.5 rounded-t-2xl bg-violet-600" />
        <div className="p-6 leading-relaxed text-gray-800">
          <p className="mb-3">
            <strong>CTFs</strong> (short for <em>capture the flag</em>) are a type of computer security competition. Contestants are presented with a set of challenges which test their creativity, technical (and AI) skills, and problem-solving ability. Challenges usually cover a number of categories, and when solved, each yields a string (called a <strong>flag</strong>) which is submitted to an online scoring service.
          </p>
          <p className="mb-3">CTFs are a great way to learn a wide array of computer security skills in a safe, legal environment, and are hosted and played by many security groups around the world for fun and practice.</p>
          <p className="mb-3">
            For <strong>KvaliCTF</strong>, the questions are more general so everyone can join in and have fun 😊
          </p>
          <p className="mb-0">
            This CTF follows the <strong>Jeopardy</strong> style. Jeopardy style CTFs provide a list of challenges and award points to teams that complete the challenges. The team with the most points wins.
          </p>

          {/* Inline CTA, no buttons */}
          <p className="mt-6">
            Ready to get started?{" "}
            <Link href="/rules" className="font-medium text-violet-700 underline decoration-2 underline-offset-2 hover:text-violet-800">
              Start by reading the rules
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
