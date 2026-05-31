// Curated wedding font pairings. Each option pairs a display/heading face with
// a readable body face. The `font_family` setting stores the option `key`;
// `themeToCssVars` resolves it to `--font-heading` + `--font` (body) using the
// CSS variables registered by next/font in `app/layout.tsx`.

export type FontOption = {
  key: string;
  label: string;
  /** CSS var (with fallback) for headings / display type. */
  heading: string;
  /** CSS var (with fallback) for body copy. */
  body: string;
};

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "system-ui, -apple-system, sans-serif";

export const FONT_OPTIONS: FontOption[] = [
  {
    key: "classic",
    label: "Klasik Elegan — Cormorant",
    heading: `var(--font-cormorant), ${SERIF}`,
    body: `var(--font-montserrat), ${SANS}`,
  },
  {
    key: "timeless",
    label: "Timeless — Playfair Display",
    heading: `var(--font-playfair), ${SERIF}`,
    body: `var(--font-montserrat), ${SANS}`,
  },
  {
    key: "romantic",
    label: "Romantis — Great Vibes (script)",
    heading: `var(--font-great-vibes), cursive`,
    body: `var(--font-cormorant), ${SERIF}`,
  },
  {
    key: "calligraphy",
    label: "Kaligrafi — Sacramento (script)",
    heading: `var(--font-sacramento), cursive`,
    body: `var(--font-eb-garamond), ${SERIF}`,
  },
  {
    key: "garden",
    label: "Taman — Parisienne (script)",
    heading: `var(--font-parisienne), cursive`,
    body: `var(--font-jost), ${SANS}`,
  },
  {
    key: "whimsical",
    label: "Ceria — Dancing Script",
    heading: `var(--font-dancing), cursive`,
    body: `var(--font-jost), ${SANS}`,
  },
  {
    key: "refined",
    label: "Minimalis — Marcellus",
    heading: `var(--font-marcellus), ${SERIF}`,
    body: `var(--font-jost), ${SANS}`,
  },
  {
    key: "editorial",
    label: "Editorial — Libre Baskerville",
    heading: `var(--font-baskerville), ${SERIF}`,
    body: `var(--font-raleway), ${SANS}`,
  },
  {
    key: "heritage",
    label: "Heritage — EB Garamond",
    heading: `var(--font-eb-garamond), ${SERIF}`,
    body: `var(--font-eb-garamond), ${SERIF}`,
  },
  {
    key: "modern",
    label: "Modern — Poppins",
    heading: `var(--font-poppins), ${SANS}`,
    body: `var(--font-poppins), ${SANS}`,
  },
];

// Back-compat: the original two values stored before the catalog existed.
const ALIASES: Record<string, string> = { serif: "classic", sans: "modern" };

export function resolveFont(key: string | null | undefined): FontOption {
  const k = key ? (ALIASES[key] ?? key) : "classic";
  return FONT_OPTIONS.find((f) => f.key === k) ?? FONT_OPTIONS[0];
}
