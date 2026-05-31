import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import type { Guest, Wish } from "@/lib/types";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();

  const settings = await getSettings();
  const supabase = await createClient();

  const [guestRes, wishRes] = await Promise.all([
    supabase.from("guests").select("*").order("created_at", { ascending: false }),
    supabase.from("wishes").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <AdminDashboard
      settings={settings}
      guests={(guestRes.data ?? []) as Guest[]}
      wishes={(wishRes.data ?? []) as Wish[]}
    />
  );
}
