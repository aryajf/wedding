-- =============================================================================
--  Digital Wedding Invitation & Guest Management Platform
--  Supabase schema, RLS, storage policies & Realtime setup
-- -----------------------------------------------------------------------------
--  Run in the Supabase SQL Editor (Dashboard → SQL → New query).
--  Idempotent: safe to re-run as the project grows.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. SETTINGS (singleton row: theme + content + media for the whole invite)
-- ---------------------------------------------------------------------------
create table if not exists public.wedding_settings (
  id int primary key default 1,

  -- THEME -------------------------------------------------------------------
  background_color   text not null default '#f7e1cd',
  text_color         text not null default '#4a3b2f',
  heading_color      text not null default '#7d5a3c',
  accent_color       text not null default '#c08552',
  progress_color     text not null default '#c08552',
  selection_color    text not null default '#fff8ef',
  selection_bg_color text not null default '#c08552',
  font_family        text not null default 'serif',

  -- CORE CONTENT ------------------------------------------------------------
  bride_name   text not null default 'Bride',
  groom_name   text not null default 'Groom',
  hero_message text          default 'Together with their families, invite you to celebrate their wedding',
  event_date   timestamptz,

  ceremony_title     text default 'The Ceremony',
  ceremony_location  text,
  ceremony_address   text,
  reception_title    text default 'The Reception',
  reception_location text,
  reception_address  text,

  love_story      text,
  closing_message text default 'We can''t wait to celebrate with you!',

  -- MEDIA -------------------------------------------------------------------
  hero_image_url text,
  music_url      text,
  gallery        jsonb not null default '[]'::jsonb,   -- [{ url, caption }]

  updated_at timestamptz not null default now(),
  constraint wedding_settings_singleton check (id = 1)
);

-- New columns added as the platform expanded (safe to re-run) ---------------
alter table public.wedding_settings
  add column if not exists cover_enabled    boolean not null default true,
  add column if not exists prewedding_video_url text,

  -- Couple profiles
  add column if not exists bride_full_name  text,
  add column if not exists bride_photo_url  text,
  add column if not exists bride_bio        text,
  add column if not exists bride_parents    text,
  add column if not exists bride_instagram  text,
  add column if not exists groom_full_name  text,
  add column if not exists groom_photo_url  text,
  add column if not exists groom_bio        text,
  add column if not exists groom_parents    text,
  add column if not exists groom_instagram  text,

  -- Quote / verse
  add column if not exists quote_text   text,
  add column if not exists quote_source text,

  -- Repeatable structured content (jsonb arrays)
  add column if not exists events         jsonb not null default '[]'::jsonb, -- [{title,datetime,location,address,maps_url}]
  add column if not exists story_timeline jsonb not null default '[]'::jsonb, -- [{date,title,description,image}]
  add column if not exists livestream     jsonb not null default '[]'::jsonb, -- [{label,url}]

  -- Gift / Angpao
  add column if not exists gift_enabled  boolean not null default false,
  add column if not exists gift_message  text,
  add column if not exists bank_accounts jsonb not null default '[]'::jsonb,  -- [{bank,holder,number,logo_url}]
  add column if not exists ewallets      jsonb not null default '[]'::jsonb,  -- [{label,number,url,qr_url,logo_url}]
  add column if not exists gift_address  text,

  -- Health protocols
  add column if not exists health_enabled   boolean not null default false,
  add column if not exists health_protocols text,

  -- Extra theme colors (added later)
  add column if not exists progress_color     text not null default '#c08552',
  add column if not exists selection_color    text not null default '#fff8ef',
  add column if not exists selection_bg_color text not null default '#c08552';

insert into public.wedding_settings (id)
values (1)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 2. GUESTS (per-guest invite links, QR tickets & check-in state)
-- ---------------------------------------------------------------------------
create table if not exists public.guests (
  id            uuid primary key default gen_random_uuid(),
  token         text unique not null,         -- short code embedded in QR / ?to=
  name          text not null,
  category      text,                          -- Family / Friend / VIP …
  invited_count int  not null default 1 check (invited_count between 1 and 50),
  checked_in    boolean not null default false,
  checked_in_at timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists guests_token_idx on public.guests (token);

-- ---------------------------------------------------------------------------
-- 3. WISHES (public guestbook + attendance — drives the live board)
--    attendance: 'yes' (can attend) | 'no' (cannot) | 'none' (undecided)
-- ---------------------------------------------------------------------------
create table if not exists public.wishes (
  id         uuid primary key default gen_random_uuid(),
  guest_name text not null,
  message    text not null,
  attendance text not null default 'none' check (attendance in ('yes','no','none')),
  approved   boolean not null default true,    -- admin can moderate
  created_at timestamptz not null default now()
);
create index if not exists wishes_created_at_idx on public.wishes (created_at desc);

-- For databases created before attendance existed:
alter table public.wishes
  add column if not exists attendance text not null default 'none';

-- ---------------------------------------------------------------------------
-- 5. CHECKINS (one row per scan — drives the realtime welcome screen)
-- ---------------------------------------------------------------------------
create table if not exists public.checkins (
  id         uuid primary key default gen_random_uuid(),
  guest_id   uuid references public.guests (id) on delete set null,
  guest_name text not null,
  created_at timestamptz not null default now()
);
create index if not exists checkins_created_at_idx on public.checkins (created_at desc);

-- ---------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.wedding_settings enable row level security;
alter table public.guests           enable row level security;
alter table public.wishes           enable row level security;
alter table public.checkins         enable row level security;

-- settings: public read, admin write
drop policy if exists "settings: public read"  on public.wedding_settings;
drop policy if exists "settings: admin insert"  on public.wedding_settings;
drop policy if exists "settings: admin update"  on public.wedding_settings;
create policy "settings: public read" on public.wedding_settings for select using (true);
create policy "settings: admin insert" on public.wedding_settings for insert to authenticated with check (true);
create policy "settings: admin update" on public.wedding_settings for update to authenticated using (true) with check (true);

-- guests: ADMIN ONLY (public page resolves guests server-side via the secret key)
drop policy if exists "guests: admin all" on public.guests;
create policy "guests: admin all" on public.guests for all to authenticated using (true) with check (true);

-- wishes: anyone inserts; anyone reads APPROVED ones; admin full control
drop policy if exists "wishes: public insert"   on public.wishes;
drop policy if exists "wishes: public read ok"  on public.wishes;
drop policy if exists "wishes: admin read all"  on public.wishes;
drop policy if exists "wishes: admin update"    on public.wishes;
drop policy if exists "wishes: admin delete"    on public.wishes;
create policy "wishes: public insert"  on public.wishes for insert to anon, authenticated with check (true);
create policy "wishes: public read ok" on public.wishes for select to anon using (approved = true);
create policy "wishes: admin read all" on public.wishes for select to authenticated using (true);
create policy "wishes: admin update"   on public.wishes for update to authenticated using (true) with check (true);
create policy "wishes: admin delete"   on public.wishes for delete to authenticated using (true);

-- checkins: admin inserts; everyone can read (welcome screen subscribes)
drop policy if exists "checkins: public read"  on public.checkins;
drop policy if exists "checkins: admin insert" on public.checkins;
create policy "checkins: public read"  on public.checkins for select to anon, authenticated using (true);
create policy "checkins: admin insert" on public.checkins for insert to authenticated with check (true);

-- ---------------------------------------------------------------------------
-- 7. STORAGE — public bucket `media`
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media: public read"  on storage.objects;
drop policy if exists "media: admin insert" on storage.objects;
drop policy if exists "media: admin update" on storage.objects;
drop policy if exists "media: admin delete" on storage.objects;
create policy "media: public read"  on storage.objects for select using (bucket_id = 'media');
create policy "media: admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'media');
create policy "media: admin update" on storage.objects for update to authenticated using (bucket_id = 'media');
create policy "media: admin delete" on storage.objects for delete to authenticated using (bucket_id = 'media');

-- ---------------------------------------------------------------------------
-- 8. REALTIME — broadcast row changes for the wishes board & welcome screen
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    alter publication supabase_realtime add table public.wishes;
  exception when duplicate_object then null; end;
  begin
    alter publication supabase_realtime add table public.checkins;
  exception when duplicate_object then null; end;
end $$;
