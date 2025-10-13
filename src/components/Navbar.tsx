"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { sb } from "@/lib/supabase-browser";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const logout = async () => {
    await sb.auth.signOut();
    router.replace("/login");
  };

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const active = pathname?.startsWith(href);
    return (
      <Link href={href} className={`px-3 py-2 rounded-md text-sm font-medium ${active ? "bg-gray-900 text-white" : "text-gray-200 hover:bg-gray-800 hover:text-white"}`}>
        {children}
      </Link>
    );
  };

  return (
    <nav className="bg-gray-900 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-12 items-center justify-between">
          <Link href="/" className="font-semibold">
            CTF
          </Link>
          <div className="flex items-center gap-2">
            <NavLink href="/rules">Rules</NavLink>
            <NavLink href="/challenges">Challenges</NavLink>
            <NavLink href="/teams">Teams</NavLink>
            <NavLink href="/leaderboard">Leaderboard</NavLink>
          </div>
          <div className="flex items-center gap-2">
            {email ? (
              <>
                <span className="hidden sm:block text-sm text-gray-300">{email}</span>
                <button onClick={logout} className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold hover:bg-red-700">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm hover:underline">
                  Log in
                </Link>
                <Link href="/signup" className="text-sm hover:underline">
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
