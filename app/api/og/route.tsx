import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/settings";
import { getGuestByToken } from "@/lib/guests";
import { formatEventDate } from "@/lib/utils";

// Personalized per ?to=<token>; never statically cached.
export const dynamic = "force-dynamic";

const SIZE = { width: 1200, height: 630 };

export async function GET(req: Request) {
  const to = new URL(req.url).searchParams.get("to");
  const [settings, guest] = await Promise.all([
    getSettings(),
    to ? getGuestByToken(to) : Promise.resolve(null),
  ]);

  const couple = `${settings.bride_name} & ${settings.groom_name}`;
  const dateLabel = formatEventDate(settings.event_date);
  const guestName = guest?.name ?? null;

  const bg = settings.background_color || "#f7e1cd";
  const heading = settings.heading_color || "#7d5a3c";
  const accent = settings.accent_color || "#c08552";
  const text = settings.text_color || "#4a3b2f";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: bg,
          // Soft accent glow for depth without relying on remote images.
          backgroundImage: `radial-gradient(120% 90% at 50% -10%, ${accent}33, transparent 60%)`,
          alignItems: "center",
          justifyContent: "center",
          padding: 56,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            width: "100%",
            height: "100%",
            border: `2px solid ${accent}`,
            borderRadius: 28,
            padding: "64px 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: 14,
              textTransform: "uppercase",
              color: accent,
            }}
          >
            The Wedding Of
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 104,
              lineHeight: 1.05,
              color: heading,
            }}
          >
            {couple}
          </div>

          <div
            style={{
              display: "flex",
              width: 120,
              height: 3,
              marginTop: 32,
              background: accent,
            }}
          />

          {dateLabel && (
            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontSize: 34,
                letterSpacing: 2,
                color: text,
              }}
            >
              {dateLabel}
            </div>
          )}

          {guestName && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: 44,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  letterSpacing: 6,
                  textTransform: "uppercase",
                  color: text,
                  opacity: 0.7,
                }}
              >
                Kepada Yth.
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 12,
                  padding: "12px 36px",
                  borderRadius: 999,
                  background: accent,
                  color: "#fff",
                  fontSize: 36,
                }}
              >
                {guestName}
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...SIZE,
      headers: { "Cache-Control": "public, max-age=0, s-maxage=3600" },
    },
  );
}
