import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client using the SECRET key. Bypasses RLS.
 *
 * NEVER import this into a Client Component. Use only in trusted server code
 * (e.g. the seed script, or admin-only Server Actions after an auth check).
 */
export function createAdminClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
