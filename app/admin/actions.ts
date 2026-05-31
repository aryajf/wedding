"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { generateToken } from "@/lib/guests";
import type { GalleryItem, WeddingSettings } from "@/lib/types";

type SettingsUpdate = Partial<Omit<WeddingSettings, "id" | "updated_at">>;

/** Persist a partial settings update to the singleton row. Admin-only. */
export async function saveSettings(payload: SettingsUpdate) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("wedding_settings")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function saveGallery(gallery: GalleryItem[]) {
  return saveSettings({ gallery });
}

/* --------------------------------- Wishes -------------------------------- */

export async function setWishApproved(id: string, approved: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("wishes")
    .update({ approved })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteWish(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("wishes").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin");
  return { ok: true as const };
}

/* --------------------------------- Guests -------------------------------- */

export async function createGuest(input: {
  name: string;
  category?: string;
  invited_count?: number;
}) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("guests").insert({
    name: input.name.trim(),
    category: input.category?.trim() || null,
    invited_count: input.invited_count ?? 1,
    token: generateToken(),
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function deleteGuest(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("guests").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin");
  return { ok: true as const };
}

/** Check a guest in (by token, from the QR scanner) — drives welcome screen. */
export async function checkInByToken(token: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: guest } = await supabase
    .from("guests")
    .select("*")
    .eq("token", token.trim())
    .maybeSingle();

  if (!guest) return { ok: false as const, error: "Guest not found" };

  await supabase
    .from("guests")
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq("id", guest.id);

  // Insert a checkin row → Realtime notifies the welcome screen.
  await supabase
    .from("checkins")
    .insert({ guest_id: guest.id, guest_name: guest.name });

  revalidatePath("/admin");
  return {
    ok: true as const,
    guest: { name: guest.name, alreadyIn: guest.checked_in as boolean },
  };
}

/** Manual check-in by guest id (from the dashboard list). */
export async function checkInById(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data: guest } = await supabase
    .from("guests")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!guest) return { ok: false as const, error: "Guest not found" };

  await supabase
    .from("guests")
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq("id", id);
  await supabase
    .from("checkins")
    .insert({ guest_id: guest.id, guest_name: guest.name });

  revalidatePath("/admin");
  return { ok: true as const, guest: { name: guest.name } };
}
