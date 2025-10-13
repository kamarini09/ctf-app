"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sb } from "@/lib/supabase-browser";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);

    const { data, error } = await sb.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setErr(error.message);
      return;
    }

    // If email confirmations are ON, user may be null and an email is sent.
    if (!data.user) {
      setMsg("Check your email to confirm your account.");
      return;
    }

    // If confirmations are OFF, we have a session or need login
    setMsg("Account created! Redirecting…");
    router.replace("/dashboard");
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" required className="w-full border rounded px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" required minLength={6} className="w-full border rounded px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
        </div>

        <button type="submit" disabled={loading} className="w-full rounded bg-blue-600 text-white py-2 font-semibold disabled:opacity-60">
          {loading ? "Creating…" : "Create account"}
        </button>

        {err && <p className="text-red-600 text-sm">{err}</p>}
        {msg && <p className="text-green-700 text-sm">{msg}</p>}
      </form>

      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <a href="/login" className="text-blue-700 underline">
          Log in
        </a>
      </p>
    </main>
  );
}
