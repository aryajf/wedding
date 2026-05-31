/**
 * Seed script.
 *
 *   npm run seed          → create/confirm the admin user, ensure the settings
 *                           row exists, and fill demo content ONLY if the
 *                           invitation is still at its factory defaults.
 *   npm run seed -- --demo→ force-overwrite the settings row with demo content
 *                           and (re)insert sample guests & wishes.
 *
 * Uses Node's --env-file to load .env.local (requires Node 20.9+).
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const username = process.env.ADMIN_USERNAME || "admin";
const password = process.env.ADMIN_PASSWORD;
const domain = process.env.ADMIN_EMAIL_DOMAIN || "wedding.local";

const FORCE_DEMO =
  process.argv.includes("--demo") || process.env.SEED_DEMO === "1";

if (!url || !secret || !password) {
  console.error(
    "Missing env. Ensure SUPABASE_URL, SUPABASE_SECRET_KEY and ADMIN_PASSWORD are set in .env.local",
  );
  process.exit(1);
}

const email = username.includes("@")
  ? username.toLowerCase()
  : `${username.toLowerCase()}@${domain}`;

const admin = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Demo asset URLs (all public / royalty-free, hot-linkable)
// ---------------------------------------------------------------------------
const img = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const DEMO_SETTINGS = {
  id: 1,

  // Theme — the signature warm palette
  background_color: "#f7e1cd",
  text_color: "#4a3b2f",
  heading_color: "#7d5a3c",
  accent_color: "#c08552",
  progress_color: "#c08552",
  selection_color: "#fff8ef",
  selection_bg_color: "#c08552",
  font_family: "serif",

  // Core content
  bride_name: "Angelica",
  groom_name: "Arya",
  hero_message:
    "Together with their families, request the honour of your presence as they celebrate the beginning of their forever.",
  // ~6 months out from seed time, at 4pm local
  event_date: new Date(
    new Date().setMonth(new Date().getMonth() + 6),
  )
    .toISOString()
    .replace(/T.*/, "T09:00:00.000Z"),

  ceremony_title: "The Ceremony",
  ceremony_location: "St. Mary's Cathedral",
  ceremony_address: "Jl. Katedral No. 7B, Jakarta Pusat",
  reception_title: "The Reception",
  reception_location: "The Ritz-Carlton Ballroom",
  reception_address: "Jl. DR. Ide Anak Agung Gde Agung, Jakarta Selatan",

  love_story:
    "It started with a spilled cup of coffee in a tiny bookshop café and a shared laugh over the same dog-eared novel. Six years, three cities, and countless adventures later, we're ready to write our next chapter — together, forever.",
  closing_message: "It is an honour to share our joy with you. See you there!",

  // Media
  hero_image_url: img("1519741497674-611481863552"),
  music_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  gallery: [
    { url: img("1606800052052-a08af7148866"), caption: "The proposal" },
    { url: img("1519225421980-715cb0215aed"), caption: "Golden hour" },
    { url: img("1511285560929-80b456fea0bc"), caption: "Our first dance" },
    { url: img("1465495976277-4387d4b0b4c6"), caption: "City lights" },
    { url: img("1583939003579-730e3918a45a"), caption: "Forever begins" },
    { url: img("1522673607200-164d1b6ce486"), caption: "Just us" },
  ],

  // Cover / video
  cover_enabled: true,
  prewedding_video_url: "https://www.youtube.com/watch?v=2Vv-BfVoq4g",

  // Couple profiles
  bride_full_name: "Zaskia Angelica",
  bride_photo_url: img("1494790108377-be9c29b29330"),
  bride_bio:
    "An architect with a love for old films, fresh flowers, and rainy Sunday mornings.",
  bride_parents: "The daughter of Mr. & Mrs. Angelica",
  bride_instagram: "f44ngels_",
  groom_full_name: "Arya Javas Fatih",
  groom_photo_url: img("1507003211169-0a1dd7228f2d"),
  groom_bio:
    "A software engineer who collects vinyl records and makes a questionable amount of espresso.",
  groom_parents: "The son of Mr. & Mrs. Javas",
  groom_instagram: "javscode",

  // Quote
  quote_text:
    "And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquillity with them, and He has put love and mercy between your hearts.",
  quote_source: "Ar-Rum: 21",

  // Structured arrays
  events: [
    {
      title: "Akad",
      datetime: new Date(new Date().setMonth(new Date().getMonth() + 6))
        .toISOString()
        .replace(/T.*/, "T02:00:00.000Z"),
      location: "St. Mary's Cathedral",
      address: "Jl. Katedral No. 7B, Jakarta Pusat",
      maps_url: "https://maps.google.com/?q=St+Mary+Cathedral+Jakarta",
    },
    {
      title: "Resepsi",
      datetime: new Date(new Date().setMonth(new Date().getMonth() + 6))
        .toISOString()
        .replace(/T.*/, "T11:00:00.000Z"),
      location: "The Ritz-Carlton Ballroom",
      address: "Jl. DR. Ide Anak Agung Gde Agung, Jakarta Selatan",
      maps_url: "https://maps.google.com/?q=Ritz+Carlton+Jakarta",
    },
  ],
  story_timeline: [
    {
      date: "Jun 2018",
      title: "The First Meeting",
      description:
        "A spilled coffee and a shared book in a little café started it all.",
      image: img("1453396450673-3fe83d2db2c4"),
    },
    {
      date: "Dec 2019",
      title: "The First Trip",
      description: "We chased the northern lights and got hopelessly lost — together.",
      image: img("1469474968028-56623f02e42e"),
    },
    {
      date: "Feb 2024",
      title: "The Proposal",
      description: "On the same café table where it all began, he asked the question.",
      image: img("1606800052052-a08af7148866"),
    },
  ],
  livestream: [
    // YouTube: a watch/live URL or video link (embedded as an iframe).
    { label: "YouTube Live", url: "https://www.youtube.com/watch?v=jfKfPfyJRdk" },
    // Instagram: the couple's profile (embedded best-effort, link fallback).
    { label: "Instagram Live", url: "https://www.instagram.com/f44ngels_/" },
  ],

  // Gift / Angpao (logos via Clearbit logo API; component falls back to a
  // monogram if an image fails to load).
  gift_enabled: true,
  gift_message:
    "Your prayers and presence mean the world to us. For those who wish to share a token of love, we have provided the details below.",
  bank_accounts: [
    {
      bank: "BCA",
      holder: "Zaskia Angelica",
      number: "1234567890",
      logo_url: "/gift/bca.svg",
    },
    {
      bank: "BSI",
      holder: "Arya Javas Fatih",
      number: "7011223344",
      logo_url: "/gift/bsi.svg",
    },
  ],
  ewallets: [
    {
      label: "GoPay",
      number: "0812-3456-7890",
      url: "",
      logo_url: "/gift/gopay.svg",
    },
  ],
  gift_address:
    "Zaskia & Arya\nJl. Melati Indah No. 21, Kebayoran Baru\nJakarta Selatan 12120",

  // Health protocols
  health_enabled: true,
  health_protocols:
    "For everyone's comfort and safety, we kindly ask guests to be in good health when attending. Hand sanitiser stations will be available throughout the venue. Thank you for your understanding. 🤍",

  updated_at: new Date().toISOString(),
};

const DEMO_GUESTS = [
  { name: "Mr. & Mrs. Santoso", category: "Family", invited_count: 2, token: "demo-fam1" },
  { name: "Budi Hartono", category: "Friend", invited_count: 1, token: "demo-frnd1" },
  { name: "Citra Lestari", category: "Friend", invited_count: 2, token: "demo-frnd2" },
  { name: "Dr. Made Wirawan", category: "VIP", invited_count: 2, token: "demo-vip1" },
  { name: "Office Team", category: "Colleague", invited_count: 4, token: "demo-work1" },
];

const DEMO_WISHES = [
  {
    guest_name: "Citra Lestari",
    message: "Congratulations you two! Wishing you a lifetime of love and laughter. 💕",
    attendance: "yes",
    approved: true,
  },
  {
    guest_name: "Budi Hartono",
    message: "So happy for you both. Can't wait to celebrate! 🎉",
    attendance: "yes",
    approved: true,
  },
  {
    guest_name: "Aunt Maria",
    message: "May God bless your marriage abundantly. We love you!",
    attendance: "no",
    approved: true,
  },
];

// ---------------------------------------------------------------------------
async function ensureAdminUser() {
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (!error) {
    console.log(`✓ Created admin user: ${email}`);
    return;
  }

  if (error.status === 422 || /already.*registered|exists/i.test(error.message)) {
    const { data: list } = await admin.auth.admin.listUsers();
    const existing = list?.users?.find((u) => u.email === email);
    if (existing) {
      await admin.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
      });
      console.log(`✓ Admin user already existed — password reset: ${email}`);
      return;
    }
  }

  console.error("Failed to create admin user:", error.message);
  process.exit(1);
}

async function ensureSettings() {
  // Make sure the row exists first.
  const { data: current, error: readErr } = await admin
    .from("wedding_settings")
    .select("id, bride_name")
    .eq("id", 1)
    .maybeSingle();

  if (readErr) {
    console.warn(
      "Could not read settings (run supabase/schema.sql first):",
      readErr.message,
    );
    return;
  }

  const isPristine = !current || current.bride_name === "Bride";

  if (!FORCE_DEMO && !isPristine) {
    console.log(
      "• Settings already customized — skipping demo content. Use `npm run seed -- --demo` to overwrite.",
    );
    return;
  }

  // Write everything; if the DB is missing newer columns (migration not run
  // yet), strip them and retry so the rest of the demo content still lands.
  let payload = { ...DEMO_SETTINGS };
  for (let attempt = 0; attempt < 6; attempt++) {
    const { error } = await admin
      .from("wedding_settings")
      .upsert(payload, { onConflict: "id" });

    if (!error) {
      console.log("✓ Demo content seeded (theme, text, photos, video, music, gift)");
      return;
    }

    const missing = error.message.match(/'([a-z_]+)' column/i)?.[1];
    if (missing && missing in payload) {
      delete payload[missing];
      console.warn(`  · skipping missing column '${missing}' (run the migration)`);
      continue;
    }
    console.warn("Could not write demo settings:", error.message);
    return;
  }
}

async function ensureGuests() {
  const { count } = await admin
    .from("guests")
    .select("id", { count: "exact", head: true });

  if (!FORCE_DEMO && (count ?? 0) > 0) {
    console.log("• Guests already present — skipping demo guests.");
    return;
  }

  const { error } = await admin
    .from("guests")
    .upsert(DEMO_GUESTS, { onConflict: "token", ignoreDuplicates: true });

  if (error) console.warn("Could not seed guests:", error.message);
  else console.log(`✓ Seeded ${DEMO_GUESTS.length} demo guests (with QR tokens)`);
}

async function ensureWishes() {
  const { count } = await admin
    .from("wishes")
    .select("id", { count: "exact", head: true });

  if (!FORCE_DEMO && (count ?? 0) > 0) {
    console.log("• Wishes already present — skipping demo wishes.");
    return;
  }

  let rows = DEMO_WISHES;
  for (let attempt = 0; attempt < 4; attempt++) {
    const { error } = await admin.from("wishes").insert(rows);
    if (!error) {
      console.log(`✓ Seeded ${rows.length} demo wishes`);
      return;
    }
    const missing = error.message.match(/'([a-z_]+)' column/i)?.[1];
    if (missing) {
      rows = rows.map(({ [missing]: _omit, ...rest }) => rest);
      console.warn(`  · skipping missing column '${missing}' on wishes (run the migration)`);
      continue;
    }
    console.warn("Could not seed wishes:", error.message);
    return;
  }
}

await ensureAdminUser();
await ensureSettings();
await ensureGuests();
await ensureWishes();

console.log(
  "\nDone. Log in at /admin/login with ADMIN_USERNAME / ADMIN_PASSWORD." +
    (FORCE_DEMO ? "" : "\nTip: run `npm run seed -- --demo` to force-reset demo content."),
);
