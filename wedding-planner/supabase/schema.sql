-- Wedding Planner schema
-- Run this in the Supabase SQL editor for your project.

create extension if not exists "pgcrypto";

-- Wedding-level settings (single row, holds the wedding date used for the countdown)
create table if not exists wedding_settings (
  id uuid primary key default gen_random_uuid(),
  bride_name text,
  groom_name text,
  wedding_date date,
  total_budget numeric(12, 2) default 0,
  created_at timestamptz default now()
);

-- Ceremonies / functions (engagement, muhurtham, reception, etc.)
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date date,
  start_time time,
  end_time time,
  venue text,
  notes text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists budget_items (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references budget_items(id) on delete cascade,
  category text not null,
  item_name text not null,
  estimated_cost numeric(12, 2) default 0,
  actual_cost numeric(12, 2) default 0,
  paid boolean default false,
  notes text,
  created_at timestamptz default now()
);

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  side text check (side in ('bride', 'groom', 'both')) default 'both',
  group_name text,
  rsvp_status text check (rsvp_status in ('pending', 'yes', 'no')) default 'pending',
  plus_one_count int default 0,
  phone text,
  needs_stay boolean default false,
  notes text,
  created_at timestamptz default now()
);

create table if not exists stay_venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  contact text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists stay_rooms (
  id uuid primary key default gen_random_uuid(),
  stay_venue_id uuid references stay_venues(id) on delete cascade,
  room_label text not null,
  capacity int default 2,
  notes text,
  created_at timestamptz default now()
);

-- Maps guests to a specific room (a guest entry can represent multiple people via plus_one_count)
create table if not exists stay_assignments (
  id uuid primary key default gen_random_uuid(),
  stay_room_id uuid references stay_rooms(id) on delete cascade,
  guest_id uuid references guests(id) on delete cascade,
  created_at timestamptz default now(),
  unique (stay_room_id, guest_id)
);

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  contact_name text,
  phone text,
  price numeric(12, 2),
  status text check (status in ('considering', 'contacted', 'booked')) default 'considering',
  notes text,
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references tasks(id) on delete cascade,
  title text not null,
  timeframe text,
  due_date date,
  done boolean default false,
  owner text,
  notes text,
  created_at timestamptz default now()
);

-- Pre-wedding shopping & prep activities (saree shopping, blouse stitching, jewelry, etc.)
create table if not exists shopping_items (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  category text,
  status text check (status in ('to_do', 'in_progress', 'done')) default 'to_do',
  store_or_vendor text,
  cost numeric(12, 2),
  due_date date,
  notes text,
  created_at timestamptz default now()
);

create table if not exists inspiration_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  image_url text,
  source_link text,
  notes text,
  created_at timestamptz default now()
);

-- Enable Row Level Security with permissive policies for the anon key.
-- This app is intended for private/personal use shared only with people who have the link + anon key.
alter table wedding_settings enable row level security;
alter table events enable row level security;
alter table budget_items enable row level security;
alter table guests enable row level security;
alter table stay_venues enable row level security;
alter table stay_rooms enable row level security;
alter table stay_assignments enable row level security;
alter table vendors enable row level security;
alter table tasks enable row level security;
alter table shopping_items enable row level security;
alter table inspiration_items enable row level security;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'wedding_settings','events','budget_items','guests',
    'stay_venues','stay_rooms','stay_assignments','vendors','tasks',
    'shopping_items','inspiration_items'
  ])
  loop
    execute format('drop policy if exists "allow anon full access" on %I', t);
    execute format(
      'create policy "allow anon full access" on %I for all using (true) with check (true)', t
    );
  end loop;
end $$;
