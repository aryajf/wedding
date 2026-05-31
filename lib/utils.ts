import type { CSSProperties } from "react";
import { DEFAULT_THEME, type WeddingSettings } from "@/lib/types";
import { resolveFont } from "@/lib/fonts";

type ThemeFields = Pick<
  WeddingSettings,
  | "background_color"
  | "text_color"
  | "heading_color"
  | "accent_color"
  | "progress_color"
  | "selection_color"
  | "selection_bg_color"
  | "font_family"
>;

/**
 * Map the saved theme onto CSS custom properties consumed by Tailwind and
 * inline styles. Bridges the admin builder (hex codes in the DB) to the page.
 * React's CSSProperties includes a `--${string}` index signature for vars.
 * `--font` drives body copy; `--font-heading` drives display/serif headings.
 */
export function themeToCssVars(settings: ThemeFields): CSSProperties {
  const font = resolveFont(settings.font_family);

  return {
    "--bg": settings.background_color || DEFAULT_THEME.background_color,
    "--text": settings.text_color || DEFAULT_THEME.text_color,
    "--heading": settings.heading_color || DEFAULT_THEME.heading_color,
    "--accent": settings.accent_color || DEFAULT_THEME.accent_color,
    "--progress": settings.progress_color || DEFAULT_THEME.progress_color,
    "--selection": settings.selection_color || DEFAULT_THEME.selection_color,
    "--selection-bg":
      settings.selection_bg_color || DEFAULT_THEME.selection_bg_color,
    "--font": font.body,
    "--font-heading": font.heading,
  } as CSSProperties;
}

/** Format an ISO date for display, e.g. "Saturday, 12 September 2026". */
export function formatEventDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Format an ISO date for an <input type="datetime-local"> value. */
export function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}
