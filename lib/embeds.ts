// URL → embeddable iframe src helpers for maps and livestreams.

/**
 * Turn a Google Maps link (or a place query) into an embeddable iframe src.
 * Uses the keyless `output=embed` endpoint, which works for both full maps
 * URLs and plain "place name" queries.
 */
export function mapsEmbedSrc(input: string | null | undefined): string | null {
  if (!input) return null;
  const v = input.trim();
  if (!v) return null;

  // Already an embeddable URL.
  if (/google\.[^/]+\/maps\/embed/.test(v)) return v;

  // A pasted <iframe …src="…"> — pull the src out.
  const iframeSrc = v.match(/src=["']([^"']+)["']/i);
  if (iframeSrc) return iframeSrc[1];

  // A normal maps URL → reuse it with output=embed.
  if (/^https?:\/\/(www\.)?google\.[^/]+\/maps/.test(v)) {
    const sep = v.includes("?") ? "&" : "?";
    return `${v}${sep}output=embed`;
  }
  if (/^https?:\/\/(maps\.google\.|goo\.gl\/maps|maps\.app\.goo\.gl)/.test(v)) {
    const sep = v.includes("?") ? "&" : "?";
    return `${v}${sep}output=embed`;
  }

  // Treat anything else as a place query.
  return `https://www.google.com/maps?q=${encodeURIComponent(v)}&output=embed`;
}

/** Build a Maps *link* (for the "open in Maps" button) from a query/url. */
export function mapsLinkHref(
  url: string | null | undefined,
  query: string,
): string {
  if (url && /^https?:\/\//.test(url.trim())) return url.trim();
  return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
}

/** YouTube watch / youtu.be / live URL → embed src, else null. */
export function youtubeEmbedSrc(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) return url;
      if (u.pathname.startsWith("/live/")) {
        const id = u.pathname.split("/")[2];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      // channel live: /@handle/live can't be embedded by id; fall back to null.
      return null;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

/** Instagram profile/post/reel URL → embed src (best-effort), else null. */
export function instagramEmbedSrc(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("instagram.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    // Posts & reels support the official /embed endpoint.
    if (parts[0] === "p" || parts[0] === "reel") {
      return `https://www.instagram.com/${parts[0]}/${parts[1]}/embed`;
    }
    // A profile: embed the profile feed.
    if (parts.length === 1) {
      return `https://www.instagram.com/${parts[0]}/embed`;
    }
    return null;
  } catch {
    return null;
  }
}
