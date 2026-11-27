# Sesh-V2

Live skate spots in Lagos. Find where the session is happening right now.

## Tech Stack

- Next.js 13.5.1 (App Router)
- React 18
- Tailwind CSS + shadcn/ui
- React Leaflet (maps)
- Supabase (auth + database)
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

### 2. Run Migrations

1. Open the Supabase Dashboard → SQL Editor
2. Run `supabase/migrations/0001_init.sql` — creates tables, RLS, views, and functions
3. Run `supabase/seed.sql` — inserts the 8 Lagos spots with security reports

### 3. Create Auth Users (for seeded data ownership)

The seed SQL uses `created_by = null` for spots. To associate spots with real users:

1. In Supabase Dashboard → Authentication → Users, create users with emails
2. Copy each user's UUID
3. Update `supabase/seed.sql` replacing `null` in `created_by` with the UUIDs
4. Re-run the seed SQL (it uses `on conflict do update`)

### 4. Storage Buckets

Create a storage bucket for spot media:

```sql
-- Run in SQL Editor
insert into storage.buckets (id, name, public) values ('spot-media', 'spot-media', true);
```

Then add RLS policies:

```sql
create policy "Public read" on storage.objects for select using (bucket_id = 'spot-media');
create policy "Auth users upload" on storage.objects for insert with check (bucket_id = 'spot-media' and auth.role() = 'authenticated');
```

### 5. Local Development

```bash
npm install
npm run dev
```

The app uses `@supabase/ssr` with Next.js 13.5 cookie API.
Middleware at `src/middleware.ts` refreshes auth sessions and protects routes.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Authenticated app routes
│   └── (marketing)/       # Public marketing routes
├── components/            # React components
├── lib/
│   ├── api.ts             # Data fetching (to be replaced with Supabase)
│   ├── auth.ts            # Auth types + localStorage fallback
│   ├── sessions.tsx       # Live sessions context
│   └── supabase/          # Supabase clients
│       ├── client.ts      # Browser client
│       ├── server.ts      # Server Component client
│       └── middleware.ts  # Middleware client helper
├── data/seed.ts           # Static seed data (to be replaced)
└── types/index.ts         # Shared TypeScript types
supabase/
├── migrations/            # SQL migrations
└── seed.sql               # Seed data
```

## Available Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run typecheck` — TypeScript check
- `npm run lint` — ESLint

## Architecture Notes

- **Offline-first**: LocalStorage caches spots, sessions, and drafts
- **Low-data mode**: Toggle in settings reduces map tile requests
- **Mobile responsive**: 5/8 map + 3/8 list split on mobile Explore
- **No service role key**: All DB access uses RLS + publishable key

## Deployment (Netlify)

1. Connect repo to Netlify
2. Add env vars in Netlify dashboard
3. Build command: `npm run build`
4. Output directory: `.next` (handled by @netlify/plugin-nextjs)

---

Generated with [Claude Code](https://claude.com/claude-code)