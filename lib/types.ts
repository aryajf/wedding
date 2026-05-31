// Shared data shapes for the wedding invitation & guest-management platform.

export type GalleryItem = { url: string; caption?: string };

export type WeddingEvent = {
  title: string;
  datetime?: string; // ISO
  location?: string;
  address?: string;
  maps_url?: string;
};

export type TimelineItem = {
  date?: string;
  title: string;
  description?: string;
  image?: string;
};

export type LinkItem = { label: string; url: string };

export type BankAccount = {
  bank: string;
  holder: string;
  number: string;
  logo_url?: string;
};

export type EWallet = {
  label: string;
  number?: string;
  url?: string;
  qr_url?: string;
  logo_url?: string;
};

export type WeddingSettings = {
  id: number;

  // Theme
  background_color: string;
  text_color: string;
  heading_color: string;
  accent_color: string;
  progress_color: string;
  selection_color: string;
  selection_bg_color: string;
  font_family: string;

  // Core content
  bride_name: string;
  groom_name: string;
  hero_message: string | null;
  event_date: string | null;

  ceremony_title: string | null;
  ceremony_location: string | null;
  ceremony_address: string | null;
  reception_title: string | null;
  reception_location: string | null;
  reception_address: string | null;

  love_story: string | null;
  closing_message: string | null;

  // Media
  hero_image_url: string | null;
  music_url: string | null;
  gallery: GalleryItem[];

  // Cover / video
  cover_enabled: boolean;
  prewedding_video_url: string | null;

  // Couple profiles
  bride_full_name: string | null;
  bride_photo_url: string | null;
  bride_bio: string | null;
  bride_parents: string | null;
  bride_instagram: string | null;
  groom_full_name: string | null;
  groom_photo_url: string | null;
  groom_bio: string | null;
  groom_parents: string | null;
  groom_instagram: string | null;

  // Quote
  quote_text: string | null;
  quote_source: string | null;

  // Structured arrays
  events: WeddingEvent[];
  story_timeline: TimelineItem[];
  livestream: LinkItem[];

  // Gift / Angpao
  gift_enabled: boolean;
  gift_message: string | null;
  bank_accounts: BankAccount[];
  ewallets: EWallet[];
  gift_address: string | null;

  // Health protocols
  health_enabled: boolean;
  health_protocols: string | null;

  updated_at: string;
};

export type Guest = {
  id: string;
  token: string;
  name: string;
  category: string | null;
  invited_count: number;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
};

/** Guest attendance choice, captured alongside a guestbook wish. */
export type Attendance = "yes" | "no" | "none";

export type Wish = {
  id: string;
  guest_name: string;
  message: string;
  attendance: Attendance;
  approved: boolean;
  created_at: string;
};

export type Checkin = {
  id: string;
  guest_id: string | null;
  guest_name: string;
  created_at: string;
};

export const DEFAULT_THEME = {
  background_color: "#f7e1cd",
  text_color: "#4a3b2f",
  heading_color: "#7d5a3c",
  accent_color: "#c08552",
  progress_color: "#c08552",
  selection_color: "#fff8ef",
  selection_bg_color: "#c08552",
  font_family: "serif",
} as const;
