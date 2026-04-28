CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read settings" ON public.app_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage settings" ON public.app_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

INSERT INTO public.app_settings (key, value) VALUES
  ('whatsapp_url', 'https://wa.me/258865210207'),
  ('community_url', 'https://chat.whatsapp.com/');
