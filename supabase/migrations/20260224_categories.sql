-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Create categories table and associate products via FK
-- Run this in the Supabase SQL Editor (Database → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create the categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text        NOT NULL UNIQUE,
  title       text        NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. Seed categories from existing free-text product data
INSERT INTO public.categories (title, slug)
SELECT DISTINCT
  category                                              AS title,
  lower(regexp_replace(category, '\s+', '-', 'g'))      AS slug
FROM public.products
WHERE category IS NOT NULL AND category <> ''
ON CONFLICT (slug) DO NOTHING;

-- 3. Add category_id foreign key column to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category_id uuid
    REFERENCES public.categories(id)
    ON DELETE SET NULL;

-- 4. Populate category_id from the existing text values
UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE p.category = c.title
  AND p.category_id IS NULL;

-- 5. Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Anyone can read categories (needed for the public storefront)
CREATE POLICY "categories_public_read"
  ON public.categories
  FOR SELECT
  USING (true);

-- Only authenticated users can create / update / delete categories
CREATE POLICY "categories_auth_write"
  ON public.categories
  FOR ALL
  USING (auth.role() = 'authenticated');