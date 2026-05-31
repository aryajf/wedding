-- =============================================================================
--  Migration 002 — unify RSVP into the guestbook + extra theme colors
-- -----------------------------------------------------------------------------
--  Run in the Supabase SQL Editor. Idempotent.
-- =============================================================================

-- 1. Wishes gain an attendance choice (replaces the separate RSVP form):
--      'yes'  → can attend
--      'no'   → cannot attend
--      'none' → left blank / undecided
alter table public.wishes
  add column if not exists attendance text not null default 'none';

-- Backfill + constrain to the allowed values.
update public.wishes set attendance = 'none'
  where attendance not in ('yes', 'no', 'none');

do $$
begin
  alter table public.wishes
    add constraint wishes_attendance_check
    check (attendance in ('yes', 'no', 'none'));
exception when duplicate_object then null;
end $$;

-- 2. Extra theme colors (scroll-progress bar + text selection).
alter table public.wedding_settings
  add column if not exists progress_color     text not null default '#c08552',
  add column if not exists selection_color    text not null default '#fff8ef',
  add column if not exists selection_bg_color text not null default '#c08552';

-- 3. RSVP feature removed from the app. The table is no longer used.
--    Uncomment to permanently drop it (destructive — removes stored RSVPs):
-- drop table if exists public.rsvps;
