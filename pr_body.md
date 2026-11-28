## Summary

This PR replaces the localStorage-based live sessions in `src/lib/sessions.tsx` with Supabase-backed sessions using Realtime, keeping the exact same `useSessions()` API so `AutoJoinMount`, `MobileSessionBar`, `DevTools`, and all existing UI continue working.

## Changes

### Migration 0003 (`supabase/migrations/0003_live_sessions.sql`)
- **Schema updates**: Add `member_name`, `member_stance`, `member_level` to `sessions` table
- **Realtime**: Enable realtime publication for `sessions` table
- **Auto-expiry**: `cleanup_expired_sessions()` function sets `ended_at = now()` for sessions older than 4 hours
- **View update**: `spot_live_counts` now uses 4-hour window
- **RLS**: Updated policies with 4-hour window filter
- **Schedule**: Document pg_cron setup for running cleanup every 5 minutes

### `src/lib/sessions.tsx` — Rewritten with Supabase + Realtime
**Core behavior (API unchanged):**
- `startSession(spotId, member)` → Inserts session row with member metadata
- `joinSession(spotId, member)` → Updates existing session or creates new
- `leaveSession(spotId, 'self')` → Sets `ended_at = now()`
- `getSessionForSpot(spotId)` → Returns `LiveSession` with members
- `getLiveCount(spotId)` → Returns member count
- `addMockMember` / `removeMockMember` → Dev-only (when `NEXT_PUBLIC_DEV_TOOLS=true`)

**Supabase-specific features:**
- **Realtime**: Subscribes to `postgres_changes` on `sessions` table; live counts and members update instantly for all clients
- **Anonymous members**: Other users shown as unnamed `{ id: uuid, named: false }` ("A skater")
- **Named members**: Only `self` shows name/stance/level if `share_location` on and ghost mode off
- **One session per user**: App logic checks for existing active session before insert
- **Ghost mode**: Auto-leaves all sessions when enabled (via `AutoJoinMount`)
- **Auto-expire**: `cleanup_expired_sessions()` should run every 5 min via pg_cron
- **Cleanup**: Unsubscribes Realtime channel on unmount

### Updated Components
- `AutoJoinMount` — Works with new API (ghost mode handling, `useAutoJoin`)
- `MobileSessionBar` — Join/Leave/Start session work with Supabase
- `DevTools` — Dev-only mock member buttons (guarded by `NEXT_PUBLIC_DEV_TOOLS`)

### Types Preserved
- `LiveSession`, `SessionMember`, `SELF_ID` — unchanged

## Testing
- `npm run typecheck` ✅
- `npm run lint` ✅ (2 exhaustive-deps warnings in sessions.tsx)
- `npm run build` ✅

## Supabase Setup Required
1. Run `supabase/migrations/0003_live_sessions.sql` in SQL Editor
2. **Enable Realtime**: Dashboard → Realtime → Enable for `sessions` table
3. **Schedule cleanup** (choose one):
   - pg_cron: `select cron.schedule('cleanup-expired-sessions', '*/5 * * * *', 'select cleanup_expired_sessions();');`
   - Netlify scheduled function calling the SQL function
   - GitHub Actions cron

## Notes
- Guests cannot start/join — AuthProvider redirects to signup dialog (from backend-auth)
- Never stores exact user location, only `spot_id`
- DevTools stays dev-only (`NEXT_PUBLIC_DEV_TOOLS=true`)

🤖 Generated with [Claude Code](https://claude.com/claude-code)