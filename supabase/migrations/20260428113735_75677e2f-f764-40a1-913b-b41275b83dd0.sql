-- Home slides table: up to 8 slides managed by admin
CREATE TABLE public.home_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot INTEGER NOT NULL UNIQUE CHECK (slot >= 1 AND slot <= 8),
  image_url TEXT NOT NULL DEFAULT '',
  link_url TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.home_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view slides" ON public.home_slides
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage slides" ON public.home_slides
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed 8 empty slots
INSERT INTO public.home_slides (slot) SELECT g FROM generate_series(1,8) g;

-- Settings keys for referral reward + maintenance are stored in app_settings (already exists)
-- We standardize keys: 'referral_reward', 'maintenance_enabled', 'maintenance_message'
INSERT INTO public.app_settings (key, value) VALUES
  ('referral_reward', '0'),
  ('maintenance_enabled', 'false'),
  ('maintenance_message', 'A app está em manutenção. Volte mais tarde.')
ON CONFLICT (key) DO NOTHING;