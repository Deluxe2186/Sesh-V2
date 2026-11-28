# Sesh-V2

Live skate spots in Lagos. Find where the session is happening right now.

## Tech Stack

- Next.js 13.5.1 (App Router)
- React 18
- Tailwind CSS + shadcn/ui
- React Leaflet (maps)
- Supabase (auth + database + realtime + storage)
- Deployed on Netlify

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and publishable (anon) key
3. Copy them to `.env.local`:

```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

Required env vars:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### 2. Run Migrations (in order)

Open the Supabase Dashboard → SQL Editor and run each migration:

1. **`supabase/migrations/0001_init.sql`** — Core tables, RLS, views, functions
   - Tables: `profiles`, `spots`, `spot_media`, `security_reports`, `sessions`
   - View: `spot_live_counts`
   - Function: `spot_stats(spot_id)` returns weeklyVisits, lastActive, busyByTime, busyByDay
   - RLS policies for all tables

2. **`supabase/migrations/0002_storage.sql`** — Storage bucket `spot-media` with RLS
   - Public read access
   - Users upload only to their own folder (`{user_id}/`)
   - 30MB limit, `image/*` and `video/*` only

3. **`supabase/migrations/0003_live_sessions.sql`** — Live sessions + Realtime
   - Member metadata columns on `sessions`
   - Realtime publication for `sessions` table
   - `cleanup_expired_sessions()` function (4-hour auto-expiry)
   - Updated `spot_live_counts` with 4-hour window

4. **`supabase/migrations/0004_validation_constraints.sql`** — Validation & security
   - CHECK constraints on `spots`, `profiles`, `spot_media`, `security_reports`
   - Unique indexes for rate limiting (security reports, active sessions)
   - Trigger to prevent client-side spot approval
   - `spot_submissions` table for tracking

5. **`supabase/seed.sql`** — 8 Lagos spots with security reports

### 3. Create Auth Users (for seeded data ownership)

The seed SQL uses `created_by = null` for spots. To associate spots with real users:

1. In Supabase Dashboard → Authentication → Users, create users with emails
2. Copy each user's UUID
3. Update `supabase/seed.sql` replacing `null` in `created_by` with the UUIDs
4. Re-run the seed SQL (it uses `on conflict do update`)

### 4. Enable Realtime

In Supabase Dashboard → Realtime → Enable for `sessions` table

### 5. Schedule Auto-Expiry Cleanup

Run `cleanup_expired_sessions()` every 5 minutes. Options:

- **pg_cron** (if available):
  ```sql
  select cron.schedule('cleanup-expired-sessions', '*/5 * * * *', 'select cleanup_expired_sessions();');
  ```

- **Netlify Scheduled Function** (create `netlify/functions/cleanup-sessions.ts`):
  ```typescript
  import { createClient } from '@supabase/supabase-js';
  export default async () => {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    await supabase.rpc('cleanup_expired_sessions');
  };
  ```

- **GitHub Actions** (`.github/workflows/cleanup.yml`):
  ```yaml
  on:
    schedule:
      - cron: '*/5 * * * *'
  jobs:
    cleanup:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - run: npx supabase db sql --query "select cleanup_expired_sessions();"
  ```

### 6. Local Development

```bash
npm install
npm run dev
```

The app uses `@supabase/ssr` with Next.js 13.5 cookie API.
Middleware at `src/middleware.ts` refreshes auth sessions and protects routes.

## Environment Variables

### Required (`.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | `eyJhbGciOiJIUzI1NiIs...` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_DEV_TOOLS` | Enable DevTools (mock member buttons) | `false` |

### Netlify Environment Variables

In Netlify Dashboard → Site Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = your-anon-key
# For scheduled cleanup function (if using Netlify Functions):
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
```

**Never commit secrets** — the app only uses the publishable (anon) key client-side. The service role key is only needed for server-side scheduled functions.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Authenticated app routes
│   └── (marketing)/       # Public marketing routes
├── components/            # React components
├── lib/
│   ├── api.client.ts      # Client-side Supabase queries + offline cache
│   ├── api.server.ts      # Server Component Supabase queries
│   ├── api.ts             # Barrel file (re-exports client)
│   ├── auth.ts            # Auth types + Supabase auth functions
│   ├── sessions.tsx       # Live sessions context + Realtime
│   ├── settings.tsx       # User settings context
│   ├── offlineCache.ts    # Offline cache (5min TTL, fallback)
│   ├── supabase/          # Supabase client factories
│   │   ├── client.ts      # Browser client
│   │   ├── server.ts      # Server Component client
│   │   └── middleware.ts  # Middleware client helper
├── data/seed.ts           # Static seed data (reference only)
└── types/index.ts         # Shared TypeScript types
supabase/
├── migrations/            # SQL migrations (run in order)
│   ├── 0001_init.sql
│   ├── 0002_storage.sql
│   ├── 0003_live_sessions.sql
│   └── 0004_validation_constraints.sql
└── seed.sql               # Seed data (8 Lagos spots)
```

## Available Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run typecheck` — TypeScript check
- `npm run lint` — ESLint

## Architecture Notes

- **Offline-first**: LocalStorage caches spots (5min TTL), sessions, drafts
- **Low-data mode**: Toggle in settings reduces map tile requests
- **Mobile responsive**: 5/8 map + 3/8 list split on mobile Explore
- **No service role key client-side**: All DB access uses RLS + publishable key
- **Realtime**: Live session counts update instantly via Supabase Realtime

## Deployment (Netlify)

1. Connect repo to Netlify
2. Add env vars in Netlify Dashboard → Site Settings → Environment Variables
3. Build command: `npm run build`
4. Output directory: `.next` (handled by `@netlify/plugin-nextjs`)
5. For scheduled cleanup: add Netlify Function with `SUPABASE_SERVICE_ROLE_KEY`

---

Generated with [Claude Code](https://claude.com/claude-code)