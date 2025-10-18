"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sb } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Load Fredoka once (you can move this to next/font later)
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
    // Supabase often returns "Invalid login credentials"
    if (!message) return "Login failed. Please try again.";
    if (/invalid login|invalid credentials/i.test(message)) return "Invalid email or password.";
    return message;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setErr(null);

    try {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        setErr(normalizeError(error.message));
        return;
      }
      const next = search.get("next") || "/";
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
            Log In
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
              <input id="password" name="password" type="password" autoComplete="current-password" required className="w-full border-2 border-gray-300 px-3 py-2 outline-none focus:border-[#FF5757]" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
            </div>

            <button type="submit" disabled={loading} aria-busy={loading} className="w-full bg-[#FF5757] px-4 py-2 font-medium text-white transition hover:bg-[#FF4444] disabled:opacity-60">
              {loading ? "Logging in…" : "Log in"}
            </button>

            {err && (
              <p role="alert" className="bg-red-100 px-3 py-2 text-sm text-red-700">
                {err}
              </p>
            )}

            <p className="text-center text-sm">
              No account?{" "}
              <a href="/signup" className="text-[#FF5757] underline underline-offset-2 hover:opacity-80">
                Sign up
              </a>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
