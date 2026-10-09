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

-- Whether the dashboard carousel includes the starter illustrations alongside the couple's own photos.
alter table weddings add column if not exists show_default_photos boolean not null default true;

create table if not exists wedding_members (
  wedding_id uuid not null references weddings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner')) default 'owner',
  created_at timestamptz default now(),
  primary key (wedding_id, user_id)
);

create index if not exists wedding_members_user_idx on wedding_members(user_id);

-- Shown in Settings so members can see who else is in the wedding (auth.users isn't readable from the app).
alter table wedding_members add column if not exists email text;
alter table wedding_members add column if not exists display_name text;

-- Single-use invite links. Optionally tied to an email; expire after 7 days.
create table if not exists wedding_invites (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  token text not null unique default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  email text,
  invited_by uuid references auth.users(id) on delete set null default auth.uid(),
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists wedding_invites_wedding_idx on wedding_invites(wedding_id);

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

-- Co-ownership is limited to the couple.
create or replace function max_wedding_owners() returns int language sql immutable as $$ select 2 $$;

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
  insert into wedding_members (wedding_id, user_id, role, email, display_name)
  values (
    w.id, auth.uid(), 'owner',
    lower(auth.jwt() ->> 'email'),
    coalesce(auth.jwt() -> 'user_metadata' ->> 'full_name', auth.jwt() -> 'user_metadata' ->> 'name')
  );
  return w;
end
$$;

-- Creates an invite link for a wedding the caller belongs to. Replaces any earlier
-- unused invite, so there is at most one pending invite per wedding.
create or replace function create_invite(p_wedding_id uuid, p_email text)
returns wedding_invites
language plpgsql
security definer
set search_path = public
as $$
declare
  inv wedding_invites;
begin
  if not is_wedding_member(p_wedding_id) then
    raise exception 'not a member of this wedding';
  end if;
  if (select count(*) from wedding_members where wedding_id = p_wedding_id and role = 'owner') >= max_wedding_owners() then
    raise exception 'This wedding already has % co-owners.', max_wedding_owners();
  end if;
  delete from wedding_invites where wedding_id = p_wedding_id and accepted_at is null;
  insert into wedding_invites (wedding_id, email, invited_by)
  values (p_wedding_id, nullif(lower(trim(p_email)), ''), auth.uid())
  returning * into inv;
  return inv;
end
$$;

-- Lets someone holding an invite link see whose wedding it is before joining.
-- status: valid | expired | used | wrong_email | full | already_member | not_found
create or replace function invite_preview(p_token text)
returns table (bride_name text, groom_name text, status text, invited_email text)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  inv wedding_invites;
  w weddings;
begin
  select * into inv from wedding_invites where token = p_token;
  if not found then
    return query select null::text, null::text, 'not_found'::text, null::text;
    return;
  end if;
  select * into w from weddings where id = inv.wedding_id;
  return query select w.bride_name, w.groom_name,
    case
      when exists (select 1 from wedding_members where wedding_id = inv.wedding_id and user_id = auth.uid()) then 'already_member'
      when inv.accepted_at is not null then 'used'
      when inv.expires_at <= now() then 'expired'
      when inv.email is not null and inv.email <> lower(auth.jwt() ->> 'email') then 'wrong_email'
      when (select count(*) from wedding_members where wedding_id = inv.wedding_id and role = 'owner') >= max_wedding_owners() then 'full'
      else 'valid'
    end,
    inv.email;
end
$$;

-- Joins the wedding behind an invite link as a co-owner. Returns the wedding id.
create or replace function accept_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inv wedding_invites;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  select * into inv from wedding_invites where token = p_token for update;
  if not found then
    raise exception 'This invite link is not valid.';
  end if;
  if exists (select 1 from wedding_members where wedding_id = inv.wedding_id and user_id = auth.uid()) then
    return inv.wedding_id;
  end if;
  if inv.accepted_at is not null then
    raise exception 'This invite link has already been used.';
  end if;
  if inv.expires_at <= now() then
    raise exception 'This invite link has expired. Ask for a new one.';
  end if;
  if inv.email is not null and inv.email <> lower(auth.jwt() ->> 'email') then
    raise exception 'This invite is for %. Sign in with that email to accept it.', inv.email;
  end if;
  perform 1 from weddings where id = inv.wedding_id for update;
  if (select count(*) from wedding_members where wedding_id = inv.wedding_id and role = 'owner') >= max_wedding_owners() then
    raise exception 'This wedding already has % co-owners.', max_wedding_owners();
  end if;
  insert into wedding_members (wedding_id, user_id, role, email, display_name)
  values (
    inv.wedding_id, auth.uid(), 'owner',
    lower(auth.jwt() ->> 'email'),
    coalesce(auth.jwt() -> 'user_metadata' ->> 'full_name', auth.jwt() -> 'user_metadata' ->> 'name')
  );
  update wedding_invites set accepted_by = auth.uid(), accepted_at = now() where id = inv.id;
  return inv.wedding_id;
end
$$;

-- Removes the caller from a wedding. The last owner can't leave; they delete the wedding instead.
create or replace function leave_wedding(p_wedding_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_wedding_member(p_wedding_id) then
    raise exception 'not a member of this wedding';
  end if;
  perform 1 from weddings where id = p_wedding_id for update;
  if (select count(*) from wedding_members where wedding_id = p_wedding_id and role = 'owner' and user_id <> auth.uid()) = 0 then
    raise exception 'You are the only owner. Delete the wedding instead, or invite your partner first.';
  end if;
  delete from wedding_members where wedding_id = p_wedding_id and user_id = auth.uid();
end
$$;

do $$
declare
  f text;
begin
  for f in select unnest(array[
    'is_wedding_member(uuid)',
    'create_wedding(text, text, date)',
    'create_invite(uuid, text)',
    'invite_preview(text)',
    'accept_invite(text)',
    'leave_wedding(uuid)'
  ])
  loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;

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

-- Invites are created and accepted through functions; members can list and revoke them.
alter table wedding_invites enable row level security;

drop policy if exists "members can see invites" on wedding_invites;
create policy "members can see invites" on wedding_invites
  for select to authenticated using (is_wedding_member(wedding_id));

drop policy if exists "members can revoke invites" on wedding_invites;
create policy "members can revoke invites" on wedding_invites
  for delete to authenticated using (is_wedding_member(wedding_id) and accepted_at is null);

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

-- Links between rows (sub-items, rooms, room assignments) must stay inside one wedding,
-- so a row can never point at, or be cascade-deleted with, another wedding's data.
do $$
declare
  r record;
begin
  for r in select * from (values
    ('budget_items'), ('tasks'), ('post_wedding_items'), ('stay_venues'), ('stay_rooms'), ('guests')
  ) as t(tbl)
  loop
    if not exists (select 1 from pg_constraint where conname = r.tbl || '_id_wedding_key') then
      execute format('alter table %I add constraint %I unique (id, wedding_id)', r.tbl, r.tbl || '_id_wedding_key');
    end if;
  end loop;

  for r in select * from (values
    ('budget_items', 'parent_id', 'budget_items'),
    ('tasks', 'parent_id', 'tasks'),
    ('post_wedding_items', 'parent_id', 'post_wedding_items'),
    ('stay_rooms', 'stay_venue_id', 'stay_venues'),
    ('stay_assignments', 'stay_room_id', 'stay_rooms'),
    ('stay_assignments', 'guest_id', 'guests')
  ) as t(tbl, col, ref)
  loop
    if not exists (select 1 from pg_constraint where conname = r.tbl || '_' || r.col || '_same_wedding') then
      execute format(
        'alter table %I add constraint %I foreign key (%I, wedding_id) references %I (id, wedding_id) on delete cascade',
        r.tbl, r.tbl || '_' || r.col || '_same_wedding', r.col, r.ref
      );
    end if;
  end loop;
end $$;

-- Couple photos for the dashboard carousel live in a private Storage bucket,
-- one folder per wedding: wedding-photos/<wedding_id>/<file>. Only members can
-- view, add or remove the files in their wedding's folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wedding-photos', 'wedding-photos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create or replace function is_wedding_member_folder(p_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return is_wedding_member(split_part(p_name, '/', 1)::uuid);
exception when invalid_text_representation then
  return false;
end
$$;

revoke execute on function is_wedding_member_folder(text) from public, anon;
grant execute on function is_wedding_member_folder(text) to authenticated;

drop policy if exists "wedding members read photos" on storage.objects;
create policy "wedding members read photos" on storage.objects
  for select to authenticated using (bucket_id = 'wedding-photos' and is_wedding_member_folder(name));

drop policy if exists "wedding members add photos" on storage.objects;
create policy "wedding members add photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'wedding-photos' and is_wedding_member_folder(name));

drop policy if exists "wedding members remove photos" on storage.objects;
create policy "wedding members remove photos" on storage.objects
  for delete to authenticated using (bucket_id = 'wedding-photos' and is_wedding_member_folder(name));
