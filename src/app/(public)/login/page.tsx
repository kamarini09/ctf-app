// app/login/page.tsx
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
      {/* Double-border, square edges */}
      <section className="double-border">
        <div className="inner px-6 py-6">
          <h1 className="font-display text-center text-2xl text-[var(--ctf-red)] mb-4">Log In</h1>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm">
                Email
              </label>
              <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm">
                Password
              </label>
              <input id="password" name="password" type="password" autoComplete="current-password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
            </div>

            <button type="submit" disabled={loading} aria-busy={loading} className="btn btn-solid w-full focus-ring">
              {loading ? "Logging in…" : "Log in"}
            </button>

            {err && (
              <p role="alert" className="mt-3 border-2 border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {err}
              </p>
            )}

            <p className="text-center text-sm">
              No account?{" "}
              <a href="/signup" className="text-brand hover:opacity-80 focus-ring">
                Sign up
              </a>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
