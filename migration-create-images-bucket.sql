-- This script is idempotent (safe to run multiple times).

-- 1. Create a public bucket named "images" if it doesn't exist.
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Clean up old policies before creating new ones to ensure a clean state.
DROP POLICY IF EXISTS "Public read access for images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated insert for images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update for own images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete for own images" ON storage.objects;

-- 3. Create Row Level Security (RLS) policies for the "images" bucket.

-- Policy: Allow public read access.
CREATE POLICY "Public read access for images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Policy: Allow authenticated users to upload.
CREATE POLICY "Authenticated insert for images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Policy: Allow users to update their own images.
CREATE POLICY "Authenticated update for own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'images' AND auth.uid() = owner);

-- Policy: Allow users to delete their own images.
CREATE POLICY "Authenticated delete for own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND auth.uid() = owner);
