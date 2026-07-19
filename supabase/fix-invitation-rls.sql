-- Fix: Allow invited users to read their own invitation
-- and to update (accept/decline) their own invitation.
-- Run this in your Supabase SQL Editor.

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Admins can view all invitations" ON public.admin_invitations;
DROP POLICY IF EXISTS "Admins can update invitations" ON public.admin_invitations;

-- Admins can view ALL invitations
CREATE POLICY "Admins can view all invitations" ON public.admin_invitations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Invited users can view ONLY their own invitation (needed for the dashboard banner)
CREATE POLICY "Users can view own invitation" ON public.admin_invitations
  FOR SELECT USING (
    email = auth.email()
  );

-- Admins can update any invitation (revoke etc.)
CREATE POLICY "Admins can update invitations" ON public.admin_invitations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Invited users can update their OWN invitation (accept or decline)
CREATE POLICY "Users can update own invitation" ON public.admin_invitations
  FOR UPDATE USING (
    email = auth.email()
  );

SELECT 'RLS policies updated successfully' AS result;
