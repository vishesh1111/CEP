-- Admin Invitation System
-- Allows existing admins to invite new admins via email

-- Create admin_invitations table
create table if not exists public.admin_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  invited_by uuid references public.users(id) on delete cascade,
  token text unique not null default encode(gen_random_bytes(32), 'hex'),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz default now(),
  accepted_at timestamptz
);

-- Enable RLS
alter table public.admin_invitations enable row level security;

-- Policies
create policy "Admins can view all invitations" on public.admin_invitations
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can create invitations" on public.admin_invitations
  for insert with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update invitations" on public.admin_invitations
  for update using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Index for faster lookups
create index if not exists idx_admin_invitations_token on public.admin_invitations(token);
create index if not exists idx_admin_invitations_email on public.admin_invitations(email);
create index if not exists idx_admin_invitations_status on public.admin_invitations(status);

-- Function to check if email has valid invitation
create or replace function public.has_valid_admin_invitation(user_email text)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1 
    from public.admin_invitations 
    where email = user_email 
      and status = 'pending' 
      and expires_at > now()
  );
end;
$$;

-- Function to accept invitation
create or replace function public.accept_admin_invitation(user_email text, user_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  invitation_record record;
begin
  -- Get the invitation
  select * into invitation_record
  from public.admin_invitations
  where email = user_email
    and status = 'pending'
    and expires_at > now()
  limit 1;

  -- Check if invitation exists
  if not found then
    return json_build_object('success', false, 'error', 'No valid invitation found');
  end if;

  -- Update invitation status
  update public.admin_invitations
  set status = 'accepted',
      accepted_at = now()
  where id = invitation_record.id;

  -- Update user role to admin
  update public.users
  set role = 'admin'
  where id = user_id;

  return json_build_object('success', true, 'message', 'Admin invitation accepted');
end;
$$;

-- Function to cleanup expired invitations (run periodically)
create or replace function public.cleanup_expired_invitations()
returns void
language plpgsql
security definer
as $$
begin
  update public.admin_invitations
  set status = 'expired'
  where status = 'pending'
    and expires_at < now();
end;
$$;

-- Comments
comment on table public.admin_invitations is 'Stores admin invitation tokens for secure admin onboarding';
comment on function public.has_valid_admin_invitation is 'Checks if an email has a valid pending admin invitation';
comment on function public.accept_admin_invitation is 'Accepts an admin invitation and promotes the user to admin';
comment on function public.cleanup_expired_invitations is 'Marks expired invitations as expired (run via cron)';
