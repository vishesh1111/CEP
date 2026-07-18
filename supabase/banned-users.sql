-- Banned Users Feature
-- Allows admins to ban specific users from registering for specific events

-- Create banned_users table
create table if not exists public.banned_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  event_id uuid references public.events(id) on delete cascade not null,
  banned_by uuid references public.users(id) on delete set null,
  reason text,
  banned_at timestamptz default now(),
  unique(user_id, event_id)
);

-- Enable RLS
alter table public.banned_users enable row level security;

-- Policies
create policy "Admins can view banned users" on public.banned_users
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can ban users" on public.banned_users
  for insert with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can unban users" on public.banned_users
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Index for faster lookups
create index if not exists idx_banned_users_user_id on public.banned_users(user_id);
create index if not exists idx_banned_users_event_id on public.banned_users(event_id);

-- Function to check if user is banned from an event
create or replace function public.is_user_banned(p_user_id uuid, p_event_id uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1 
    from public.banned_users 
    where user_id = p_user_id 
      and event_id = p_event_id
  );
end;
$$;

-- Function to increment seats (for when registration is removed)
create or replace function public.increment_seats(event_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.events
  set seats_remaining = seats_remaining + 1
  where id = event_id
    and seats_remaining < total_seats;
end;
$$;

-- Update the register_for_event function to check for bans
create or replace function public.register_for_event(
  p_user_id uuid,
  p_event_id uuid
)
returns json
language plpgsql
security definer
as $$
declare
  v_seats_remaining int;
  v_registration_deadline timestamptz;
  v_registration_id uuid;
  v_qr_code text;
begin
  -- Check if user is banned
  if exists (select 1 from public.banned_users where user_id = p_user_id and event_id = p_event_id) then
    return json_build_object(
      'success', false,
      'error', 'You have been banned from registering for this event'
    );
  end if;

  -- Check if already registered
  if exists (
    select 1 from public.registrations 
    where user_id = p_user_id 
      and event_id = p_event_id 
      and status = 'confirmed'
  ) then
    return json_build_object(
      'success', false,
      'error', 'Already registered for this event'
    );
  end if;

  -- Get event details
  select seats_remaining, registration_deadline 
  into v_seats_remaining, v_registration_deadline
  from public.events 
  where id = p_event_id;

  -- Check deadline
  if v_registration_deadline < now() then
    return json_build_object(
      'success', false,
      'error', 'Registration deadline has passed'
    );
  end if;

  -- Check seats
  if v_seats_remaining <= 0 then
    return json_build_object(
      'success', false,
      'error', 'No seats available'
    );
  end if;

  -- Generate QR code
  v_registration_id := gen_random_uuid();
  v_qr_code := 'REG-' || upper(substring(v_registration_id::text, 1, 8));

  -- Insert registration
  insert into public.registrations (id, user_id, event_id, qr_code)
  values (v_registration_id, p_user_id, p_event_id, v_qr_code);

  -- Decrement seats
  update public.events 
  set seats_remaining = seats_remaining - 1 
  where id = p_event_id;

  return json_build_object(
    'success', true,
    'registration_id', v_registration_id
  );
end;
$$;

comment on table public.banned_users is 'Stores users banned from specific events';
comment on function public.is_user_banned is 'Checks if a user is banned from an event';
comment on function public.increment_seats is 'Increments available seats when a registration is removed';
