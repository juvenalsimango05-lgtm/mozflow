-- TASKS
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  watch_seconds INTEGER NOT NULL DEFAULT 30,
  reward NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view active tasks" ON public.tasks FOR SELECT TO authenticated
  USING (is_active OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage tasks" ON public.tasks FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TABLE public.task_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  reward NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, task_id)
);
ALTER TABLE public.task_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own claims" ON public.task_claims FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own claims" ON public.task_claims FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ROULETTE
CREATE TABLE public.roulette_prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  probability NUMERIC NOT NULL DEFAULT 12.5,
  slot_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slot_index)
);
ALTER TABLE public.roulette_prizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view prizes" ON public.roulette_prizes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage prizes" ON public.roulette_prizes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TABLE public.roulette_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prize_id UUID REFERENCES public.roulette_prizes(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  spun_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.roulette_spins ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_spins_user_date ON public.roulette_spins (user_id, spun_on);
CREATE POLICY "Users view own spins" ON public.roulette_spins FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own spins" ON public.roulette_spins FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- CHECK-IN (Pesquisa diária)
CREATE TABLE public.checkin_settings (
  day DATE PRIMARY KEY,
  reward NUMERIC NOT NULL DEFAULT 0,
  is_open BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.checkin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view checkin settings" ON public.checkin_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage checkin settings" ON public.checkin_settings FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TABLE public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  reward NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, day)
);
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own checkins" ON public.checkins FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own checkins" ON public.checkins FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Seed 8 default roulette prizes
INSERT INTO public.roulette_prizes (label, amount, probability, slot_index) VALUES
  ('10 MZN', 10, 30, 0),
  ('20 MZN', 20, 20, 1),
  ('50 MZN', 50, 15, 2),
  ('5 MZN', 5, 15, 3),
  ('100 MZN', 100, 8, 4),
  ('0 MZN', 0, 7, 5),
  ('200 MZN', 200, 3, 6),
  ('500 MZN', 500, 2, 7);

-- Default free spins per day setting
INSERT INTO public.app_settings (key, value) VALUES ('roulette_free_spins_per_day', '1')
ON CONFLICT (key) DO NOTHING;