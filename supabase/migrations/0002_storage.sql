-- Sesh-V2 Supabase Migration 0002: Storage bucket for spot media
-- Run this AFTER 0001_init.sql in the Supabase SQL Editor

-- =============================================================================
-- STORAGE BUCKET: spot-media
-- =============================================================================

-- Create the storage bucket for spot media uploads
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'spot-media',
  'spot-media',
  true, -- public bucket (files readable via public URL)
  31457280, -- 30 MB max file size (covers both images 5MB and videos 30MB)
  array['image/*', 'video/*'] -- only images and videos
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- =============================================================================
-- STORAGE POLICIES FOR spot-media
-- =============================================================================

-- Policy 1: Anyone can read files in the bucket (public bucket)
-- This allows public access to approved spot media
create policy "Public read access for spot media"
  on storage.objects for select
  using (bucket_id = 'spot-media');

-- Policy 2: Authenticated users can upload to their own folder
-- Folder structure: {user_id}/{filename}
-- Users can only upload to a folder named after their user ID
create policy "Users can upload to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'spot-media'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 3: Users can update their own files
create policy "Users can update own files"
  on storage.objects for update
  using (
    bucket_id = 'spot-media'
    and auth.uid() = owner
  )
  with check (
    bucket_id = 'spot-media'
    and auth.uid() = owner
  );

-- Policy 4: Users can delete their own files
create policy "Users can delete own files"
  on storage.objects for delete
  using (
    bucket_id = 'spot-media'
    and auth.uid() = owner
  );

-- Policy 5: Service role can do anything (for admin operations)
create policy "Service role full access"
  on storage.objects for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- =============================================================================
-- ADDITIONAL SPOTS TABLE UPDATES
-- =============================================================================

-- Add submission_status to spots if not already present (already in 0001)
-- The spots table already has status enum with 'pending_review', 'approved', 'rejected'

-- Create a view to get user submissions with media
create or replace view user_spot_submissions as
select
  s.id,
  s.name,
  s.area,
  s.lat,
  s.lng,
  s.obstacles,
  s.surface,
  s.best_time,
  s.notes,
  s.how_to_find,
  s.shelter,
  s.security_level,
  s.security_note,
  s.tips,
  s.verified,
  s.approximate_location,
  s.status,
  s.created_by,
  s.created_at,
  s.updated_at,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', sm.id,
        'kind', sm.kind,
        'path', sm.path,
        'size_bytes', sm.size_bytes,
        'duration_s', sm.duration_s,
        'public_url', 'https://' || current_setting('app.external_url', true) || '/storage/v1/object/public/' || sm.bucket_id || '/' || sm.name
      )
    ) filter (where sm.id is not null),
    '[]'::jsonb
  ) as media
from spots s
left join spot_media sm on sm.spot_id = s.id
group by s.id;

grant select on user_spot_submissions to authenticated;

-- =============================================================================
-- NOTES FOR APPROVING SPOTS
-- =============================================================================
-- To approve a spot submission:
-- 1. Go to Supabase Dashboard → Table Editor → spots
-- 2. Find the spot with status = 'pending_review'
-- 3. Edit the row and change status to 'approved' (or 'rejected')
-- 4. The spot will immediately become visible to all users on /explore, /heatmap, /spot/[id]
--
-- The spot_media rows are already linked via spot_id. Since the bucket is public,
-- approved spot media will be accessible via public URLs.