-- Update check_in_registration function to handle case-insensitive QR codes
-- This allows lowercase qr codes like "reg-a3f7b2" to match uppercase "REG-A3F7B2"

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

-- Note: This function now uses UPPER() for case-insensitive comparison
-- Both "reg-a3f7b2" and "REG-A3F7B2" will match the same registration
