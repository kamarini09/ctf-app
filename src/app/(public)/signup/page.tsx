// app/signup/page.tsx
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

      if (!data.user) {
        setMsg("Check your email to confirm your account.");
        return;
      }

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
      {/* Double-border, square edges */}
      <section className="double-border">
        <div className="inner px-6 py-6">
          <h1 className="font-display text-center text-2xl text-[var(--ctf-red)] mb-4">Sign Up</h1>

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
              <input id="password" name="new-password" type="password" autoComplete="new-password" required minLength={6} className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
            </div>

            <div>
              <label htmlFor="display-name" className="mb-1 block text-sm">
                Display name
              </label>
              <input id="display-name" name="name" type="text" autoComplete="nickname" required className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., CyberNinja" />
            </div>

            <button type="submit" disabled={loading} aria-busy={loading} className="btn btn-solid w-full focus-ring">
              {loading ? "Creating…" : "Create account"}
            </button>

            {err && (
              <p role="alert" className="mt-3 border-2 border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {err}
              </p>
            )}
            {msg && (
              <p role="status" className="mt-3 border-2 border-[var(--ctf-red)] bg-white px-3 py-2 text-sm text-[var(--ctf-red)]">
                {msg}
              </p>
            )}

            <p className="text-center text-sm">
              Already have an account?{" "}
              <a href={`/login${search.get("next") ? `?next=${encodeURIComponent(search.get("next")!)}` : ""}`} className="text-brand hover:opacity-80 focus-ring">
                Log in
              </a>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
