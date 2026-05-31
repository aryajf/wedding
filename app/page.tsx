import type { Metadata } from "next";
import { headers } from "next/headers";
import { getSettings } from "@/lib/settings";
import { getGuestByToken } from "@/lib/guests";
import { createClient } from "@/lib/supabase/server";
import { formatEventDate } from "@/lib/utils";
import type { Wish } from "@/lib/types";
import { Invitation } from "@/components/public/Invitation";

// Personalized per-guest (?to=) and reads latest settings → always dynamic.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}): Promise<Metadata> {
  const { to } = await searchParams;
  const [settings, guest, h] = await Promise.all([
    getSettings(),
    to ? getGuestByToken(to) : Promise.resolve(null),
    headers(),
  ]);

  const couple = `${settings.bride_name} & ${settings.groom_name}`;
  const dateLabel = formatEventDate(settings.event_date);
  const when = dateLabel ? ` pada ${dateLabel}` : "";
  const title = `${couple} Wedding`;
  const description = guest?.name
    ? `${guest.name}, dengan hormat kami mengundang Anda untuk merayakan pernikahan ${couple}${when}.`
    : `Dengan hormat kami mengundang Anda untuk merayakan pernikahan ${couple}${when}.`;

  // Build an absolute base URL so crawlers (WhatsApp, etc.) can fetch the image.
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const base = `${proto}://${host}`;
  const qs = to ? `?to=${encodeURIComponent(to)}` : "";
  const ogImage = `${base}/api/og${qs}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${base}/${qs}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function Home({
  searchParams,
}: {
  // In Next.js 16 searchParams is a Promise.
  searchParams: Promise<{ to?: string }>;
}) {
  const { to } = await searchParams;

  const [settings, guest] = await Promise.all([
    getSettings(),
    getGuestByToken(to),
  ]);

  // Initial approved wishes for the guestbook board (realtime adds new ones).
  const supabase = await createClient();
  const { data } = await supabase
    .from("wishes")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <Invitation
      settings={settings}
      guestName={guest?.name ?? null}
      guestToken={guest?.token ?? null}
      initialWishes={(data ?? []) as Wish[]}
    />
  );
}
