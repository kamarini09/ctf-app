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

  // team members
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

  // load members when we have a team
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
    <div className="min-h-screen bg-[var(--background)]">
      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Title */}
        <h1 className="font-display mb-8 text-center text-3xl text-brand">Teams</h1>

        {/* Grid layout */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* LEFT: Your Team — solid coral card with white text */}
          <div className="double-border bg-[var(--ctf-red)]">
            <div className="inner bg-[var(--ctf-red)] p-6 text-white">
              <h2 className="font-display mb-4 text-xl">Your Team</h2>

              {team ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div className="mb-1 block text-xs uppercase text-white/80">Team Name</div>
                      <div className="font-display text-lg">{team.name}</div>
                    </div>
                    <div>
                      <div className="mb-1 block text-xs uppercase text-white/80">Join Code</div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg">{team.code}</span>
                        {/* FIXED: visible on coral background */}
                        <button onClick={() => copyCode(team.code)} className="btn btn-ghost btn-sm border border-white text-white hover:bg-white/10 focus-ring" aria-label="Copy join code">
                          Copy
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-white/80">Share this code with teammates</p>
                    </div>
                  </div>

                  <div className="mt-6 border-t-2 border-white/30 pt-4">
                    <div className="mb-2 block text-xs uppercase text-white/80">Members</div>

                    {loadingMembers ? (
                      <ul className="mt-1 flex flex-wrap gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <li key={i} className="h-6 w-24 animate-pulse bg-white/20" />
                        ))}
                      </ul>
                    ) : members.length === 0 ? (
                      <div className="text-white/90">No members yet</div>
                    ) : (
                      <ul className="mt-1 flex flex-wrap gap-2">
                        {members.map((m) => (
                          <li key={m.id} className="badge border-white bg-white/10 text-white" title={m.display_name || "Member"}>
                            {m.display_name || "Unnamed"}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-white/90">No team yet — use the forms on the right to create or join.</p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Create + Join */}
          <div className="flex flex-col gap-6">
            {/* CREATE */}
            <form onSubmit={handleCreate} className="double-border">
              <div className="inner p-6">
                <h3 className="font-display mb-4 text-[var(--ctf-red)] text-lg">Create a team</h3>

                <label className="mb-3 block">
                  <span className="mb-2 block text-sm">Team name</span>
                  <input className="input" placeholder="e.g. Curious Koalas" value={name} onChange={(e) => setName(e.target.value)} required />
                </label>

                <button className="btn btn-solid w-full disabled:opacity-60 focus-ring" disabled={submittingCreate}>
                  {submittingCreate ? "Creating…" : "Create team"}
                </button>

                {createErr && (
                  <p role="alert" className="mt-3 border-2 border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {createErr}
                  </p>
                )}
                {createMsg && (
                  <p role="status" className="mt-3 border-2 border-[var(--ctf-red)] bg-white px-3 py-2 text-sm text-[var(--ctf-red)]">
                    {createMsg}
                  </p>
                )}
              </div>
            </form>

            {/* JOIN */}
            <form onSubmit={handleJoin} className="double-border">
              <div className="inner p-6">
                <h3 className="font-display mb-4 text-[var(--ctf-red)] text-lg">Join with code</h3>

                <label className="mb-3 block">
                  <span className="mb-2 block text-sm">Join code</span>
                  <input className="input uppercase" placeholder="ABC123" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} required />
                </label>

                <button className="btn btn-solid w-full disabled:opacity-60 focus-ring" disabled={submittingJoin}>
                  {submittingJoin ? "Joining…" : "Join team"}
                </button>

                {joinErr && (
                  <p role="alert" className="mt-3 border-2 border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {joinErr}
                  </p>
                )}
                {joinMsg && (
                  <p role="status" className="mt-3 border-2 border-[var(--ctf-red)] bg-white px-3 py-2 text-sm text-[var(--ctf-red)]">
                    {joinMsg}
                  </p>
                )}
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
