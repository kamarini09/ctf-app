// src/lib/supabase-server.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service role key.
 * DO NOT import this from client components.
 */
export function sbAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("Missing env SUPABASE_URL");
  if (!key) throw new Error("Missing env SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
