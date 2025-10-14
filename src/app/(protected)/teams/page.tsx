"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sb } from "@/lib/supabase-browser";

type Team = { id: string; name: string; code: string };
type Member = { id: string; display_name: string | null };

export default function TeamsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [team, setTeam] = useState<Team | null>(null);

  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [submittingJoin, setSubmittingJoin] = useState(false);

  // per-card messages
  const [createErr, setCreateErr] = useState<string | null>(null);
  const [joinErr, setJoinErr] = useState<string | null>(null);
  const [createMsg, setCreateMsg] = useState<string | null>(null);
  const [joinMsg, setJoinMsg] = useState<string | null>(null);

  // NEW: team members
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    sb.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (!user) {
        router.replace("/login");
        return;
      }
      setUserId(user.id);

      const { data: prof } = await sb.from("profiles").select("team_id").eq("id", user.id).single();

      if (prof?.team_id) {
        const { data: t } = await sb.from("teams").select("id, name, code").eq("id", prof.team_id).single();
        if (t) setTeam(t as Team);
      }
      setLoading(false);
    });
  }, [router]);

  // NEW: load members when we have a team
  useEffect(() => {
    if (!team?.id) {
      setMembers([]);
      return;
    }
    setLoadingMembers(true);
    sb.from("profiles")
      .select("id, display_name")
      .eq("team_id", team.id)
      .order("display_name", { ascending: true, nullsFirst: false })
      .then(({ data }) => {
        setMembers((data || []) as Member[]);
      })
      .finally(() => setLoadingMembers(false));
  }, [team?.id]);

  const hasTeam = Boolean(team);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateErr(null);
    setCreateMsg(null);

    if (hasTeam) {
      setCreateErr("You have already created a team!");
      return;
    }
    if (!userId || submittingCreate) return;

    setSubmittingCreate(true);
    const res = await fetch("/api/teams/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), userId }),
    });
    const json = await res.json();

    if (!res.ok) {
      setCreateErr(json.error || "Failed to create team");
      setSubmittingCreate(false);
      return;
    }
    setTeam(json.team);
    setCreateMsg("Team created!");
    setName("");
    setSubmittingCreate(false);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinErr(null);
    setJoinMsg(null);
    if (!userId || submittingJoin) return;

    setSubmittingJoin(true);
    const res = await fetch("/api/teams/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ joinCode, userId }),
    });
    const json = await res.json();

    if (!res.ok) {
      setJoinErr(json.error || "Failed to join team");
      setSubmittingJoin(false);
      return;
    }
    setTeam(json.team);
    setJoinMsg("Joined team!");
    setJoinCode("");
    setSubmittingJoin(false);
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCreateMsg("Join code copied to clipboard");
    } catch {
      setCreateErr("Could not copy the code");
    }
  };

  if (loading) return <main className="mx-auto max-w-3xl p-6">Loading…</main>;

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Teams</h1>
        <p className="mt-1 text-sm text-gray-600">Create a team or join with a code.</p>
      </header>

      {/* Grid: left spans two rows; right has two violet cards */}
      <section className="grid gap-6 md:grid-cols-2 md:grid-rows-2">
        {/* LEFT: My Team (row-span-2) with members */}
        <section className="md:row-span-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-violet-600 p-6">
            <h2 className="text-xl font-semibold text-white">Your Team</h2>
            <p className="mt-1 text-sm text-violet-100">Manage your team and share the join code.</p>
          </div>

          <div className="p-6">
            {team ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500">Team name</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900">{team.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-wide text-gray-500">Join code</div>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="rounded-md bg-gray-50 px-2 py-1 text-sm ring-1 ring-inset ring-gray-200">{team.code}</code>
                      <button onClick={() => copyCode(team.code)} className="rounded-md bg-gray-100 px-2 py-1 text-sm hover:bg-gray-200">
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                {/* NEW: Members list */}
                <div className="mt-6">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Members</div>

                  {loadingMembers ? (
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <li key={i} className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
                      ))}
                    </ul>
                  ) : members.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-500">No members yet</p>
                  ) : (
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {members.map((m) => (
                        <li key={m.id} className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700" title={m.display_name || "Member"}>
                          {m.display_name || "Unnamed"}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <p className="mt-6 text-sm text-gray-600">Share this code with teammates so they can join your team.</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900">No team yet</h3>
                <p className="mt-2 text-gray-600">Use the cards on the right to create or join a team.</p>
              </>
            )}
          </div>
        </section>

        {/* RIGHT TOP: Create (solid violet) */}
        <form onSubmit={handleCreate} className="rounded-2xl bg-violet-600 p-6 shadow-md ring-1 ring-violet-500">
          <h3 className="text-lg font-semibold text-white">Create a team</h3>
          <p className="text-sm text-violet-100">Spin up a new team and share the join code.</p>

          <label className="mt-4 block">
            <span className="mb-1 block text-sm text-white/90">Team name</span>
            <input className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/60 outline-none focus:border-white focus:ring-2 focus:ring-white/60" placeholder="e.g. Curious Koalas" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <button className="mt-4 w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-60" disabled={submittingCreate}>
            {submittingCreate ? "Creating…" : "Create team"}
          </button>

          {createErr && (
            <p role="alert" className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
              {createErr}
            </p>
          )}
          {createMsg && (
            <p role="status" className="mt-3 rounded-lg bg-white/20 px-3 py-2 text-sm text-white">
              {createMsg}
            </p>
          )}
        </form>

        {/* RIGHT BOTTOM: Join (solid violet) */}
        <form onSubmit={handleJoin} className="rounded-2xl bg-violet-600 p-6 shadow-md ring-1 ring-violet-500">
          <h3 className="text-lg font-semibold text-white">Join with code</h3>
          <p className="text-sm text-violet-100">Enter the join code to become part of a team.</p>

          <label className="mt-4 block">
            <span className="mb-1 block text-sm text-white/90">Join code</span>
            <input className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white uppercase placeholder-white/60 outline-none focus:border-white focus:ring-2 focus:ring-white/60" placeholder="ABC123" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} required />
          </label>

          <button className="mt-4 w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-60" disabled={submittingJoin}>
            {submittingJoin ? "Joining…" : "Join team"}
          </button>

          {joinErr && (
            <p role="alert" className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
              {joinErr}
            </p>
          )}
          {joinMsg && (
            <p role="status" className="mt-3 rounded-lg bg-white/20 px-3 py-2 text-sm text-white">
              {joinMsg}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
