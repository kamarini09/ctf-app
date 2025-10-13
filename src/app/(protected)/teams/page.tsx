"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sb } from "@/lib/supabase-browser";

type Team = { id: string; name: string; code: string };

export default function TeamsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // require auth (client-side)
  useEffect(() => {
    sb.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (!user) {
        router.replace("/login");
        return;
      }
      setUserId(user.id);

      // load current team
      const { data: prof } = await sb.from("profiles").select("team_id").eq("id", user.id).single();

      if (prof?.team_id) {
        const { data: t } = await sb.from("teams").select("id, name, code").eq("id", prof.team_id).single();
        if (t) setTeam(t as Team);
      }
      setLoading(false);
    });
  }, [router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setErr(null);
    setMsg(null);
    const res = await fetch("/api/teams/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), userId }),
    });
    const json = await res.json();
    if (!res.ok) {
      setErr(json.error || "Failed to create team");
      return;
    }
    setTeam(json.team);
    setMsg("Team created!");
    setName("");
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setErr(null);
    setMsg(null);
    const res = await fetch("/api/teams/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ joinCode, userId }),
    });
    const json = await res.json();
    if (!res.ok) {
      setErr(json.error || "Failed to join team");
      return;
    }
    setTeam(json.team);
    setMsg("Joined team!");
    setJoinCode("");
  };

  if (loading) return <main className="max-w-3xl mx-auto p-6">Loading…</main>;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Teams</h1>

      {team ? (
        <section className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Your Team</h2>
          <p className="mb-1">
            <span className="font-medium">Name:</span> {team.name}
          </p>
          <p className="mb-1">
            <span className="font-medium">Join code:</span> <code>{team.code}</code>
          </p>
        </section>
      ) : (
        <p>You’re not in a team yet. Create one or join with a code.</p>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={handleCreate} className="border rounded p-4 space-y-3">
          <h3 className="font-semibold">Create a team</h3>
          <input className="w-full border rounded px-3 py-2" placeholder="Team name" value={name} onChange={(e) => setName(e.target.value)} required />
          <button className="w-full bg-blue-600 text-white rounded py-2 font-semibold">Create</button>
        </form>

        <form onSubmit={handleJoin} className="border rounded p-4 space-y-3">
          <h3 className="font-semibold">Join with code</h3>
          <input className="w-full border rounded px-3 py-2 uppercase" placeholder="ABC123" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} required />
          <button className="w-full bg-green-600 text-white rounded py-2 font-semibold">Join</button>
        </form>
      </div>

      {err && <p className="text-red-600">{err}</p>}
      {msg && <p className="text-green-700">{msg}</p>}
    </main>
  );
}
