-- Update QR code generation to use shorter, easier-to-type format
-- New format: REG-XXXXXX (10 characters total)
-- Example: REG-A3F7B2

-- Update the register_for_event function to generate shorter QR codes
CREATE OR REPLACE FUNCTION register_for_event(p_event_id uuid, p_user_id uuid)
RETURNS public.registrations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reg public.registrations;
  v_seats_remaining int;
  v_registration_deadline timestamptz;
BEGIN
  -- Check seats and deadline
  SELECT seats_remaining, registration_deadline 
  INTO v_seats_remaining, v_registration_deadline
  FROM public.events 
  WHERE id = p_event_id;
  
  IF v_registration_deadline < now() THEN
    RAISE EXCEPTION 'Registration deadline has passed';
  END IF;
  
  IF v_seats_remaining <= 0 THEN
    RAISE EXCEPTION 'No seats available';
  END IF;

  -- Insert or re-confirm registration with shorter QR code
  -- Format: REG-XXXXXX (6 random hex characters)
  INSERT INTO public.registrations (user_id, event_id, qr_code)
  VALUES (
    p_user_id, 
    p_event_id, 
    'REG-' || UPPER(encode(gen_random_bytes(3), 'hex'))
  )
  ON CONFLICT (user_id, event_id)
    DO UPDATE SET 
      status = 'confirmed',
      qr_code = 'REG-' || UPPER(encode(gen_random_bytes(3), 'hex'))
  RETURNING * INTO v_reg;

  RETURN v_reg;
END;
$$;

-- Optionally: Update existing QR codes to shorter format
-- WARNING: This will invalidate existing QR codes!
-- Uncomment the following lines if you want to update existing registrations:

-- UPDATE public.registrations
-- SET qr_code = 'REG-' || UPPER(encode(gen_random_bytes(3), 'hex'))
-- WHERE status = 'confirmed' AND checked_in = false;

-- Note: The new format is:
-- - REG-XXXXXX (10 characters)
-- - Easy to type manually
-- - Still provides 16,777,216 unique combinations (more than enough)
-- - Uppercase for better readability
