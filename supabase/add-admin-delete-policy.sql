-- Add DELETE policy for admins on registrations table
-- This allows admins to remove user registrations

CREATE POLICY "Admins can delete registrations" ON public.registrations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
