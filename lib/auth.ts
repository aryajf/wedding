import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Verify there is an authenticated admin session. Redirects to the login page
 * if not. Memoized per-request with React `cache` so multiple calls in one
 * render don't re-hit Supabase. This is the real auth gate (see proxy.ts for
 * the optimistic redirect).
 */
export const requireAdmin = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return user;
});

/** Map the admin username onto the synthetic email Supabase Auth identifies. */
export function usernameToEmail(username: string): string {
  const domain = process.env.ADMIN_EMAIL_DOMAIN || "wedding.local";
  // If a full email was supplied, use it as-is.
  if (username.includes("@")) return username.trim().toLowerCase();
  return `${username.trim().toLowerCase()}@${domain}`;
}
