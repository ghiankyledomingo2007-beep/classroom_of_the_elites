-- Add link_url column to merit_claims table so students can share files, images, or assets
ALTER TABLE public.merit_claims
ADD COLUMN IF NOT EXISTS link_url TEXT;
