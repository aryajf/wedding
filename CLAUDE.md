@AGENTS.md

# Digital Wedding Invitation & Guest-Management Platform

A customizable wedding invitation (public, brand-led) plus a self-serve admin
builder, guest check-in, and a realtime venue welcome screen. The couple
configures everything in `/admin`; the public page renders entirely from saved
settings. See `PRODUCT.md` for strategic/brand context (register = brand).

## Stack

- **Next.js 16.2.6** (App Router, Turbopack) — read `node_modules/next/dist/docs/` before writing Next code; it has breaking changes vs training data.
- **React 19.2**, **Tailwind v4** (`@import "tailwindcss"` + `@theme` in `app/globals.css`), **GSAP** (scroll reveals), **Supabase** (`@supabase/ssr` + `supabase-js`), **qrcode**.

### Next.js 16 gotchas (already handled — don't regress)
- `middleware` → **`proxy`**: auth gate is `proxy.ts` at root, function exported as `proxy`, Node runtime only. Shows as "Proxy (Middleware)" in the build route table.
- `cookies()` / `headers()` are **async** — must `await` (see `lib/supabase/server.ts`).
- `params` / `searchParams` are **Promises** in pages (see `app/page.tsx` `?to=`).
- `next build` no longer runs lint; TypeScript errors still fail the build.

## Architecture

- **Supabase clients** in `lib/supabase/`: `client.ts` (browser, publishable key), `server.ts` (SSR, async), `admin.ts` (secret key, bypasses RLS — server-only).
- **Auth**: username-based. `lib/auth.ts` `requireAdmin()` is the real gate; `proxy.ts` is the optimistic redirect. `usernameToEmail()` maps `admin` → `admin@${ADMIN_EMAIL_DOMAIN}` onto Supabase Auth. `seed.mjs` creates the confirmed account.
- **Data**: singleton `wedding_settings` row (id=1: theme + content + media; structured arrays `events`/`story_timeline`/`livestream`/`bank_accounts`/`ewallets`/`gallery` are jsonb). Plus `guests` (token invite links + QR + check-in, ADMIN-ONLY RLS — public page resolves `?to=<token>` server-side via secret key in `lib/guests.ts`), `wishes` (public guestbook + `attendance` 'yes'|'no'|'none', Realtime), `checkins` (one row per scan, Realtime → welcome screen). RSVP was removed; attendance lives on the guestbook.
- **Theming bridge**: hex colors in DB → `themeToCssVars()` (`lib/utils.ts`) → CSS vars `--bg/--text/--heading/--accent/--progress/--selection/--selection-bg/--font`, consumed by `globals.css` `@theme` + components. Fully data-driven so one structure = many weddings.
- **PWA**: `app/manifest.ts` (dynamic), `public/sw.js`, `components/ServiceWorkerRegister.tsx` (prod only). Ring icons via `scripts/gen-icons.mjs` → `public/icons/*` + `app/apple-icon.png`; favicon `app/icon.svg`.

## Key routes & components

- `/` → `app/page.tsx` → `components/public/Invitation.tsx` = thin wrapper (Cover gating + body scroll-lock, theme CSS vars, GSAP `.reveal`/`.hero-reveal`, music, ScrollProgress) around **`InvitationBody.tsx`** (hero → footer + `EventCard`). `InvitationBody` takes a `preview` flag and is the SINGLE source of section markup — the admin preview renders it too, so they never drift.
- Public sections in `components/public/`: `Cover`, `Countdown` (live, dynamic), `CoupleProfiles`, `Timeline` (clickable photos), `Quote`, `LiveStream` (YouTube/Instagram iframes), `VideoSection`, `GiftSection` (bank/e-wallet logos + copy), `WishesBoard` (Realtime guestbook + attendance; `preview` prop disables realtime/submit; two cards equal-height/sejajar via `lg:items-stretch`), `QrTicket`, `MusicPlayer`, `ScrollProgress`, `HealthProtocol` (themed popup, `docked` prop = absolute for preview), `Gallery` + `Timeline` share `Lightbox.tsx`. Embed helpers in `lib/embeds.ts`. Shared chrome in `Ornaments.tsx` (`RingsMark`/`Divider`/`SectionTitle`). Fonts: `lib/fonts.ts` (10 Google pairings) → `--font`/`--font-heading` via `themeToCssVars`.
- `/admin` → `components/admin/AdminDashboard.tsx`: split layout — editor ~40% (`2fr`) + full preview pane (`5fr`); below `lg` single column with a mobile preview overlay. `LivePreview` renders the REAL `InvitationBody` from the draft (accurate by construction: real iframes, live countdown, exact sizing). Tabs theme/content/couple/media/gift + guests/wishes. Shared inputs in `components/admin/ui.tsx` (`Field`/`Card`/`Toggle`/`ListEditor` with `image:true` upload field/`Stat`); `ColorPicker` = swatch-as-input (no overflow); 16 preset palettes + font specimen. `GuestsPanel` (CRUD + WhatsApp broadcast), `WishesPanel` (moderate + attendance stats), `CheckInClient` (`BarcodeDetector` QR scanner + manual fallback). Actions in `app/admin/actions.ts`.
- `/welcome-screen` → `WelcomeScreen.tsx` ("Layar Sapa", Realtime greeting on check-in). `/admin/checkin`, `/admin/login`, `/offline`.

## Design conventions (impeccable, brand register)

- Identity: Cormorant (serif) + Montserrat (sans), warm cream/gold palette (default `--bg #f7e1cd`, `--accent #c08552`).
- Cards use the **`.card-lux`** utility (warm gradient, hairline gradient ring, hover lift) — not flat static boxes. Also `.bg-grain`, `.progress-scroll` (guestbook, themed by `--progress`), `.thin-scroll`.
- Motion: ease-out only, `cubic-bezier(0.22,1,0.36,1)`; respect `prefers-reduced-motion` (GSAP reveals fall back). No bounce/elastic.
- Guest-facing copy is mostly Indonesian; keep that voice. No em dashes in UI copy.
- Theme colors (incl. progress bar + text selection) are admin-editable; verify custom themes stay WCAG AA legible.

## Workflow

```bash
npm run dev            # Turbopack dev server
npm run build          # production build (also typechecks)
npm run seed -- --demo # reset demo content (idempotent; resilient to missing cols)
npm run gen:icons      # regenerate ring PWA icons
```

### Database changes
`supabase/schema.sql` is the single source of truth: inline columns for fresh
DBs **and** idempotent `add column if not exists` blocks for existing ones.
Apply to the live DB with the linked CLI (uses the Management API via keyring —
no DB password needed):

```bash
supabase link --project-ref <ref> --yes
supabase db query --linked -f supabase/schema.sql
```

Then `npm run seed -- --demo`. Don't hand the user raw SQL to paste if the CLI
can apply it. Additive migrations (`add column if not exists`) are safe; confirm
before anything destructive.

## Env (`.env.local`)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (browser);
`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_BUCKET=media` (server-only);
`ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_EMAIL_DOMAIN`. Never expose secret
key / admin password to the browser; treat any pasted secrets as compromised
and rotate.
