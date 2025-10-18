"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sb } from "@/lib/supabase-browser";

export default function SignupPage() {
  const router = useRouter();
  const search = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Load Fredoka once (can move to next/font later)
  useEffect(() => {
    const href = "https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap";
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement("link");
      link.href = href;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  // If already signed in, bounce to next or home
  useEffect(() => {
    (async () => {
      const { data } = await sb.auth.getSession();
      if (data.session?.user) {
        const next = search.get("next") || "/";
        router.replace(next);
      }
    })();
  }, [router, search]);

  const normalizeError = (message?: string) => {
    if (!message) return "Sign up failed. Please try again.";
    if (/user already registered/i.test(message)) return "An account with this email already exists.";
    if (/password/i.test(message) && /short|weak|least/i.test(message)) return "Password is too weak. Use at least 6 characters.";
    return message;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErr(null);
    setMsg(null);

    try {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { display_name: name } },
      });

      if (error) {
        setErr(normalizeError(error.message));
        return;
      }

      // If email confirmations are ON, Supabase returns no user/session
      if (!data.user) {
        setMsg("Check your email to confirm your account.");
        return;
      }

      // If confirmations are OFF, redirect to next (or home)
      const next = search.get("next") || "/";
      setMsg("Account created! Redirecting…");
      router.replace(next);
    } catch (e: any) {
      setErr(normalizeError(e?.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      {/* Double-coral bordered box, square edges */}
      <section className="border-2 border-[#FF5757] bg-white p-1">
        <div className="border-2 border-[#FF5757] bg-white px-6 py-6">
          <h1 className="mb-4 text-center text-[#FF5757]" style={{ fontFamily: "Fredoka One, sans-serif" }}>
            Sign Up
          </h1>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm">
                Email
              </label>
              <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required className="w-full border-2 border-gray-300 px-3 py-2 outline-none focus:border-[#FF5757]" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm">
                Password
              </label>
              <input id="password" name="new-password" type="password" autoComplete="new-password" required minLength={6} className="w-full border-2 border-gray-300 px-3 py-2 outline-none focus:border-[#FF5757]" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
            </div>

            <div>
              <label htmlFor="display-name" className="mb-1 block text-sm">
                Display name
              </label>
              <input id="display-name" name="name" type="text" autoComplete="nickname" required className="w-full border-2 border-gray-300 px-3 py-2 outline-none focus:border-[#FF5757]" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., CyberNinja" />
            </div>

            <button type="submit" disabled={loading} aria-busy={loading} className="w-full bg-[#FF5757] px-4 py-2 font-medium text-white transition hover:bg-[#FF4444] disabled:opacity-60">
              {loading ? "Creating…" : "Create account"}
            </button>

            {err && (
              <p role="alert" className="bg-red-100 px-3 py-2 text-sm text-red-700">
                {err}
              </p>
            )}
            {msg && (
              <p role="status" className="border border-[#FF5757] bg-white px-3 py-2 text-sm text-[#FF5757]">
                {msg}
              </p>
            )}

            <p className="text-center text-sm">
              Already have an account?{" "}
              <a href={`/login${search.get("next") ? `?next=${encodeURIComponent(search.get("next")!)}` : ""}`} className="text-[#FF5757] underline underline-offset-2 hover:opacity-80">
                Log in
              </a>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
