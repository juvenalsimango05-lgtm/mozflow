
-- Update generate_referral_code to use uppercase + digits
CREATE OR REPLACE FUNCTION public.generate_referral_code()
  RETURNS text
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Convert all existing codes to uppercase
UPDATE public.profiles SET referral_code = UPPER(referral_code);
