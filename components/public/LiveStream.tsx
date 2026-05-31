import type { LinkItem } from "@/lib/types";
import { youtubeEmbedSrc, instagramEmbedSrc } from "@/lib/embeds";
import { SectionTitle } from "./Ornaments";

type Resolved = {
  label: string;
  url: string;
  kind: "youtube" | "instagram";
  embed: string | null;
};

function resolve(link: LinkItem): Resolved | null {
  const yt = youtubeEmbedSrc(link.url);
  if (yt || /youtu\.?be/.test(link.url))
    return { ...link, kind: "youtube", embed: yt };
  const ig = instagramEmbedSrc(link.url);
  if (ig || /instagram\.com/.test(link.url))
    return { ...link, kind: "instagram", embed: ig };
  return null;
}

export function LiveStream({ links }: { links: LinkItem[] }) {
  const resolved = links.map(resolve).filter(Boolean) as Resolved[];
  if (resolved.length === 0) return null;

  return (
    <section className="px-6 py-20 sm:py-28">
      <SectionTitle
        eyebrow="Hadir dari mana saja"
        title="Live Streaming"
        className="mb-4"
      />
      <p className="reveal mx-auto mb-12 max-w-md text-center text-lg text-[color:var(--text)]/80">
        Tidak bisa hadir langsung? Saksikan momen kami secara langsung.
      </p>

      <div
        className={`mx-auto grid max-w-5xl gap-6 ${
          resolved.length > 1 ? "lg:grid-cols-2" : "max-w-2xl"
        }`}
      >
        {resolved.map((r, i) => (
          <figure key={i} className="card-lux reveal overflow-hidden">
            <figcaption className="flex items-center gap-2.5 px-5 pt-5 pb-3">
              <PlatformIcon kind={r.kind} />
              <span className="font-serif text-2xl text-[color:var(--heading)]">
                {r.label}
              </span>
              <span className="ml-auto flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                LIVE
              </span>
            </figcaption>

            <div className="relative aspect-video bg-black/5">
              {r.embed ? (
                <iframe
                  src={r.embed}
                  title={r.label}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  scrolling="no"
                  className="absolute inset-0 h-full w-full"
                />
              ) : (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-[color:var(--text)]/80 transition hover:bg-black/[0.03]"
                >
                  <PlatformIcon kind={r.kind} large />
                  <span className="text-sm font-medium">
                    Buka {r.label} ↗
                  </span>
                </a>
              )}
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}

function PlatformIcon({
  kind,
  large = false,
}: {
  kind: "youtube" | "instagram";
  large?: boolean;
}) {
  const s = large ? 40 : 22;
  if (kind === "youtube") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#ff0000"
          d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8Z"
        />
        <path fill="#fff" d="M9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
      </svg>
    );
  }
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden>
      <defs>
        <radialGradient id="ig" cx="30%" cy="107%" r="135%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig)" />
      <rect x="5" y="5" width="14" height="14" rx="4.5" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.4" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="16.4" cy="7.6" r="1.1" fill="#fff" />
    </svg>
  );
}
