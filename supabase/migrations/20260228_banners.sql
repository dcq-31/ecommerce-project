-- ── Banners table ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.banners (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text        NOT NULL,
  image_url  text        NOT NULL DEFAULT '',
  position   integer     NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "banners_public_read"
  ON public.banners FOR SELECT
  TO public
  USING (true);

CREATE POLICY "banners_auth_write"
  ON public.banners FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── Storage bucket ────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('banner-images', 'banner-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "banner_images_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'banner-images');

CREATE POLICY "banner_images_auth_write"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'banner-images')
  WITH CHECK (bucket_id = 'banner-images');
