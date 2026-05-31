import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Guest } from "@/lib/types";

/**
 * Resolve a guest by their invite token. Runs server-side with the secret key
 * so the `guests` table stays private (no anon RLS policy) while the public
 * page can still personalize the invitation from `?to=<token>`.
 */
export async function getGuestByToken(
  token: string | undefined,
): Promise<Guest | null> {
  if (!token) return null;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("guests")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  return (data as Guest) ?? null;
}

/** Generate a short, URL-safe, reasonably unique invite token. */
export function generateToken(): string {
  return (
    Math.random().toString(36).slice(2, 8) +
    Math.random().toString(36).slice(2, 6)
  );
}
