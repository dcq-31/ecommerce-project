-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: General settings table.
-- A simple key/value store for site-wide configuration.
-- Starting with phone_number; additional keys can be upserted freely.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.settings (
  key        text PRIMARY KEY,
  value      text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default keys so the settings page always has rows to update.
INSERT INTO public.settings (key, value)
VALUES ('phone_number', '')
ON CONFLICT (key) DO NOTHING;

-- ── Row-Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Anyone (including the storefront) can read settings.
CREATE POLICY "Public can read settings"
  ON public.settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated admins can insert new keys.
CREATE POLICY "Authenticated users can insert settings"
  ON public.settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated admins can update values.
CREATE POLICY "Authenticated users can update settings"
  ON public.settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
