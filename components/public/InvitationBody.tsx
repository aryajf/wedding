"use client";

import type { WeddingEvent, WeddingSettings, Wish } from "@/lib/types";
import { formatEventDate } from "@/lib/utils";
import { Countdown } from "./Countdown";
import { Gallery } from "./Gallery";
import { CoupleProfiles } from "./CoupleProfiles";
import { Timeline } from "./Timeline";
import { Quote } from "./Quote";
import { LiveStream } from "./LiveStream";
import { VideoSection } from "./VideoSection";
import { GiftSection } from "./GiftSection";
import { HealthProtocol } from "./HealthProtocol";
import { WishesBoard } from "./WishesBoard";
import { QrTicket } from "./QrTicket";
import { RingsMark, Divider, SectionTitle } from "./Ornaments";
import { mapsEmbedSrc, mapsLinkHref } from "@/lib/embeds";
import { googleCalendarUrl, downloadIcs } from "@/lib/calendar";

/**
 * The full invitation, hero through footer. Rendered both by the public page
 * (`components/public/Invitation.tsx`, which adds the Cover, theme vars, GSAP
 * reveals and music) and by the admin live preview (`LivePreview`), so the two
 * never drift. In `preview` mode the hero scroll cue and guestbook write paths
 * are disabled, but every section (real Maps/YouTube/IG iframes, live
 * countdown, equal-height guestbook cards, health popup) renders identically.
 */
export function InvitationBody({
  settings,
  guestName,
  guestToken,
  initialWishes,
  preview = false,
}: {
  settings: WeddingSettings;
  guestName: string | null;
  guestToken: string | null;
  initialWishes: Wish[];
  preview?: boolean;
}) {
  const dateLabel = formatEventDate(settings.event_date);

  // Custom events[] preferred, else fall back to the legacy ceremony/reception.
  const events: WeddingEvent[] = [];
  if (settings.events.length > 0) {
    events.push(...settings.events);
  } else {
    if (settings.ceremony_location) {
      events.push({
        title: settings.ceremony_title || "The Ceremony",
        datetime: settings.event_date || undefined,
        location: settings.ceremony_location,
        address: settings.ceremony_address || undefined,
      });
    }
    if (settings.reception_location) {
      events.push({
        title: settings.reception_title || "The Reception",
        datetime: settings.event_date || undefined,
        location: settings.reception_location,
        address: settings.reception_address || undefined,
      });
    }
  }

  const hasCouple =
    settings.bride_full_name ||
    settings.groom_full_name ||
    settings.bride_photo_url ||
    settings.groom_photo_url ||
    settings.bride_bio ||
    settings.groom_bio;

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
        {settings.hero_image_url && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.hero_image_url}
              alt=""
              className="absolute inset-0 h-full w-full scale-105 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/30 to-black/55" />
          </>
        )}
        <div
          className={`relative z-10 flex flex-col items-center ${
            settings.hero_image_url ? "text-white" : ""
          }`}
        >
          <span
            className="hero-reveal animate-float"
            style={
              settings.hero_image_url
                ? { color: "#fff" }
                : { color: "var(--accent)" }
            }
          >
            <RingsMark size={52} />
          </span>
          <p className="hero-reveal mt-6 text-sm uppercase tracking-[0.4em] sm:text-base">
            We&apos;re getting married
          </p>
          <h1 className="hero-reveal mt-6 font-serif leading-[1.05] [font-size:clamp(2.75rem,11vw,7rem)]">
            {settings.bride_name}
            <span className="mx-2 inline-block align-middle italic [font-size:clamp(1.5rem,6vw,3.5rem)] sm:mx-3">
              &amp;
            </span>
            {settings.groom_name}
          </h1>
          {dateLabel && (
            <p className="hero-reveal mt-6 text-lg tracking-[0.15em] sm:text-xl">
              {dateLabel}
            </p>
          )}
          {guestName && (
            <p className="hero-reveal mt-3 text-sm opacity-90">
              Especially for{" "}
              <span className="font-medium italic">{guestName}</span>
            </p>
          )}
          {!preview && (
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("invitation-start")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              aria-label="Scroll to invitation"
              className="hero-reveal group mt-14 flex flex-col items-center gap-3 rounded-full px-4 pb-2 pt-3 outline-none transition-transform duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-current active:scale-95"
            >
              <span className="mt-5 text-[0.8rem] uppercase tracking-[0.4em] opacity-80 transition-opacity group-hover:opacity-100">
                Scroll
              </span>
              <span className="-mt-3 text-[1.6rem] leading-none opacity-70 transition-all duration-300 group-hover:translate-y-0.5 group-hover:opacity-100">
                ⌄
              </span>
            </button>
          )}
        </div>
      </section>

      {/* INTRO / COUNTDOWN */}
      <section
        id="invitation-start"
        className="scroll-mt-4 px-6 py-20 text-center sm:py-28"
      >
        {settings.hero_message && (
          <p className="reveal mx-auto max-w-2xl font-serif text-xl italic leading-relaxed text-[color:var(--text)]/90 sm:text-2xl">
            {settings.hero_message}
          </p>
        )}
        <Divider className="reveal mt-8" />
        {settings.event_date && (
          <div className="reveal mt-10">
            <Countdown date={settings.event_date} />
          </div>
        )}
      </section>

      {hasCouple && <CoupleProfiles settings={settings} />}

      {settings.quote_text && (
        <Quote text={settings.quote_text} source={settings.quote_source} />
      )}

      {settings.story_timeline.length > 0 ? (
        <Timeline items={settings.story_timeline} />
      ) : (
        settings.love_story && (
          <section className="px-6 py-20 sm:py-28">
            <div className="mx-auto max-w-2xl">
              <SectionTitle eyebrow="Once upon a time" title="Our Story" />
              <p className="reveal mt-10 whitespace-pre-line text-center text-lg leading-relaxed text-[color:var(--text)]/90">
                {settings.love_story}
              </p>
            </div>
          </section>
        )
      )}

      {/* EVENT DETAILS */}
      {events.length > 0 && (
        <section className="relative overflow-hidden bg-black/[0.03] px-6 py-20 sm:py-28">
          <SectionTitle
            eyebrow="Save the date"
            title="Celebration Details"
            className="mb-12"
          />
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {events.map((ev, i) => (
              <EventCard
                key={i}
                ev={ev}
                fallbackDate={dateLabel}
                fallbackIso={settings.event_date}
                coupleName={`${settings.bride_name} & ${settings.groom_name}`}
                preview={preview}
              />
            ))}
          </div>
        </section>
      )}

      {/* GALLERY */}
      {settings.gallery.length > 0 && <Gallery items={settings.gallery} />}

      {settings.prewedding_video_url && (
        <VideoSection url={settings.prewedding_video_url} />
      )}

      {settings.livestream.length > 0 && (
        <LiveStream links={settings.livestream} />
      )}

      {settings.gift_enabled && (
        <GiftSection
          message={settings.gift_message}
          banks={settings.bank_accounts}
          ewallets={settings.ewallets}
          address={settings.gift_address}
        />
      )}

      {/* GUESTBOOK + ATTENDANCE */}
      <section className="bg-black/[0.03] px-6 py-20 sm:py-28">
        {guestToken && (
          <div className="reveal mb-16">
            <QrTicket token={guestToken} guestName={guestName ?? "Guest"} />
          </div>
        )}

        <SectionTitle
          eyebrow="Konfirmasi kehadiran & ucapan"
          title="Buku Tamu"
          className="mb-4"
        />
        <p className="reveal mx-auto mb-12 max-w-md text-center text-lg text-[color:var(--text)]/80">
          Beri tahu kami apakah kamu bisa hadir, dan tinggalkan doa untuk kami.
        </p>
        <div className="reveal">
          <WishesBoard
            initial={initialWishes}
            defaultName={guestName}
            preview={preview}
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-20 text-center">
        <span
          className="reveal mx-auto mb-6 block w-fit"
          style={{ color: "var(--accent)" }}
        >
          <RingsMark size={48} />
        </span>
        {settings.closing_message && (
          <p className="reveal mx-auto max-w-xl font-serif text-2xl italic text-[color:var(--heading)]">
            {settings.closing_message}
          </p>
        )}
        <Divider className="reveal mt-8" />
        <p className="reveal mt-6 font-serif text-3xl text-[color:var(--heading)]">
          {settings.bride_name} &amp; {settings.groom_name}
        </p>
        <p className="reveal mt-8 text-xs uppercase tracking-[0.3em] text-[color:var(--text)]/50">
          Made with love
        </p>
      </footer>

      {settings.health_enabled && settings.health_protocols && (
        <HealthProtocol text={settings.health_protocols} docked={preview} />
      )}
    </>
  );
}

function EventCard({
  ev,
  fallbackDate,
  fallbackIso,
  coupleName,
  preview,
}: {
  ev: WeddingEvent;
  fallbackDate: string | null;
  fallbackIso: string | null;
  coupleName: string;
  preview: boolean;
}) {
  const date = ev.datetime ? formatEventDate(ev.datetime) : fallbackDate;
  const time = ev.datetime
    ? new Date(ev.datetime).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;
  const query = `${ev.location ?? ""} ${ev.address ?? ""}`.trim();
  const embed = mapsEmbedSrc(ev.maps_url || query || null);
  const link = mapsLinkHref(ev.maps_url, query);
  const gcal = googleCalendarUrl(ev, fallbackIso, coupleName);

  return (
    <div className="card-lux reveal flex flex-col overflow-hidden">
      <div className="px-7 pb-6 pt-6 text-center sm:px-9">
        <h3 className="font-serif text-[2rem] leading-tight text-[color:var(--heading)] sm:text-[2.25rem]">
          {ev.title}
        </h3>
        <Divider className="my-5" />

        {date && (
          <p className="text-lg tracking-wide text-[color:var(--text)]/85 sm:text-xl">
            {date}
          </p>
        )}
        {time && (
          <p className="mt-2 font-serif text-[2.75rem] leading-none text-[color:var(--accent)] sm:text-[2.75rem]">
            {time}
            <span className="ml-1.5 align-baseline text-xl font-medium tracking-wide">
              WIB
            </span>
          </p>
        )}

        {ev.location && (
          <p className="mt-6 font-serif text-2xl font-medium text-[color:var(--heading)] sm:text-[1.5rem]">
            {ev.location}
          </p>
        )}
        {ev.address && (
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[color:var(--text)]/75">
            {ev.address}
          </p>
        )}
      </div>

      {/* Google Maps embed */}
      {embed && (
        <div className="relative mx-5 mb-5 aspect-[4/3] overflow-hidden rounded-2xl shadow-inner ring-1 ring-[color:var(--accent)]/20 sm:aspect-video">
          <iframe
            src={embed}
            title={`Peta lokasi ${ev.title}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 h-full w-full grayscale-[0.15] transition-[filter] duration-500 hover:grayscale-0"
          />
        </div>
      )}

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={`mx-5 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-medium text-white transition-transform hover:scale-[1.02] active:scale-100 ${
          gcal ? "mb-3" : "mb-6"
        }`}
        style={{ background: "var(--accent)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 21s-7-6.3-7-11a7 7 0 1 1 14 0c0 4.7-7 11-7 11Z" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="2.6" />
        </svg>
        Buka di Google Maps
      </a>

      {gcal && (
        <div className="mx-5 mb-6 flex flex-col gap-2 sm:flex-row">
          <a
            href={gcal}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[color:var(--accent)]/10"
            style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
          >
            <CalendarGlyph />
            Google Calendar
          </a>
          <button
            type="button"
            onClick={() => !preview && downloadIcs(ev, fallbackIso, coupleName)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[color:var(--accent)]/10"
            style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
          >
            <CalendarGlyph />
            Simpan (.ics)
          </button>
        </div>
      )}
    </div>
  );
}

function CalendarGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" strokeLinecap="round" />
    </svg>
  );
}
