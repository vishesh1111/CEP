# Fix Missing Features - Setup Guide

## Problem
You can't see the "Add to Calendar", "Waitlist", and related features even though they're fully implemented in code.

## Root Cause
The **waitlist database table hasn't been created yet**. The code references this table but it doesn't exist in your Supabase database.

## Solution - Run This SQL Migration

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase dashboard
2. Navigate to: **SQL Editor** (left sidebar)
3. Click **New Query**

### Step 2: Copy and Run This SQL

**IMPORTANT**: Copy the ACTUAL SQL code below (not the filename):

```sql
-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  notified BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, event_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_waitlist_event_id ON public.waitlist(event_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_user_id ON public.waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_joined_at ON public.waitlist(event_id, joined_at);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own waitlist entries" ON public.waitlist;
DROP POLICY IF EXISTS "Users can join waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Users can leave waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Admins can view all waitlist entries" ON public.waitlist;

-- RLS Policies
CREATE POLICY "Users can view their own waitlist entries"
  ON public.waitlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can join waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave waitlist"
  ON public.waitlist FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all waitlist entries"
  ON public.waitlist FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Function to get waitlist position for a user
CREATE OR REPLACE FUNCTION get_waitlist_position(p_user_id UUID, p_event_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_position INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO v_position
  FROM public.waitlist
  WHERE event_id = p_event_id
  AND joined_at < (
    SELECT joined_at FROM public.waitlist 
    WHERE user_id = p_user_id AND event_id = p_event_id
  );
  
  RETURN v_position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing cancel_registration function first
DROP FUNCTION IF EXISTS cancel_registration(UUID, UUID);

-- Update cancel_registration function to handle waitlist promotion
CREATE OR REPLACE FUNCTION cancel_registration(
  p_registration_id UUID,
  p_user_id UUID
) RETURNS JSON AS $$
DECLARE
  v_event_id UUID;
  v_waitlist_entry RECORD;
  v_promoted_user_id UUID;
  v_new_qr_code TEXT;
BEGIN
  -- Get event_id and verify ownership
  SELECT event_id INTO v_event_id
  FROM public.registrations
  WHERE id = p_registration_id AND user_id = p_user_id AND status = 'confirmed';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found or already cancelled';
  END IF;
  
  -- Mark registration as cancelled
  UPDATE public.registrations
  SET status = 'cancelled'
  WHERE id = p_registration_id;
  
  -- Increment seats
  UPDATE public.events
  SET seats_remaining = seats_remaining + 1
  WHERE id = v_event_id;
  
  -- Check for waitlist entries (get first in queue)
  SELECT * INTO v_waitlist_entry
  FROM public.waitlist
  WHERE event_id = v_event_id
  ORDER BY joined_at ASC
  LIMIT 1;
  
  -- If waitlist exists, auto-promote first person
  IF FOUND THEN
    v_promoted_user_id := v_waitlist_entry.user_id;
    v_new_qr_code := 'REG-' || UPPER(encode(gen_random_bytes(3), 'hex'));
    
    -- Create registration for waitlisted user
    INSERT INTO public.registrations (user_id, event_id, status, qr_code)
    VALUES (
      v_promoted_user_id,
      v_event_id,
      'confirmed',
      v_new_qr_code
    );
    
    -- Remove from waitlist
    DELETE FROM public.waitlist WHERE id = v_waitlist_entry.id;
    
    -- Decrement seats (user took the freed spot)
    UPDATE public.events
    SET seats_remaining = seats_remaining - 1
    WHERE id = v_event_id;
    
    -- Return info about promoted user
    RETURN json_build_object(
      'promoted', true,
      'promoted_user_id', v_promoted_user_id,
      'qr_code', v_new_qr_code,
      'event_id', v_event_id
    );
  ELSE
    -- No one was promoted
    RETURN json_build_object('promoted', false);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 3: Click "Run" Button

You should see: `Success. No rows returned`

## What Features Will Work After This:

### 1. Add to Calendar Button ✅
- Located on every event detail page
- Dropdown menu with:
  - **Download .ics File** - Works with any calendar app
  - **Google Calendar** - Opens Google Calendar with pre-filled event

### 2. Waitlist System ✅
- Automatically appears when event is full (`seats_remaining = 0`)
- Shows "Join Waitlist" button instead of "Register Now"
- Displays waitlist position (e.g., "Position #3")
- Auto-promotes first person when someone cancels
- Sends email notification to promoted user

### 3. Where to See Them:
- **Add to Calendar**: Go to any event detail page → Look for calendar icon button below the register button
- **Waitlist**: Create a test event with only 1 seat, register as one user, then try to register as another user → You'll see "Join Waitlist" button

## Testing Steps:

1. **Test Add to Calendar**:
   - Go to `/events` page
   - Click on any event
   - Scroll to the event details sidebar (right side)
   - You should see "Add to Calendar" button with calendar icon
   - Click it and try both download options

2. **Test Waitlist**:
   - As admin, create an event with `total_seats = 1`
   - Register as a student (use one account)
   - Logout and try to register with another account
   - You should see "Join Waitlist" button instead of "Register Now"
   - Click it and you'll see "Position #1 in queue"

## Still Not Working?

Check browser console (F12) for errors. Common issues:
- Clear browser cache and hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Make sure you're on the latest code (pull/restart dev server)
- Verify Supabase connection is working

## Architecture Summary:

The features are split into:
- **Frontend Components**: `add-to-calendar-button.tsx`, `register-button.tsx` (contains waitlist UI)
- **Server Actions**: `waitlist.ts` (join/leave/position functions)
- **Database**: `waitlist` table + `cancel_registration` RPC function
- **Utilities**: `calendar.ts` (ICS generation, Google Calendar URLs)

All pieces are in place — you just need to run the SQL migration above!
