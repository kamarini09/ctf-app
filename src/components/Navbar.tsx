"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { sb } from "@/lib/supabase-browser";
import { useEffect, useMemo, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [label, setLabel] = useState<string | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  const setFromSession = async (session: Awaited<ReturnType<typeof sb.auth.getSession>>["data"]["session"]) => {
    const user = session?.user;
    if (!user) {
      setLabel(null);
      return;
    }
    const { data: prof } = await sb.from("profiles").select("display_name").eq("id", user.id).single();

    setLabel(prof?.display_name ?? user.email ?? null);
  };

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      const { data } = await sb.auth.getSession();
      await setFromSession(data.session);
      setAuthLoaded(true);

      const { data: listener } = sb.auth.onAuthStateChange((_event, session) => setFromSession(session));
      unsub = () => listener.subscription.unsubscribe();
    })();
    return () => unsub?.();
  }, []);

  const initial = useMemo(() => (label ? (label.trim()[0] || "U").toUpperCase() : null), [label]);

  const logout = async () => {
    const authPages = new Set(["/login", "/signup"]);
    const next = pathname && !authPages.has(pathname) ? `?next=${encodeURIComponent(pathname)}` : "";
    try {
      await sb.auth.signOut();
    } finally {
      // Hard redirect so you never “stay” on the same page after logout
      window.location.href = `/login${next}`;
    }
  };

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const active = pathname?.startsWith(href);
    return (
      <Link href={href} aria-current={active ? "page" : undefined} className={["relative px-3 py-2 text-sm font-medium transition no-underline", active ? "text-[var(--ctf-red)]" : "text-gray-700 hover:text-[var(--ctf-red)]"].join(" ")}>
        {children}
        {active && <span className="pointer-events-none absolute left-1/2 -bottom-[2px] h-[2px] w-5/6 -translate-x-1/2 bg-[var(--ctf-red)]" aria-hidden="true" />}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between gap-3">
          <Link href="/" className="font-display text-xl font-black tracking-tight text-[var(--ctf-red)] no-underline" aria-label="Go to landing page">
            KvaliCTF
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <NavLink href="/rules">Rules</NavLink>
            <NavLink href="/challenges">Challenges</NavLink>
            <NavLink href="/teams">Teams</NavLink>
            <NavLink href="/leaderboard">Leaderboard</NavLink>
          </div>

          <div className="flex items-center gap-2">
            {!authLoaded ? (
              <>
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
                <div className="h-8 w-20 animate-pulse rounded-md bg-gray-200" />
              </>
            ) : label ? (
              <>
                <div className="hidden h-8 w-8 place-items-center rounded-full bg-[var(--ctf-red)] font-semibold text-white shadow-sm ring-2 ring-[var(--ctf-rose-50)] sm:grid" title={label} aria-label={label}>
                  {initial}
                </div>
                <button onClick={logout} className="bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-200">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-700 no-underline hover:text-[var(--ctf-red)]">
                  Log in
                </Link>
                <Link href="/signup" className="no-underline bg-[var(--ctf-red)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--ctf-red-600)]">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
