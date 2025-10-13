"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRouter } from "next/navigation";
import { sb } from "@/lib/supabase-browser";

export default function DashboardPage() {
  const router = useRouter();
  const { loading, email } = useRequireAuth();

  const handleLogout = async () => {
    await sb.auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return <main className="max-w-3xl mx-auto p-6">Loading…</main>;
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-6">Welcome{email ? `, ${email}` : ""}!</p>
      <button onClick={handleLogout} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">
        Log Out
      </button>
    </main>
  );
}
