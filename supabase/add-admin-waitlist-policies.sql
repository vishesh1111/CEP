-- Add admin policies for waitlist management

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can manage all waitlist entries" ON public.waitlist;
DROP POLICY IF EXISTS "Admins can delete waitlist entries" ON public.waitlist;
DROP POLICY IF EXISTS "Admins can insert waitlist entries" ON public.waitlist;

-- Allow admins to delete any waitlist entry (for remove action)
CREATE POLICY "Admins can delete waitlist entries"
  ON public.waitlist FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Allow admins to insert waitlist entries (for manual additions if needed)
CREATE POLICY "Admins can insert waitlist entries"
  ON public.waitlist FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
