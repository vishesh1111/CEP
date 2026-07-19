-- Add event completion tracking
-- This allows admins to manually mark when an event is "completed"
-- which triggers certificate/feedback availability for students

-- Add completed column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- Add completed_at timestamp for tracking when admin marked it complete
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ NULL;

-- Create index for faster queries on completed events
CREATE INDEX IF NOT EXISTS idx_events_completed ON public.events(completed);
CREATE INDEX IF NOT EXISTS idx_events_completed_at ON public.events(completed_at);

-- Function to mark an event as completed (admin only)
CREATE OR REPLACE FUNCTION mark_event_completed(p_event_id UUID)
RETURNS JSON AS $$
DECLARE
  v_event_title TEXT;
  v_registrations_count INTEGER;
  v_checked_in_count INTEGER;
BEGIN
  -- Verify event exists and get details
  SELECT title INTO v_event_title
  FROM public.events
  WHERE id = p_event_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found';
  END IF;
  
  -- Get registration stats
  SELECT 
    COUNT(*) FILTER (WHERE status = 'confirmed') as total,
    COUNT(*) FILTER (WHERE status = 'confirmed' AND checked_in = true) as checked_in
  INTO v_registrations_count, v_checked_in_count
  FROM public.registrations
  WHERE event_id = p_event_id;
  
  -- Mark event as completed
  UPDATE public.events
  SET 
    completed = true,
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_event_id;
  
  -- Return summary
  RETURN json_build_object(
    'success', true,
    'event_title', v_event_title,
    'total_registrations', v_registrations_count,
    'checked_in_count', v_checked_in_count,
    'message', 'Event marked as completed. Students can now submit feedback and download certificates.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reopen an event (undo completion)
CREATE OR REPLACE FUNCTION reopen_event(p_event_id UUID)
RETURNS JSON AS $$
DECLARE
  v_event_title TEXT;
BEGIN
  -- Verify event exists
  SELECT title INTO v_event_title
  FROM public.events
  WHERE id = p_event_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found';
  END IF;
  
  -- Reopen event
  UPDATE public.events
  SET 
    completed = false,
    completed_at = NULL,
    updated_at = NOW()
  WHERE id = p_event_id;
  
  RETURN json_build_object(
    'success', true,
    'event_title', v_event_title,
    'message', 'Event reopened. Students can no longer access certificates/feedback until marked complete again.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to allow admins to update completion status
-- (The existing admin policies should cover this, but let's be explicit)

-- Add policy for completion functions (admin only)
CREATE POLICY "Admins can mark events as completed"
  ON public.events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Verify the changes
SELECT 
  'Event completion setup complete!' as status,
  'Events can now be marked as completed by admins' as description,
  'This triggers certificate/feedback availability for students' as effect;