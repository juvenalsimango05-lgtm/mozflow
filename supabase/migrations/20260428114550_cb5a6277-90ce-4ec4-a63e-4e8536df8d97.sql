CREATE OR REPLACE FUNCTION public.settle_hourly_payouts()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  inv RECORD;
  v_hourly numeric;
  v_hours integer;
  v_remaining numeric;
  v_pay numeric;
  v_total_credited numeric := 0;
BEGIN
  IF v_user IS NULL THEN
    RETURN 0;
  END IF;

  FOR inv IN
    SELECT id, amount, daily_return, total_return, earned, start_date, last_payout_at
    FROM public.investments
    WHERE user_id = v_user AND status = 'active'
    FOR UPDATE
  LOOP
    v_hourly := inv.daily_return / 24.0;
    -- full hours elapsed since last payout (or start if never paid)
    v_hours := FLOOR(EXTRACT(EPOCH FROM (now() - COALESCE(inv.last_payout_at, inv.start_date))) / 3600.0)::int;

    IF v_hours <= 0 THEN
      CONTINUE;
    END IF;

    v_remaining := inv.total_return - inv.earned;
    IF v_remaining <= 0 THEN
      UPDATE public.investments SET status = 'completed' WHERE id = inv.id;
      CONTINUE;
    END IF;

    v_pay := LEAST(v_hourly * v_hours, v_remaining);

    -- advance last_payout_at by exactly v_hours hours (preserves any partial hour fraction)
    UPDATE public.investments
      SET earned = earned + v_pay,
          last_payout_at = COALESCE(last_payout_at, start_date) + (v_hours || ' hours')::interval,
          status = CASE WHEN earned + v_pay >= total_return THEN 'completed' ELSE status END
      WHERE id = inv.id;

    v_total_credited := v_total_credited + v_pay;
  END LOOP;

  IF v_total_credited > 0 THEN
    UPDATE public.profiles
      SET balance = balance + v_total_credited,
          total_earnings = total_earnings + v_total_credited
      WHERE id = v_user;
  END IF;

  RETURN v_total_credited;
END;
$$;

REVOKE ALL ON FUNCTION public.settle_hourly_payouts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.settle_hourly_payouts() TO authenticated;