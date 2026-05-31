// Reusable decorative pieces shared across the invitation, all theme-aware
// (they inherit currentColor / CSS vars so they recolor with the theme).

/** A pair of interlocking wedding rings — used as a monogram mark. */
export function RingsMark({
  className = "",
  size = 56,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      aria-hidden
    >
      <g fill="none" stroke="currentColor" strokeWidth={22}>
        <circle cx="198" cy="320" r="120" />
        <circle cx="314" cy="320" r="120" />
      </g>
      <path d="M314 96 l34 48 -34 50 -34 -50 z" fill="currentColor" />
    </svg>
  );
}

/** Ornamental divider: a center motif flanked by tapering lines. */
export function Divider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 text-[color:var(--accent)] ${className}`}
      aria-hidden
    >
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-current sm:w-20" />
      <svg width="46" height="16" viewBox="0 0 46 16" fill="none">
        <path
          d="M2 8h12M44 8H32M23 2c3 3 3 9 0 12c-3-3-3-9 0-12Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="23" cy="8" r="1.6" fill="currentColor" />
      </svg>
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-current sm:w-20" />
    </div>
  );
}

/** A small corner flourish (rotate via className for each corner). */
export function CornerFlourish({ className = "" }: { className?: string }) {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      aria-hidden
    >
      <path
        d="M10 10c40 0 60 20 60 60M10 10c0 40 20 60 60 60M10 30c22 0 40 18 40 40M30 10c22 0 40 18 40 40"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.8"
      />
      <circle cx="70" cy="70" r="3" fill="currentColor" />
    </svg>
  );
}

/** Section heading with a small eyebrow label and an ornamental divider. */
export function SectionTitle({
  eyebrow,
  title,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={`text-center ${className}`}>
      {eyebrow && (
        <p className="reveal text-[0.8rem] uppercase tracking-[0.35em] text-[color:var(--accent)] sm:text-sm">
          {eyebrow}
        </p>
      )}
      <h2 className="reveal mt-3 font-serif text-[2.5rem] leading-[1.1] text-[color:var(--heading)] sm:text-6xl">
        {title}
      </h2>
      <Divider className="reveal mt-5" />
    </div>
  );
}
