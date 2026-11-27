## Summary

This PR implements real spot submission with Supabase Storage uploads, replacing the localStorage-only `submitSpot()`.

## Changes

### Migration 0002: Storage Bucket & Policies
- **`supabase/migrations/0002_storage.sql`** — Creates `spot-media` bucket with RLS:
  - Public read access for approved spots
  - Users upload only to their own folder (`{user_id}/`)
  - 30 MB file size limit, `image/*` and `video/*` only
  - Users can update/delete their own files

### `submitSpot()` Implementation (`src/lib/api.client.ts`)
Real submission flow:
1. **Upload media** — Compressed files uploaded to `spot-media` bucket with `onProgress` callback
2. **Insert spot_media** — Rows with `kind`, `path`, `size_bytes`, `duration_s`
3. **Insert spot** — As `'pending_review'` with all spot data
4. **Atomic cleanup** — On any failure, uploaded files and partial spot are deleted
5. **Draft preservation** — Draft kept until fully succeeded; only removed on success

**Options:**
```typescript
submitSpot(submission, {
  onProgress: (progress[]) => { /* update UI */ },
  onError: (message, failedFile?) => { /* show retry */ }
})
```

### `getUserSubmissions()` — Merged Sources
Merges three sources, deduplicated by ID:
1. **Server submissions** — `pending_review`, `approved`, `rejected` from `spots` + `spot_media`
2. **Local submissions** — Previously submitted via `submitSpot()`
3. **Local drafts** — `saveDraft()` / `ready_to_send`

New function: `fetchUserSubmissionsFromServer()` — Returns full SpotSubmission objects with public media URLs.

### Add Spot Wizard Integration
The existing `AddSpotWizard` already calls `submitSpot()` — just needs to pass `onProgress` and `onError` callbacks to show upload progress and retry on failure.

## Testing
- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run build` ✅

## Supabase Setup Required
1. Run `supabase/migrations/0002_storage.sql` in SQL Editor
2. This creates the `spot-media` bucket with policies

## Approving Spots (Manual Process)
To approve a spot submission:
1. Go to **Supabase Dashboard → Table Editor → spots**
2. Filter by `status = 'pending_review'`
3. Edit the row → change `status` to `'approved'` (or `'rejected'`)
4. The spot immediately appears on `/explore`, `/heatmap`, `/spot/[id]`

🤖 Generated with [Claude Code](https://claude.com/claude-code)