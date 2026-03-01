-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Simplify currencies — remove code and flag columns.
-- The name column becomes the abbreviated identifier (e.g. USD, CUP, MLC).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Overwrite name with the existing code abbreviation so existing rows keep
--    their short identifier (USD, CUP, BRL).
UPDATE public.currencies SET name = code;

-- 2. Add a UNIQUE constraint on name now that it holds the abbreviation.
ALTER TABLE public.currencies
  ADD CONSTRAINT currencies_name_key UNIQUE (name);

-- 3. Drop the columns that are no longer part of the model.
ALTER TABLE public.currencies DROP COLUMN IF EXISTS flag;
ALTER TABLE public.currencies DROP COLUMN IF EXISTS code;
