## Summary

This PR replaces the seed-backed data layer in `src/lib/api.ts` with Supabase queries, while keeping all existing function signatures and TypeScript types (`Spot`, `Skater`, `User`, `RecentSessionRow`, `SecurityReport`) so the UI continues working unchanged.

## Changes

### New Files
- **`src/lib/api.client.ts`** — Client-side Supabase queries with `'use client'`, browser client, offline cache
- **`src/lib/api.server.ts`** — Server-side Supabase queries for Server Components (uses `cookies()`)
- **`src/lib/offlineCache.ts`** — Offline cache utilities: `cacheSpots`, `getCachedSpots`, `getCachedSpotsCount`, `clearOfflineCache`, `subscribeToOnlineStatus`
- **`src/lib/api.ts`** — Barrel file re-exporting client API only

### Updated Files
- **`src/lib/api.client.ts`** — All data fetching functions using Supabase:
  - `getSpots()` — Approved spots + current user's pending spots, with live counts & stats from `spot_live_counts` view and `spot_stats()` function
  - `getSpot(id)` — Single spot with full computed stats
  - `getSkaters()` — From `profiles` table
  - `getCurrentUser()` — From `profiles` with auth metadata fallback
  - `getRecentSessions(spotId)` — Real ended sessions from `sessions` table
  - `reportSecurity(spotId, type)` — Inserts to `security_reports`, rate-limited (1/user/spot/hour)
  - `getStoredReports(spotId)` — Kept for backward compatibility
  - Spot submissions (`saveDraft`, `submitSpot`, `getUserSubmissions`, `getDraft`, `deleteDraft`) — Remain localStorage-based for offline support
- **`src/lib/api.server.ts`** — Server-only versions: `getSpotsServer`, `getSpotServer`
- **`src/lib/offlineCache.ts`** — Cache last successful spots response (5min TTL), fallback on error/offline, `clearOfflineCache` clears all localStorage keys

### Import Updates
- Server Components (`/explore/page.tsx`, `/spot/[id]/page.tsx`) → import from `@/lib/api.server`
- Client Components (`/heatmap/page.tsx`, `/profile/page.tsx`, `SecurityCard`, `RecentSessions`, `AddSpotWizard`, `MySubmissions`) → import from `@/lib/api.client`

### Removed
- `src/data/seed.ts` no longer imported by app code (kept for reference/seeding)

## Testing
- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run build` ✅

## Supabase Requirements
- Run `supabase/migrations/0001_init.sql` (creates tables, RLS, `spot_live_counts` view, `spot_stats()` function)
- Run `supabase/seed.sql` (8 Lagos spots, status=approved)
- Ensure `spot_live_counts` view and `spot_stats(text)` function exist

## Notes
- All existing function signatures, context APIs, and types in `src/types/index.ts` preserved
- Offline cache: last successful response cached for 5min, auto-fallback on network error
- Low-data mode, mobile responsiveness unchanged
- No service role key used; all access via publishable key + RLS

🤖 Generated with [Claude Code](https://claude.com/claude-code)