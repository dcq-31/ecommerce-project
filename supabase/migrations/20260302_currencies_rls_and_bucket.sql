-- ── Fix currencies RLS policy ─────────────────────────────────────────────────
-- The original policy used USING (auth.role() = 'authenticated') with no WITH
-- CHECK clause. For INSERT/UPDATE this causes "new row violates row-level
-- security policy" because PostgreSQL re-evaluates the USING expression as
-- WITH CHECK, and auth.role() may not return 'authenticated' in that context.
-- Replace it with the same pattern used by the banners table.

DROP POLICY IF EXISTS "currencies_auth_write" ON public.currencies;

CREATE POLICY "currencies_auth_write"
  ON public.currencies FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── currency-images storage bucket ────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('currency-images', 'currency-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "currency_images_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'currency-images');

CREATE POLICY "currency_images_auth_write"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'currency-images')
  WITH CHECK (bucket_id = 'currency-images');
