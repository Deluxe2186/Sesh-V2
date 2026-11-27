## Summary

This PR establishes the Supabase backend foundation for Sesh-V2, replacing the localStorage-based auth and data layer with a proper PostgreSQL database, Row Level Security, and SSR-compatible auth.

## Changes

### Supabase Clients (SSR-compatible)
- `src/lib/supabase/client.ts` — Browser client using `@supabase/ssr`
- `src/lib/supabase/server.ts` — Server Component client using Next.js 13.5 `cookies()` API
- `src/lib/supabase/middleware.ts` — Middleware client helper for session refresh

### Middleware & Auth
- `src/middleware.ts` — Refreshes auth session on every request, protects routes:
  - Protected: `/profile`, `/settings`, `/add-spot`, `/spot/*` → redirect to `/login`
  - Auth pages: `/login`, `/signup` → redirect to `/explore` if authenticated
- `src/components/AuthProvider.tsx` — Updated to use Supabase auth:
  - `signUp` now auto-signs-in after registration (fixes email confirmation redirect issue)
  - `logIn` / `logOut` / session persistence via `onAuthStateChange`

### Database Schema (`supabase/migrations/0001_init.sql`)
Tables mapped to `src/types/index.ts`:
- `profiles` — Maps to `auth.users`, includes `handle`, `stance`, `level`, `preferred_obstacles`, `share_location`
- `spots` — Full spot data with `status` enum (`pending_review`/`approved`/`rejected`), `verified`, `approximate_location`
- `spot_media` — Images/videos with storage paths
- `security_reports` — User reports on spots
- `sessions` — Live skate sessions with `ended_at` null for active sessions

**Views & Functions:**
- `spot_live_counts` — Live session count per spot
- `spot_stats(spot_id)` — Returns `weeklyVisits`, `lastActive`, `busyByTime`, `busyByDay` computed from sessions

### Row Level Security
- Anyone reads `approved` spots, live counts, stats
- Users read/write own profile
- Users insert spots as `pending_review` only (cannot set `verified` or `status='approved'`)
- Users insert/update/delete own sessions, reports, media
- Client can never set `spots.status` or `verified`

### Seed Data
- `supabase/seed.sql` — 8 Lagos spots with security reports (status `approved`, verified as in original seed)

### Documentation
- `README.md` — Supabase setup instructions, migration/seed commands, project structure

## Testing
- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run build` ✅

## Notes
- All existing function signatures, context APIs, and types in `src/types/index.ts` preserved
- Offline cache, low-data mode, mobile responsiveness unchanged
- No service role key used; all access via publishable key + RLS
- Never commits secrets

🤖 Generated with [Claude Code](https://claude.com/claude-code)