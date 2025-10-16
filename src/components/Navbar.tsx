"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { sb } from "@/lib/supabase-browser";
import { useEffect, useMemo, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [label, setLabel] = useState<string | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false); // gate UI until we know

  // Helper to populate label from a session
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
      // 1) initial read
      const { data } = await sb.auth.getSession();
      await setFromSession(data.session);
      setAuthLoaded(true);

      // 2) subscribe to future changes
      const { data: listener } = sb.auth.onAuthStateChange((_event, session) => {
        setFromSession(session);
      });
      unsub = () => listener.subscription.unsubscribe();
    })();

    return () => {
      unsub?.();
    };
  }, []);

  const initial = useMemo(() => (label ? (label.trim()[0] || "U").toUpperCase() : null), [label]);

  const logout = async () => {
    // optimistic UI
    setLabel(null);
    await sb.auth.signOut();
    router.replace("/login");
  };

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const active = pathname?.startsWith(href);
    return (
      <Link href={href} aria-current={active ? "page" : undefined} className={["relative rounded-lg px-3 py-2 text-sm font-medium transition", active ? "text-violet-700 bg-violet-50" : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"].join(" ")}>
        {children}
        {active && <span className="absolute -bottom-2 left-3 right-3 h-0.5 rounded-full bg-violet-600" />}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between gap-3">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-violet-700" aria-label="Go to landpage">
            KvaliCTF
          </Link>

          <div className="flex items-center gap-1">
            <NavLink href="/rules">Rules</NavLink>
            <NavLink href="/challenges">Challenges</NavLink>
            <NavLink href="/teams">Teams</NavLink>
            <NavLink href="/leaderboard">Leaderboard</NavLink>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {!authLoaded ? (
              // tiny skeleton while auth state loads
              <>
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-8 w-20 rounded-md bg-gray-200 animate-pulse" />
              </>
            ) : label ? (
              <>
                <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white font-semibold shadow-sm ring-2 ring-violet-100" title={label} aria-label={label}>
                  {initial}
                </div>
                <button onClick={logout} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-700 hover:underline">
                  Log in
                </Link>
                <Link href="/signup" className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700">
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
