-- Sesh-V2 Supabase Migration 0003: Live Sessions & Realtime
-- Run this AFTER 0002_storage.sql in the Supabase SQL Editor

-- =============================================================================
-- SESSIONS TABLE UPDATE (extends existing sessions table from 0001)
-- =============================================================================

-- The sessions table from 0001 already has:
-- id, spot_id, user_id, started_at, ended_at, hidden, created_at

-- We need to add columns for named members and member metadata
alter table sessions
  add column if not exists member_name text,
  add column if not exists member_stance text,
  add column if not exists member_level text;

-- Index for finding active sessions by spot
create index if not exists idx_sessions_spot_active
  on sessions (spot_id)
  where ended_at is null and not hidden;

-- Index for finding user's active session
create index if not exists idx_sessions_user_active
  on sessions (user_id)
  where ended_at is null and not hidden;

-- =============================================================================
-- REALTIME PUBLICATION
-- =============================================================================

-- Enable realtime for sessions table
alter publication supabase_realtime add table sessions;

-- =============================================================================
-- FUNCTION: cleanup_expired_sessions()
-- Sets ended_at = now() for sessions older than 4 hours with ended_at = null
-- =============================================================================

create or replace function cleanup_expired_sessions()
returns integer language plpgsql as $$
declare
  affected integer;
begin
  update sessions
  set ended_at = now()
  where ended_at is null
    and not hidden
    and started_at < now() - interval '4 hours';

  get diagnostics affected = row_count;
  return affected;
end $$;

-- Schedule cleanup every 5 minutes using pg_cron (if available)
-- If pg_cron is not available, this can be called from a serverless function or cron job
-- Example pg_cron setup:
-- select cron.schedule('cleanup-expired-sessions', '*/5 * * * *', 'select cleanup_expired_sessions();');

-- Alternative: Use a simple scheduled job via Supabase Edge Functions or external cron
-- The function can be called from a Netlify scheduled function or GitHub Actions

-- =============================================================================
-- VIEW: spot_live_counts (update to use 4-hour window)
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
  and sess.started_at >= now() - interval '4 hours'
where s.status = 'approved'
group by s.id;

grant select on spot_live_counts to anon, authenticated;

-- =============================================================================
-- FUNCTION: get_live_session_for_user(spot_id)
-- Returns the active session for a user at a spot (if any)
-- =============================================================================

create or replace function get_live_session_for_user(p_spot_id text, p_user_id uuid)
returns sessions language sql stable as $$
  select *
  from sessions
  where spot_id = p_spot_id
    and user_id = p_user_id
    and ended_at is null
    and not hidden
    and started_at >= now() - interval '4 hours'
  limit 1;
$$;

-- =============================================================================
-- RLS POLICIES UPDATE
-- =============================================================================

-- Update existing policies to include 4-hour window
drop policy if exists "Anyone can read live sessions for approved spots" on sessions;
create policy "Anyone can read live sessions for approved spots"
  on sessions for select
  using (
    ended_at is null
    and not hidden
    and started_at >= now() - interval '4 hours'
    and exists (select 1 from spots where spots.id = sessions.spot_id and spots.status = 'approved')
  );

-- Users can read own sessions (including hidden/ended)
drop policy if exists "Users can read own sessions (including hidden/ended)" on sessions;
create policy "Users can read own sessions (including hidden/ended)"
  on sessions for select
  using (auth.uid() = user_id);

-- Users can insert own sessions
drop policy if exists "Users can insert own sessions" on sessions;
create policy "Users can insert own sessions"
  on sessions for insert
  with check (auth.uid() = user_id);

-- Users can update own sessions (e.g., end them, update member info)
drop policy if exists "Users can update own sessions (e.g., end them)" on sessions;
create policy "Users can update own sessions (e.g., end them)"
  on sessions for update
  using (auth.uid() = user_id);

-- =============================================================================
-- NOTES
-- =============================================================================
-- 1. Realtime: Enable in Supabase Dashboard → Realtime → Enable for 'sessions' table
-- 2. Auto-expiry: Set up pg_cron or external cron to call cleanup_expired_sessions() every 5 minutes
-- 3. The cleanup_expired_sessions() function can also be called from a Netlify scheduled function
-- 4. One live session per user is enforced by application logic (check before insert)