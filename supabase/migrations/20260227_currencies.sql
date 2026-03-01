-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Create currencies table and seed initial values
-- Currencies store abbreviated codes (USD, CUP, MLC, EUR…) and their exchange
-- rate relative to USD. The base currency (is_base = true) always has rate = 1.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.currencies (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code       text        NOT NULL UNIQUE,
  name       text        NOT NULL,
  rate       numeric     NOT NULL DEFAULT 1 CHECK (rate > 0),
  flag       text        NOT NULL DEFAULT '',
  is_base    boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed with the three currencies previously hardcoded in lib/currency.ts
INSERT INTO public.currencies (code, name, rate, flag, is_base) VALUES
  ('USD', 'Dólar estadounidense', 1,     '🇺🇸', true),
  ('CUP', 'Peso cubano',          510,   '🇨🇺', false),
  ('BRL', 'Real brasileño',       5.2,   '🇧🇷', false)
ON CONFLICT (code) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;

-- Public storefront can read currencies
CREATE POLICY "currencies_public_read"
  ON public.currencies
  FOR SELECT
  USING (true);

-- Only authenticated users can write
CREATE POLICY "currencies_auth_write"
  ON public.currencies
  FOR ALL
  USING (auth.role() = 'authenticated');
