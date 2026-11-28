-- Sesh-V2 Supabase Migration 0004: Validation Constraints & Security Hardening
-- Run this AFTER 0003_live_sessions.sql in the Supabase SQL Editor

-- =============================================================================
-- SPOTS TABLE: ADD VALIDATION CONSTRAINTS
-- =============================================================================

-- Add CHECK constraints for length limits and validations
alter table spots
  add constraint spots_name_length check (char_length(name) between 1 and 100),
  add constraint spots_area_length check (char_length(area) between 1 and 100),
  add constraint spots_notes_length check (char_length(notes) <= 2000),
  add constraint spots_how_to_find_length check (char_length(how_to_find) <= 1000),
  add constraint spots_security_note_length check (char_length(security_note) <= 1000),
  add constraint spots_best_time_length check (char_length(best_time) <= 200),
  add constraint spots_lat_range check (lat between -90 and 90),
  add constraint spots_lng_range check (lng between -180 and 180),
  add constraint spots_obstacles_not_empty check (array_length(obstacles, 1) > 0),
  add constraint spots_tips_length check (array_length(tips, 1) is null or array_length(tips, 1) <= 10);

-- Add unique constraint on handle in profiles
alter table profiles
  add constraint profiles_handle_format check (handle ~ '^[a-z0-9_]{3,30}$');

-- Add constraint to prevent clients from setting verified=true or status='approved'
-- This is already enforced by RLS, but adding as a safety net
create or replace function prevent_client_approval()
returns trigger language plpgsql as $$
begin
  -- Prevent setting verified=true on insert/update
  if new.verified and not old.verified then
    raise exception 'Client cannot set verified=true';
  end if;

  -- Prevent setting status='approved' on insert/update
  if new.status = 'approved' and old.status != 'approved' then
    raise exception 'Client cannot set status=approved';
  end if;

  -- Prevent setting status='rejected' on insert/update
  if new.status = 'rejected' and old.status != 'rejected' then
    raise exception 'Client cannot set status=rejected';
  end if;

  return new;
end $$;

drop trigger if exists prevent_client_approval on spots;
create trigger prevent_client_approval
  before insert or update on spots
  for each row execute function prevent_client_approval();

-- =============================================================================
-- SECURITY_REPORTS: ADD VALIDATION
-- =============================================================================

-- Rate limit is enforced at application level (1 per user per spot per hour)
-- Add a unique partial index as a database-level safeguard
create unique index if not exists security_reports_rate_limit
  on security_reports (user_id, spot_id, date_trunc('hour', created_at))
  where created_at > now() - interval '1 hour';

-- =============================================================================
-- SESSIONS: ADD VALIDATION
-- =============================================================================

-- Ensure one active session per user per spot
create unique index if not exists sessions_one_active_per_user_spot
  on sessions (user_id, spot_id)
  where ended_at is null and not hidden;

-- =============================================================================
-- SPOT_MEDIA: ADD VALIDATION
-- =============================================================================

alter table spot_media
  add constraint spot_media_size_limit check (size_bytes <= 31457280), -- 30MB
  add constraint spot_media_kind_valid check (kind in ('image', 'video')),
  add constraint spot_media_duration_check check (
    (kind = 'video' and duration_s is not null and duration_s > 0 and duration_s <= 3600) or
    (kind = 'image' and duration_s is null)
  );

-- =============================================================================
-- SUBMISSIONS TRACKING (optional: track spot submissions in a dedicated table)
-- =============================================================================

-- Create a table to track spot submissions with status history
create table if not exists spot_submissions (
  id uuid primary key default uuid_generate_v4(),
  spot_id text not null references spots(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  status spot_status not null default 'pending_review',
  submitted_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references profiles(id),
  rejection_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table spot_submissions enable row level security;

create policy "Users can read own submissions"
  on spot_submissions for select
  using (auth.uid() = user_id);

create policy "Users can insert own submissions"
  on spot_submissions for insert
  with check (auth.uid() = user_id);

create policy "Admins can read all submissions"
  on spot_submissions for select
  using (auth.jwt() ->> 'role' = 'admin');

-- =============================================================================
-- UPDATE TIMESTAMP TRIGGERS
-- =============================================================================

create trigger set_spot_submissions_updated_at
  before update on spot_submissions
  for each row execute function public.set_updated_at();

-- =============================================================================
-- RLS POLICY AUDIT QUERIES (for manual testing)
-- =============================================================================

-- Test queries to verify RLS policies work correctly:
-- Run these as different users to verify policies:

/*
-- Test 1: Anonymous user can only read approved spots
SET ROLE anon;
SELECT * FROM spots; -- Should only return approved spots

-- Test 2: Authenticated user can read own pending spots
SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "user-uuid-here"}';
SELECT * FROM spots WHERE created_by = auth.uid(); -- Should return all own spots

-- Test 3: User cannot insert approved spot
INSERT INTO spots (id, name, area, lat, lng, obstacles, created_by, status)
VALUES ('test-spot', 'Test', 'Area', 0, 0, '{}', auth.uid(), 'approved');
-- Should fail: Client cannot set status=approved

-- Test 4: User cannot set verified=true
INSERT INTO spots (id, name, area, lat, lng, obstacles, created_by, verified)
VALUES ('test-spot-2', 'Test', 'Area', 0, 0, '{}', auth.uid(), true);
-- Should fail: Client cannot set verified=true

-- Test 5: User cannot read other users' pending spots
SELECT * FROM spots WHERE created_by != auth.uid() AND status = 'pending_review';
-- Should return 0 rows

-- Test 6: User cannot update other users' sessions
UPDATE sessions SET ended_at = now() WHERE user_id != auth.uid();
-- Should affect 0 rows

-- Test 7: User cannot insert security report for another user
INSERT INTO security_reports (spot_id, user_id, type)
VALUES ('some-spot', 'other-user-uuid', 'All clear');
-- Should fail: user_id must be auth.uid()

-- Test 8: User cannot upload to another user's folder in storage
-- This is enforced by storage policy: folder must match auth.uid()

-- Test 9: Self-approve spot (should fail)
UPDATE spots SET status = 'approved' WHERE id = 'my-pending-spot';
-- Should fail: Client cannot set status=approved

-- Test 10: Rate limit on security reports
-- Insert 2 reports for same spot within 1 hour
-- Second insert should fail due to unique index
*/