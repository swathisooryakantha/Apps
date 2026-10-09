-- Wedding Planner schema (multi-user)
-- Run this in the SQL editor of a NEW Supabase project.
--
-- Every planning table belongs to a wedding (wedding_id). Row Level Security only
-- lets a signed-in user read or write rows of weddings they are a member of, so
-- each couple's data stays private even though the anon key ships with the app.

create extension if not exists "pgcrypto";

-- A wedding is the shared workspace that a couple (and later, helpers) plan in.
create table if not exists weddings (
  id uuid primary key default gen_random_uuid(),
  bride_name text,
  groom_name text,
  wedding_date date,
  total_budget numeric(12, 2) default 0,
  theme_color text default '#e11d48',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz default now()
);

create table if not exists wedding_members (
  wedding_id uuid not null references weddings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner')) default 'owner',
  created_at timestamptz default now(),
  primary key (wedding_id, user_id)
);

create index if not exists wedding_members_user_idx on wedding_members(user_id);

-- Ceremonies / functions (engagement, muhurtham, reception, etc.)
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
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
  wedding_id uuid not null references weddings(id) on delete cascade,
  parent_id uuid references budget_items(id) on delete cascade,
  category text not null,
  item_name text not null,
  estimated_cost numeric(12, 2) default 0,
  actual_cost numeric(12, 2) default 0,
  paid boolean default false,
  side text check (side in ('bride', 'groom', 'gift')) default 'bride',
  notes text,
  created_at timestamptz default now()
);

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  name text not null,
  side text check (side in ('bride', 'groom', 'both')) default 'both',
  group_name text,
  rsvp_status text check (rsvp_status in ('pending', 'yes', 'no')) default 'pending',
  plus_one_count int default 0,
  phone text,
  needs_stay boolean default false,
  invite_sent boolean default false,
  notes text,
  created_at timestamptz default now()
);

create table if not exists stay_venues (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  name text not null,
  address text,
  contact text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists stay_rooms (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  stay_venue_id uuid references stay_venues(id) on delete cascade,
  room_label text not null,
  capacity int default 2,
  notes text,
  created_at timestamptz default now()
);

-- Maps guests to a specific room (a guest entry can represent multiple people via plus_one_count)
create table if not exists stay_assignments (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  stay_room_id uuid references stay_rooms(id) on delete cascade,
  guest_id uuid references guests(id) on delete cascade,
  created_at timestamptz default now(),
  unique (stay_room_id, guest_id)
);

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
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
  wedding_id uuid not null references weddings(id) on delete cascade,
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
  wedding_id uuid not null references weddings(id) on delete cascade,
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
  wedding_id uuid not null references weddings(id) on delete cascade,
  title text not null,
  category text,
  image_url text,
  source_link text,
  notes text,
  created_at timestamptz default now()
);

-- Gifts received, tracked so the couple can plan what to buy/avoid duplicates after the wedding
create table if not exists gifts (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  giver_name text not null,
  relation text,
  category text,
  gift_description text,
  amount numeric(12, 2),
  notes text,
  created_at timestamptz default now()
);

-- Our story: relationship milestones (first met, asked out, parents met, etc.) with a date for a "days since" counter
create table if not exists story_milestones (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  title text not null,
  milestone_date date,
  description text,
  created_at timestamptz default now()
);

-- Wedding journal: a daily mood entry per person, paired with a comforting quote
create table if not exists mood_entries (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  person text check (person in ('bride', 'groom')) not null,
  entry_date date not null default current_date,
  mood text not null,
  quote text,
  note text,
  created_at timestamptz default now()
);

-- Post-wedding setup checklist (new home, appliances, document updates, etc.)
create table if not exists post_wedding_items (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  parent_id uuid references post_wedding_items(id) on delete cascade,
  title text not null,
  category text,
  cost numeric(12, 2),
  done boolean default false,
  owner text,
  notes text,
  created_at timestamptz default now()
);

-- True when the signed-in user belongs to the given wedding. SECURITY DEFINER so
-- policies on wedding_members can use it without recursing into themselves.
create or replace function is_wedding_member(wid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from wedding_members where wedding_id = wid and user_id = auth.uid()
  )
$$;

-- Creates a wedding and makes the caller its owner in one step.
create or replace function create_wedding(p_bride_name text, p_groom_name text, p_wedding_date date)
returns weddings
language plpgsql
security definer
set search_path = public
as $$
declare
  w weddings;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  insert into weddings (bride_name, groom_name, wedding_date, created_by)
  values (nullif(trim(p_bride_name), ''), nullif(trim(p_groom_name), ''), p_wedding_date, auth.uid())
  returning * into w;
  insert into wedding_members (wedding_id, user_id, role) values (w.id, auth.uid(), 'owner');
  return w;
end
$$;

revoke execute on function is_wedding_member(uuid) from public, anon;
revoke execute on function create_wedding(text, text, date) from public, anon;
grant execute on function is_wedding_member(uuid) to authenticated;
grant execute on function create_wedding(text, text, date) to authenticated;

-- Row Level Security
alter table weddings enable row level security;
alter table wedding_members enable row level security;

drop policy if exists "members can read wedding" on weddings;
create policy "members can read wedding" on weddings
  for select to authenticated using (is_wedding_member(id));

drop policy if exists "members can update wedding" on weddings;
create policy "members can update wedding" on weddings
  for update to authenticated using (is_wedding_member(id)) with check (is_wedding_member(id));

drop policy if exists "owners can delete wedding" on weddings;
create policy "owners can delete wedding" on weddings
  for delete to authenticated using (
    exists (
      select 1 from wedding_members
      where wedding_id = weddings.id and user_id = auth.uid() and role = 'owner'
    )
  );

-- Weddings are created through create_wedding(); memberships are managed through functions too.
drop policy if exists "members can see fellow members" on wedding_members;
create policy "members can see fellow members" on wedding_members
  for select to authenticated using (is_wedding_member(wedding_id));

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'events','budget_items','guests',
    'stay_venues','stay_rooms','stay_assignments','vendors','tasks',
    'shopping_items','inspiration_items','gifts','story_milestones','mood_entries','post_wedding_items'
  ])
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create index if not exists %I on %I (wedding_id)', t || '_wedding_idx', t);
    execute format('drop policy if exists "allow anon full access" on %I', t);
    execute format('drop policy if exists "wedding members full access" on %I', t);
    execute format(
      'create policy "wedding members full access" on %I for all to authenticated '
      'using (is_wedding_member(wedding_id)) with check (is_wedding_member(wedding_id))',
      t
    );
  end loop;
end $$;
