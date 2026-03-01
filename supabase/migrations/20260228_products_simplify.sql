-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Simplify products — drop description, tags, and SEO columns.
-- The slug is now auto-generated server-side and is immutable after creation.
-- The currency is always the base currency (USD); currency_code is kept but
-- will always be written as "USD" by the application layer.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.products
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS description_html,
  DROP COLUMN IF EXISTS tags,
  DROP COLUMN IF EXISTS seo_title,
  DROP COLUMN IF EXISTS seo_description;
