-- Drop the title column from banners (no longer used)
ALTER TABLE public.banners DROP COLUMN IF EXISTS title;
