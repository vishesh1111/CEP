-- Banned Users Feature - Simplified Version
-- Run this in Supabase SQL Editor

-- Step 1: Create banned_users table
CREATE TABLE IF NOT EXISTS public.banned_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  banned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reason TEXT,
  banned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Step 2: Enable RLS
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies
CREATE POLICY "Admins can view banned users" ON public.banned_users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can ban users" ON public.banned_users
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can unban users" ON public.banned_users
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_banned_users_user_id ON public.banned_users(user_id);
CREATE INDEX IF NOT EXISTS idx_banned_users_event_id ON public.banned_users(event_id);

-- Step 5: Function to increment seats
CREATE OR REPLACE FUNCTION public.increment_seats(event_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.events
  SET seats_remaining = seats_remaining + 1
  WHERE id = event_id
    AND seats_remaining < total_seats;
END;
$$;

-- Verify table was created
SELECT 'banned_users table created successfully' AS status;
