-- ── Orders table ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.orders (
  id         text          PRIMARY KEY,             -- "ORD-XXXXXX"
  data       jsonb         NOT NULL,                -- full OrderData payload
  total_usd  numeric(12,4) NOT NULL DEFAULT 0,      -- precomputed base total in USD
  created_at timestamptz   NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can insert — customers place orders
CREATE POLICY "orders_public_insert"
  ON public.orders FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated admins can read or delete
CREATE POLICY "orders_auth_select"
  ON public.orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "orders_auth_delete"
  ON public.orders FOR DELETE
  TO authenticated
  USING (true);
