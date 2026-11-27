-- Sesh-V2 Supabase Migration 0001: Initial Schema
-- Run this in the Supabase SQL Editor

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================================================
-- PROFILES (maps to auth.users)
-- =============================================================================
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  handle text not null unique,
  stance text check (stance in ('Goofy', 'Regular')),
  level text check (level in ('Beginner', 'Intermediate', 'Advanced')),
  preferred_obstacles text[] default '{}',
  share_location boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, handle, share_location)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    lower(new.raw_user_meta_data->>'handle'),
    coalesce(new.raw_user_meta_data->>'share_location', 'false')::boolean
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS for profiles
alter table profiles enable row level security;

create policy "Anyone can read profiles"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- =============================================================================
-- SPOTS
-- =============================================================================
create type spot_status as enum ('pending_review', 'approved', 'rejected');
create type surface_type as enum ('Smooth', 'Average', 'Rough');
create type shelter_type as enum ('Open', 'Partly covered', 'Covered');
create type security_level_type as enum ('Low', 'Medium', 'High');

create table spots (
  id text primary key, -- using slug-style IDs like 'waf-skatepark'
  name text not null,
  area text not null,
  lat double precision not null,
  lng double precision not null,
  obstacles text[] not null default '{}',
  surface surface_type not null default 'Average',
  best_time text not null default '',
  notes text not null default '',
  how_to_find text not null default '',
  shelter shelter_type not null default 'Open',
  security_level security_level_type not null default 'Medium',
  security_note text not null default '',
  tips text[] not null default '{}',
  verified boolean default false,
  approximate_location boolean default false,
  status spot_status not null default 'pending_review',
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for spots
alter table spots enable row level security;

-- Anyone can read approved spots
create policy "Anyone can read approved spots"
  on spots for select
  using (status = 'approved');

-- Users can read their own spots (any status)
create policy "Users can read own spots"
  on spots for select
  using (auth.uid() = created_by);

-- Users can insert spots as pending_review
create policy "Users can insert spots"
  on spots for insert
  with check (
    auth.uid() = created_by
    and status = 'pending_review'
    and not verified -- client cannot set verified
  );

-- Users can update their own pending spots
create policy "Users can update own pending spots"
  on spots for update
  using (auth.uid() = created_by and status = 'pending_review')
  with check (
    auth.uid() = created_by
    and status = 'pending_review'
    and not verified -- client cannot set verified
  );

-- =============================================================================
-- SPOT MEDIA
-- =============================================================================
create table spot_media (
  id uuid primary key default uuid_generate_v4(),
  spot_id text not null references spots(id) on delete cascade,
  kind text not null check (kind in ('image', 'video')),
  path text not null, -- storage path
  size_bytes bigint not null,
  duration_s integer, -- for video
  created_at timestamptz default now()
);

alter table spot_media enable row level security;

create policy "Anyone can read media for approved spots"
  on spot_media for select
  using (
    exists (select 1 from spots where spots.id = spot_media.spot_id and spots.status = 'approved')
  );

create policy "Users can insert media for own spots"
  on spot_media for insert
  with check (
    exists (select 1 from spots where spots.id = spot_media.spot_id and spots.created_by = auth.uid())
  );

create policy "Users can delete own spot media"
  on spot_media for delete
  using (
    exists (select 1 from spots where spots.id = spot_media.spot_id and spots.created_by = auth.uid())
  );

-- =============================================================================
-- SECURITY REPORTS
-- =============================================================================
create type security_report_type as enum ('Security came by', 'Asked to leave', 'All clear');

create table security_reports (
  id uuid primary key default uuid_generate_v4(),
  spot_id text not null references spots(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  type security_report_type not null,
  created_at timestamptz default now()
);

alter table security_reports enable row level security;

create policy "Anyone can read security reports for approved spots"
  on security_reports for select
  using (
    exists (select 1 from spots where spots.id = security_reports.spot_id and spots.status = 'approved')
  );

create policy "Users can insert own reports"
  on security_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reports"
  on security_reports for update
  using (auth.uid() = user_id);

create policy "Users can delete own reports"
  on security_reports for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- SESSIONS (live skate sessions)
-- =============================================================================
create table sessions (
  id uuid primary key default uuid_generate_v4(),
  spot_id text not null references spots(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz, -- null while live
  hidden boolean default false, -- ghost mode
  created_at timestamptz default now()
);

alter table sessions enable row level security;

create policy "Anyone can read live sessions for approved spots"
  on sessions for select
  using (
    ended_at is null
    and not hidden
    and exists (select 1 from spots where spots.id = sessions.spot_id and spots.status = 'approved')
  );

create policy "Users can read own sessions (including hidden/ended)"
  on sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions (e.g., end them)"
  on sessions for update
  using (auth.uid() = user_id);

-- =============================================================================
-- VIEW: spot_live_counts (live session counts per spot)
-- =============================================================================
create or replace view spot_live_counts as
select
  s.id as spot_id,
  count(sess.id) as live_count
from spots s
left join sessions sess
  on sess.spot_id = s.id
  and sess.ended_at is null
  and not sess.hidden
where s.status = 'approved'
group by s.id;

-- =============================================================================
-- FUNCTION: spot_stats(spot_id) -> computed stats
-- =============================================================================
create or replace function spot_stats(p_spot_id text)
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'weeklyVisits', coalesce(weekly.visits, 0),
    'lastActive', last.activity,
    'busyByTime', coalesce(bt.times, '{"morning":0,"afternoon":0,"evening":0,"night":0}'::jsonb),
    'busyByDay', coalesce(bd.days, '[0,0,0,0,0,0,0]'::jsonb)
  )
  from (
    select count(*)::int as visits
    from sessions
    where spot_id = p_spot_id
      and started_at >= now() - interval '7 days'
  ) weekly
  cross join lateral (
    select max(ended_at) as activity
    from sessions
    where spot_id = p_spot_id
  ) last
  cross join lateral (
    select jsonb_build_object(
      'morning', count(*) filter (where extract(hour from started_at at time zone 'Africa/Lagos') between 6 and 11)::int,
      'afternoon', count(*) filter (where extract(hour from started_at at time zone 'Africa/Lagos') between 12 and 16)::int,
      'evening', count(*) filter (where extract(hour from started_at at time zone 'Africa/Lagos') between 17 and 21)::int,
      'night', count(*) filter (where extract(hour from started_at at time zone 'Africa/Lagos') >= 22 or extract(hour from started_at at time zone 'Africa/Lagos') <= 5)::int
    ) as times
    from sessions
    where spot_id = p_spot_id
      and started_at >= now() - interval '90 days'
  ) bt
  cross join lateral (
    select jsonb_agg(day_visits order by dow) as days
    from (
      select count(*)::int as day_visits, extract(dow from started_at at time zone 'Africa/Lagos')::int as dow
      from sessions
      where spot_id = p_spot_id
        and started_at >= now() - interval '90 days'
      group by dow
    ) d
  ) bd;
$$;

-- Grant execute to authenticated users
grant execute on function spot_stats(text) to authenticated;

-- =============================================================================
-- UPDATED_AT TRIGGERS
-- =============================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger set_profiles_updated_at
  before update on profiles
  for each row execute function public.set_updated_at();

create trigger set_spots_updated_at
  before update on spots
  for each row execute function public.set_updated_at();

-- =============================================================================
-- INDEXES
-- =============================================================================
create index if not exists idx_spots_status on spots(status);
create index if not exists idx_spots_created_by on spots(created_by);
create index if not exists idx_spots_area on spots(area);
create index if not exists idx_sessions_spot_id on sessions(spot_id);
create index if not exists idx_sessions_user_id on sessions(user_id);
create index if not exists idx_sessions_ended_at on sessions(ended_at);
create index if not exists idx_security_reports_spot_id on security_reports(spot_id);
create index if not exists idx_spot_media_spot_id on spot_media(spot_id);