
CREATE INDEX IF NOT EXISTS idx_investments_user_status ON public.investments (user_id, status);
CREATE INDEX IF NOT EXISTS idx_investments_user_total_return ON public.investments (user_id, total_return DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles (referred_by) WHERE referred_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_roulette_spins_user_date ON public.roulette_spins (user_id, spun_on);
