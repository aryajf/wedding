"use client";

import type { WeddingSettings, Wish } from "@/lib/types";
import { themeToCssVars } from "@/lib/utils";
import { InvitationBody } from "@/components/public/InvitationBody";

// The admin draft: every WeddingSettings field except the server-managed ones,
// with the event date held as a datetime-local string while editing.
export type PreviewData = Omit<
  WeddingSettings,
  "id" | "updated_at" | "event_date"
> & { event_date_local: string };

/**
 * Admin live preview. Renders the EXACT same `InvitationBody` the public page
 * uses, fed from the in-progress draft, so content, sizing, fonts, iframes and
 * layout match the real invitation by construction (in `preview` mode: no
 * cover, no GSAP, no realtime/submit, docked health popup). The body is mobile
 * width and scaled to fill the preview pane like a real phone.
 */
export function LivePreview({
  data,
  wishes = [],
}: {
  data: PreviewData;
  wishes?: Wish[];
}) {
  const { event_date_local, ...rest } = data;
  const settings: WeddingSettings = {
    ...rest,
    id: 1,
    updated_at: "",
    event_date: event_date_local
      ? new Date(event_date_local).toISOString()
      : null,
  };

  return (
    <div className="h-full overflow-hidden">
      <div
        className="thin-scroll h-full overflow-y-auto bg-grain font-sans"
        style={{
          ...themeToCssVars(settings),
          // The real page gets these from globals.css `body`; apply them here
          // so the preview matches the chosen background and text colors.
          background: "var(--bg)",
          color: "var(--text)",
          fontFamily: "var(--font)",
        }}
      >
        <InvitationBody
          settings={settings}
          guestName={null}
          guestToken={null}
          initialWishes={wishes.filter((w) => w.approved)}
          preview
        />
      </div>
    </div>
  );
}
