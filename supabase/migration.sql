-- College Event Management Portal - Database Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- TABLES
-- ============================================

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text unique not null,
  role text not null default 'student' check (role in ('student','admin')),
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  banner_url text,
  category text not null default 'general',
  venue text not null,
  event_date timestamptz not null,
  registration_deadline timestamptz not null,
  total_seats int not null check (total_seats > 0),
  seats_remaining int not null,
  created_by uuid references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  status text not null default 'confirmed' check (status in ('confirmed','cancelled')),
  qr_code text unique,
  checked_in boolean default false,
  registered_at timestamptz default now(),
  unique (user_id, event_id)
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  title text not null,
  message text not null,
  posted_by uuid references public.users(id),
  posted_at timestamptz default now()
);

-- ============================================
-- RPC FUNCTIONS (Atomic seat handling)
-- ============================================

create or replace function register_for_event(p_event_id uuid, p_user_id uuid)
returns public.registrations
language plpgsql
security definer
as $$
declare
  v_reg public.registrations;
  v_deadline timestamptz;
begin
  -- Check registration deadline
  select registration_deadline into v_deadline
  from public.events where id = p_event_id;

  if v_deadline is null then
    raise exception 'Event not found';
  end if;

  if now() > v_deadline then
    raise exception 'Registration deadline has passed';
  end if;

  -- Atomically decrement seats
  update public.events
  set seats_remaining = seats_remaining - 1,
      updated_at = now()
  where id = p_event_id and seats_remaining > 0;

  if not found then
    raise exception 'No seats available';
  end if;

  -- Insert or re-confirm registration
  insert into public.registrations (user_id, event_id, qr_code)
  values (p_user_id, p_event_id, 'REG-' || UPPER(encode(gen_random_bytes(3), 'hex')))
  on conflict (user_id, event_id)
    do update set status = 'confirmed',
                  qr_code = 'REG-' || UPPER(encode(gen_random_bytes(3), 'hex'))
  returning * into v_reg;

  return v_reg;
end;
$$;

create or replace function cancel_registration(p_registration_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_event_id uuid;
begin
  update public.registrations
  set status = 'cancelled'
  where id = p_registration_id and user_id = p_user_id and status = 'confirmed'
  returning event_id into v_event_id;

  if v_event_id is not null then
    update public.events
    set seats_remaining = seats_remaining + 1,
        updated_at = now()
    where id = v_event_id;
  end if;
end;
$$;

-- Check-in function for admin QR scanning
create or replace function check_in_registration(p_qr_code text)
returns public.registrations
language plpgsql
security definer
as $$
declare
  v_reg public.registrations;
begin
  update public.registrations
  set checked_in = true
  where qr_code = p_qr_code and status = 'confirmed' and checked_in = false
  returning * into v_reg;

  if v_reg is null then
    raise exception 'Invalid QR code, already checked in, or registration cancelled';
  end if;

  return v_reg;
end;
$$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.users enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.announcements enable row level security;

-- Users policies
create policy "Users can read all users" on public.users
  for select using (true);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id);

-- Events policies
create policy "Anyone can read events" on public.events
  for select using (true);

create policy "Admins can insert events" on public.events
  for insert with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update events" on public.events
  for update using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete events" on public.events
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Registrations policies
create policy "Users can read own registrations" on public.registrations
  for select using (auth.uid() = user_id);

create policy "Admins can read all registrations" on public.registrations
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Users can insert own registrations" on public.registrations
  for insert with check (auth.uid() = user_id);

create policy "Users can update own registrations" on public.registrations
  for update using (auth.uid() = user_id);

create policy "Admins can update all registrations" on public.registrations
  for update using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Announcements policies
create policy "Anyone can read announcements" on public.announcements
  for select using (true);

create policy "Admins can insert announcements" on public.announcements
  for insert with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update announcements" on public.announcements
  for update using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete announcements" on public.announcements
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ============================================
-- STORAGE BUCKETS
-- ============================================

insert into storage.buckets (id, name, public) values ('event-banners', 'event-banners', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Anyone can read event banners" on storage.objects
  for select using (bucket_id = 'event-banners');

create policy "Admins can upload event banners" on storage.objects
  for insert with check (
    bucket_id = 'event-banners' and
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete event banners" on storage.objects
  for delete using (
    bucket_id = 'event-banners' and
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Anyone can read avatars" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Users can upload own avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid() is not null
  );

create policy "Users can update own avatar" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid() is not null
  );

-- ============================================
-- TRIGGER: Auto-create public.users on auth signup
-- ============================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', 'User'),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'student')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
