import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";

/**
 * Dynamic PWA manifest. Pulls the couple's names and theme color from the
 * database so the installed app reflects the customized invitation.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSettings();
  const couple =
    s.bride_name && s.groom_name
      ? `${s.bride_name} & ${s.groom_name}`
      : "Our Wedding";

  return {
    name: `${couple} — Wedding Invitation`,
    short_name: "Wedding",
    description: s.hero_message ?? "You are invited to our wedding.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: s.background_color || "#f7e1cd",
    theme_color: s.background_color || "#f7e1cd",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
