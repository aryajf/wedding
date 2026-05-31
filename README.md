# Digital Wedding Invitation & Guest-Management Platform

A customizable wedding invitation built with **Next.js 16** (App Router) and
**Supabase**. It pairs a public, brand-led invitation page with a self-serve
admin builder, QR guest check-in, and a realtime venue welcome screen. The
couple configures everything in `/admin`; the public page renders entirely from
saved settings, so one codebase powers many weddings.

## Features

- **Public invitation** (`/`): animated cover, dynamic per-guest greeting via
  `?to=<token>`, countdown, couple profiles, story timeline, photo gallery with
  lightbox, prewedding video, Google Maps + YouTube/Instagram live embeds, gift
  details with copy-to-clipboard, guestbook with attendance, and a downloadable
  QR entry ticket.
- **Admin builder** (`/admin`): live phone-style preview, theme + font presets,
  content/couple/media/gift editors, guest CRUD with WhatsApp broadcast, and
  guestbook moderation.
- **Check-in** (`/admin/checkin`): live QR scanner (`BarcodeDetector`) with a
  manual fallback.
- **Welcome screen** (`/welcome-screen`): a venue TV/projector view that greets
  each guest in realtime the moment they're checked in.
- **PWA**: installable, with offline caching and ring-themed icons.

## Stack

Next.js 16.2 (Turbopack) · React 19 · Tailwind v4 · GSAP · Supabase
(`@supabase/ssr` + `supabase-js`, Postgres + Auth + Storage + Realtime) ·
qrcode.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:

```bash
# ---- Public (safe to expose to the browser) ----
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# ---- Server-only — NEVER expose to the browser (no NEXT_PUBLIC_ prefix) ----
SUPABASE_URL=
SUPABASE_SECRET_KEY=
SUPABASE_BUCKET=

# ---- Admin login (username-based; seed.mjs creates this confirmed account) ----
ADMIN_USERNAME=
ADMIN_PASSWORD=

# Internal email domain used to map the admin username onto a Supabase Auth email.
# (Supabase Auth identifies users by email; we derive `<username>@<this domain>`.)
ADMIN_EMAIL_DOMAIN=
```

Where to find each value (Supabase dashboard → Project Settings → API):

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL` | Project URL (same value for both) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable / `anon` key (safe for the browser) |
| `SUPABASE_SECRET_KEY` | Secret / `service_role` key (server only, bypasses RLS — keep private) |
| `SUPABASE_BUCKET` | Storage bucket name for uploads, e.g. `media` |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | The admin login the seed script creates |
| `ADMIN_EMAIL_DOMAIN` | Any internal domain, e.g. `wedding.local` |

> Never commit `.env.local` or expose the secret key / admin password to the
> browser. If a secret is ever leaked, rotate it in the Supabase dashboard.

### 3. Set up the database

`supabase/schema.sql` is the single source of truth (tables, RLS, the storage
bucket, and Realtime). Apply it with the Supabase CLI — it uses the Management
API, so no database password is needed:

```bash
supabase link --project-ref <your-project-ref> --yes
supabase db query --linked -f supabase/schema.sql
```

(Or paste the contents of `supabase/schema.sql` into the Supabase SQL editor.)

### 4. Seed the admin account and demo content

```bash
npm run seed -- --demo
```

This creates the confirmed admin user (from `ADMIN_USERNAME` / `ADMIN_PASSWORD`)
and fills in demo content, sample guests, and wishes. Omit `--demo` to only
create the admin user without overwriting existing content.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the invitation, and
[http://localhost:3000/admin](http://localhost:3000/admin) to log in to the
builder.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Turbopack dev server |
| `npm run build` | Production build (also type-checks) |
| `npm run start` | Serve the production build |
| `npm run seed` | Create/confirm the admin user (add `-- --demo` to load demo content) |
| `npm run gen:icons` | Regenerate the ring PWA icons |

## Notes

- For PWA install prompts and push, serve over HTTPS:
  `next dev --experimental-https`.
- Guest-facing copy is mostly Indonesian; keep that voice when editing.
- See `CLAUDE.md` for architecture details and `PRODUCT.md` for brand context.
