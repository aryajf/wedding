import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Guest } from "@/lib/types";
import { CheckInClient } from "@/components/admin/CheckInClient";

export const dynamic = "force-dynamic";

export default async function CheckinPage() {
  await requireAdmin();

  const supabase = await createClient();
  const { data } = await supabase
    .from("guests")
    .select("*")
    .order("name", { ascending: true });

  return <CheckInClient guests={(data ?? []) as Guest[]} />;
}
