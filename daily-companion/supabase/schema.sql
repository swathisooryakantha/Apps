-- Daily Companion schema
-- Run this in the Supabase SQL editor for your project.

create extension if not exists "pgcrypto";

-- Single-row app settings: the challenge chosen at start. Counter only ever moves forward.
create table if not exists app_settings (
  id uuid primary key default gen_random_uuid(),
  challenge_length int not null check (challenge_length in (30, 75)) default 75,
  start_date date not null default current_date,
  created_at timestamptz default now()
);

-- The user's own short list of routines/chores to track each day.
create table if not exists routines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- One row per calendar day. day_number is only assigned once the day is completed,
-- so the arc counter (day_number) never reflects an abandoned or skipped day.
create table if not exists daily_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null unique,
  day_number int,
  mood text check (mood in ('drained', 'anxious', 'flat', 'frustrated', 'good', 'great')),
  personality text not null default 'deadpan_coach',
  mode text check (mode in ('hard', 'soft')),
  current_step text not null default 'mood' check (current_step in ('mood', 'mode', 'routines', 'grounding', 'curiosity', 'done')),
  grounding_exercise_id text,
  grounding_done boolean not null default false,
  curiosity_id text,
  curiosity_viewed_count int not null default 0,
  completed boolean not null default false,
  created_at timestamptz default now()
);

-- Per-day completion state for each routine item.
create table if not exists routine_completions (
  id uuid primary key default gen_random_uuid(),
  daily_entry_id uuid not null references daily_entries(id) on delete cascade,
  routine_id uuid not null references routines(id) on delete cascade,
  done boolean not null default false,
  created_at timestamptz default now(),
  unique (daily_entry_id, routine_id)
);

-- Enable Row Level Security with permissive policies for the anon key.
-- This app is intended for private/personal use shared only with people who have the link + anon key.
alter table app_settings enable row level security;
alter table routines enable row level security;
alter table daily_entries enable row level security;
alter table routine_completions enable row level security;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'app_settings', 'routines', 'daily_entries', 'routine_completions'
  ])
  loop
    execute format('drop policy if exists "allow anon full access" on %I', t);
    execute format(
      'create policy "allow anon full access" on %I for all using (true) with check (true)', t
    );
  end loop;
end $$;
