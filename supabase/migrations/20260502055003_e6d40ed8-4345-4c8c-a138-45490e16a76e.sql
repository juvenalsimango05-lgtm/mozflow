ALTER TABLE public.deposits
  ADD CONSTRAINT deposits_user_id_profile_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.withdrawals
  ADD CONSTRAINT withdrawals_user_id_profile_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;