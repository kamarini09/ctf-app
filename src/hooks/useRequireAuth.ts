"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sb } from "@/lib/supabase-browser";

export function useRequireAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    sb.auth.getUser().then(({ data }) => {
      if (!isMounted) return;
      const user = data.user;
      if (!user) {
        router.replace("/login");
      } else {
        setEmail(user.email ?? null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [router]);

  return { loading, email };
}
