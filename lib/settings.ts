import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_THEME,
  type WeddingSettings,
  type GalleryItem,
  type WeddingEvent,
  type TimelineItem,
  type LinkItem,
  type BankAccount,
  type EWallet,
} from "@/lib/types";

// Complete settings built from defaults — used if the DB row is missing.
const FALLBACK_SETTINGS: WeddingSettings = {
  id: 1,
  ...DEFAULT_THEME,
  bride_name: "Bride",
  groom_name: "Groom",
  hero_message:
    "Together with their families, invite you to celebrate their wedding",
  event_date: null,
  ceremony_title: "The Ceremony",
  ceremony_location: null,
  ceremony_address: null,
  reception_title: "The Reception",
  reception_location: null,
  reception_address: null,
  love_story: null,
  closing_message: "We can't wait to celebrate with you!",
  hero_image_url: null,
  music_url: null,
  gallery: [],
  cover_enabled: true,
  prewedding_video_url: null,
  bride_full_name: null,
  bride_photo_url: null,
  bride_bio: null,
  bride_parents: null,
  bride_instagram: null,
  groom_full_name: null,
  groom_photo_url: null,
  groom_bio: null,
  groom_parents: null,
  groom_instagram: null,
  quote_text: null,
  quote_source: null,
  events: [],
  story_timeline: [],
  livestream: [],
  gift_enabled: false,
  gift_message: null,
  bank_accounts: [],
  ewallets: [],
  gift_address: null,
  health_enabled: false,
  health_protocols: null,
  updated_at: new Date().toISOString(),
};

function arr<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/** Fetch the singleton wedding settings row, normalizing jsonb arrays. */
export async function getSettings(): Promise<WeddingSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wedding_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return FALLBACK_SETTINGS;

  return {
    ...FALLBACK_SETTINGS,
    ...data,
    gallery: arr<GalleryItem>(data.gallery),
    events: arr<WeddingEvent>(data.events),
    story_timeline: arr<TimelineItem>(data.story_timeline),
    livestream: arr<LinkItem>(data.livestream),
    bank_accounts: arr<BankAccount>(data.bank_accounts),
    ewallets: arr<EWallet>(data.ewallets),
  } as WeddingSettings;
}
