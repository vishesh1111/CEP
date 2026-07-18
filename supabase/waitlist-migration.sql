-- Waitlist System Migration
-- Run this in your Supabase SQL Editor

-- 1. Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, event_id)
);

-- 2. Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Users can view own waitlist entries"
  ON waitlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can join waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave waitlist"
  ON waitlist FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all waitlist entries"
  ON waitlist FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all waitlist entries"
  ON waitlist FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 4. Update cancel_registration RPC to auto-promote from waitlist
CREATE OR REPLACE FUNCTION cancel_registration(
  p_registration_id UUID,
  p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  v_event_id UUID;
  v_waitlist_entry RECORD;
BEGIN
  -- Get event_id and verify ownership
  SELECT event_id INTO v_event_id
  FROM registrations
  WHERE id = p_registration_id 
    AND user_id = p_user_id 
    AND status = 'confirmed';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found or already cancelled';
  END IF;
  
  -- Mark registration as cancelled
  UPDATE registrations
  SET status = 'cancelled'
  WHERE id = p_registration_id;
  
  -- Increment seats
  UPDATE events
  SET seats_remaining = seats_remaining + 1
  WHERE id = v_event_id;
  
  -- Check for waitlist entries (get first in queue)
  SELECT * INTO v_waitlist_entry
  FROM waitlist
  WHERE event_id = v_event_id
  ORDER BY joined_at ASC
  LIMIT 1;
  
  -- If someone is waiting, auto-promote them
  IF FOUND THEN
    -- Create registration for the waitlisted user
    INSERT INTO registrations (user_id, event_id, status, qr_code)
    VALUES (
      v_waitlist_entry.user_id,
      v_event_id,
      'confirmed',
      'REG-' || UPPER(encode(gen_random_bytes(3), 'hex'))
    );
    
    -- Remove from waitlist
    DELETE FROM waitlist WHERE id = v_waitlist_entry.id;
    
    -- Decrement seats (the promoted user took the freed spot)
    UPDATE events
    SET seats_remaining = seats_remaining - 1
    WHERE id = v_event_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
