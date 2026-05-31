import type { WeddingSettings } from "@/lib/types";
import { SectionTitle, RingsMark } from "./Ornaments";

function Profile({
  name,
  photo,
  bio,
  parents,
  instagram,
}: {
  name: string;
  photo: string | null;
  bio: string | null;
  parents: string | null;
  instagram: string | null;
}) {
  return (
    <div className="reveal flex flex-col items-center text-center">
      <div className="relative">
        {/* decorative ring frame */}
        <div
          className="absolute -inset-2 rounded-full opacity-60"
          style={{
            background: `conic-gradient(from 0deg, var(--accent), transparent, var(--accent))`,
          }}
          aria-hidden
        />
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={name}
            className="relative h-48 w-48 rounded-full object-cover shadow-xl ring-4 ring-[color:var(--bg)]"
          />
        ) : (
          <div
            className="relative flex h-48 w-48 items-center justify-center rounded-full font-serif text-6xl text-white shadow-xl ring-4 ring-[color:var(--bg)]"
            style={{ background: "var(--accent)" }}
          >
            {name.charAt(0)}
          </div>
        )}
      </div>
      <h3 className="mt-6 font-serif text-4xl text-[color:var(--heading)]">
        {name}
      </h3>
      {parents && (
        <p className="mt-2 text-base italic text-[color:var(--text)]/70">
          {parents}
        </p>
      )}
      {bio && (
        <p className="mt-3 max-w-xs text-lg leading-relaxed text-[color:var(--text)]/90">
          {bio}
        </p>
      )}
      {instagram && (
        <a
          href={`https://instagram.com/${instagram.replace(/^@/, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm text-[color:var(--accent)] ring-1 ring-[color:var(--accent)] transition-colors hover:bg-[color:var(--accent)] hover:text-white"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
          </svg>
          @{instagram.replace(/^@/, "")}
        </a>
      )}
    </div>
  );
}

export function CoupleProfiles({ settings }: { settings: WeddingSettings }) {
  return (
    <section className="px-6 py-20 sm:py-28">
      <SectionTitle
        eyebrow="With joyful hearts"
        title="The Happy Couple"
        className="mb-16"
      />
      <div className="mx-auto grid max-w-4xl items-start gap-12 sm:grid-cols-[1fr_auto_1fr] sm:gap-6">
        <Profile
          name={settings.bride_full_name || settings.bride_name}
          photo={settings.bride_photo_url}
          bio={settings.bride_bio}
          parents={settings.bride_parents}
          instagram={settings.bride_instagram}
        />
        <div className="reveal flex items-center justify-center self-center">
          <span
            className="animate-float font-serif text-5xl italic"
            style={{ color: "var(--accent)" }}
          >
            <RingsMark size={56} />
          </span>
        </div>
        <Profile
          name={settings.groom_full_name || settings.groom_name}
          photo={settings.groom_photo_url}
          bio={settings.groom_bio}
          parents={settings.groom_parents}
          instagram={settings.groom_instagram}
        />
      </div>
    </section>
  );
}
