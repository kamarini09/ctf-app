"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sb } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const { error } = await sb.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setErr(error.message);
      return;
    }

    router.replace("/");
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Log In</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" required className="w-full border rounded px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" required className="w-full border rounded px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
        </div>

        <button type="submit" disabled={loading} className="w-full rounded bg-violet-600 text-white py-2 font-semibold disabled:opacity-60">
          {loading ? "Loging in…" : "Log in"}
        </button>

        {err && <p className="text-red-600 text-sm">{err}</p>}
      </form>

      <p className="mt-4 text-sm">
        No account?{" "}
        <a href="/signup" className="text-violet-600 underline">
          Sign up
        </a>
      </p>
    </main>
  );
}
