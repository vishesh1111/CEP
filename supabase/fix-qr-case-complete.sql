-- Complete fix for QR code case sensitivity issues
-- This script:
-- 1. Updates register_for_event to generate uppercase QR codes
-- 2. Updates check_in_registration to match case-insensitively
-- 3. Converts all existing QR codes to uppercase

-- Step 1: Update register_for_event to generate uppercase codes
CREATE OR REPLACE FUNCTION register_for_event(p_event_id uuid, p_user_id uuid)
RETURNS public.registrations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reg public.registrations;
  v_deadline timestamptz;
BEGIN
  -- Check registration deadline
  SELECT registration_deadline INTO v_deadline
  FROM public.events WHERE id = p_event_id;

  IF v_deadline IS NULL THEN
    RAISE EXCEPTION 'Event not found';
  END IF;

  IF now() > v_deadline THEN
    RAISE EXCEPTION 'Registration deadline has passed';
  END IF;

  -- Atomically decrement seats
  UPDATE public.events
  SET seats_remaining = seats_remaining - 1,
      updated_at = now()
  WHERE id = p_event_id AND seats_remaining > 0;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No seats available';
  END IF;

  -- Insert or re-confirm registration with UPPERCASE hex
  INSERT INTO public.registrations (user_id, event_id, qr_code)
  VALUES (p_user_id, p_event_id, UPPER(encode(gen_random_bytes(12), 'hex')))
  ON CONFLICT (user_id, event_id)
    DO UPDATE SET 
      status = 'confirmed',
      qr_code = UPPER(encode(gen_random_bytes(12), 'hex'))
  RETURNING * INTO v_reg;

  RETURN v_reg;
END;
$$;

-- Step 2: Update check_in_registration to be case-insensitive
CREATE OR REPLACE FUNCTION check_in_registration(p_qr_code text)
RETURNS public.registrations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reg public.registrations;
BEGIN
  -- Update registration with case-insensitive QR code matching
  UPDATE public.registrations
  SET checked_in = true
  WHERE UPPER(qr_code) = UPPER(p_qr_code)
    AND status = 'confirmed'
    AND checked_in = false
  RETURNING * INTO v_reg;
  
  IF v_reg IS NULL THEN
    RAISE EXCEPTION 'Invalid QR code, already checked in, or registration not confirmed';
  END IF;
  
  RETURN v_reg;
END;
$$;

-- Step 3: Convert all existing QR codes to uppercase
UPDATE public.registrations
SET qr_code = UPPER(qr_code)
WHERE qr_code != UPPER(qr_code);

-- Verification query (optional - run separately to check)
-- SELECT 
--   COUNT(*) as total_registrations,
--   COUNT(CASE WHEN qr_code = UPPER(qr_code) THEN 1 END) as uppercase_count
-- FROM public.registrations;
