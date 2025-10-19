// app/signup/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sb } from "@/lib/supabase-browser";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // If already signed in, go home
  useEffect(() => {
    (async () => {
      const { data } = await sb.auth.getSession();
      if (data.session?.user) router.replace("/");
    })();
  }, [router]);

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

      // If confirmations are OFF, take them home
      setMsg("Account created! Redirecting…");
      router.replace("/");
    } catch (e: any) {
      setErr(normalizeError(e?.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <section className="double-border">
        <div className="inner px-6 py-6">
          <h1 className="font-display mb-4 text-center text-brand">Sign Up</h1>

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

            <button type="submit" disabled={loading} aria-busy={loading} className="btn btn-solid w-full disabled:opacity-60 focus-ring">
              {loading ? "Creating…" : "Create account"}
            </button>

            {err && (
              <p role="alert" className="border-2 border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {err}
              </p>
            )}
            {msg && (
              <p role="status" className="border-2 border-[var(--ctf-red)] bg-white px-3 py-2 text-sm text-[var(--ctf-red)]">
                {msg}
              </p>
            )}

            <p className="text-center text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-brand underline underline-offset-2 hover:opacity-80">
                Log in
              </a>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
