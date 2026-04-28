-- Migration: Setup storage bucket and policies for business photo uploads
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Create the business-photos bucket (idempotent — safe to re-run)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'business-photos',
  'business-photos',
  true,
  false,
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Enable RLS on storage.objects (if not already)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow anyone to SELECT (read) public photos
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'business-photos');

-- 4. Policy: Allow authenticated users to INSERT (upload) their own photos
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Policy: Allow authenticated users to DELETE their own photos
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'business-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
