// Build "add to calendar" links/files from an event, no API key needed.
import type { WeddingEvent } from "@/lib/types";

const pad = (n: number) => String(n).padStart(2, "0");

/** Format a Date as an iCal UTC stamp: YYYYMMDDTHHMMSSZ. */
function toICalUTC(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

// Weddings rarely carry an explicit end time; assume a 2-hour window.
const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000;

/** Resolve an event's start/end, falling back to the global date. */
export function eventDates(
  ev: WeddingEvent,
  fallbackIso: string | null,
): { start: Date; end: Date } | null {
  const iso = ev.datetime || fallbackIso;
  if (!iso) return null;
  const start = new Date(iso);
  if (isNaN(start.getTime())) return null;
  return { start, end: new Date(start.getTime() + DEFAULT_DURATION_MS) };
}

function summary(ev: WeddingEvent, coupleName: string): string {
  return `${ev.title} (${coupleName})`;
}

function place(ev: WeddingEvent): string {
  return [ev.location, ev.address].filter(Boolean).join(", ");
}

/** Google Calendar "add event" template URL, or null without a usable date. */
export function googleCalendarUrl(
  ev: WeddingEvent,
  fallbackIso: string | null,
  coupleName: string,
): string | null {
  const dates = eventDates(ev, fallbackIso);
  if (!dates) return null;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summary(ev, coupleName),
    dates: `${toICalUTC(dates.start)}/${toICalUTC(dates.end)}`,
    details: `Undangan pernikahan ${coupleName}`,
    location: place(ev),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const esc = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");

/** A minimal single-VEVENT .ics document (Apple/Outlook), or null. */
export function icsContent(
  ev: WeddingEvent,
  fallbackIso: string | null,
  coupleName: string,
): string | null {
  const dates = eventDates(ev, fallbackIso);
  if (!dates) return null;
  const loc = place(ev);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invitation//ID",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${toICalUTC(dates.start)}-${Math.random().toString(36).slice(2)}@wedding`,
    `DTSTAMP:${toICalUTC(new Date())}`,
    `DTSTART:${toICalUTC(dates.start)}`,
    `DTEND:${toICalUTC(dates.end)}`,
    `SUMMARY:${esc(summary(ev, coupleName))}`,
    loc ? `LOCATION:${esc(loc)}` : "",
    `DESCRIPTION:${esc(`Undangan pernikahan ${coupleName}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

/** Trigger a client-side .ics download for an event. */
export function downloadIcs(
  ev: WeddingEvent,
  fallbackIso: string | null,
  coupleName: string,
) {
  const content = icsContent(ev, fallbackIso, coupleName);
  if (!content) return;
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${ev.title.trim().replace(/\s+/g, "-").toLowerCase() || "acara"}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
