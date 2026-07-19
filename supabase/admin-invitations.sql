-- Fix admin_invitations table
-- Run this in the Supabase SQL Editor

-- 1. Drop the unique constraint on email so users can be re-invited after expiry
-- (We allow multiple rows; only one pending per email enforced via app logic)

-- First check if table exists and recreate cleanly
DROP TABLE IF EXISTS public.admin_invitations CASCADE;

CREATE TABLE public.admin_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  invited_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz
);

-- Enable RLS
ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins can view all invitations" ON public.admin_invitations;
DROP POLICY IF EXISTS "Admins can create invitations" ON public.admin_invitations;
DROP POLICY IF EXISTS "Admins can update invitations" ON public.admin_invitations;

-- Policies: admins can do everything
CREATE POLICY "Admins can view all invitations" ON public.admin_invitations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can create invitations" ON public.admin_invitations
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update invitations" ON public.admin_invitations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_invitations_email ON public.admin_invitations(email);
CREATE INDEX IF NOT EXISTS idx_admin_invitations_status ON public.admin_invitations(status);
CREATE INDEX IF NOT EXISTS idx_admin_invitations_token ON public.admin_invitations(token);

-- Grant access to authenticated users (needed for RLS to work via app)
GRANT SELECT, INSERT, UPDATE ON public.admin_invitations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.admin_invitations TO service_role;

SELECT 'admin_invitations table created successfully' AS result;
