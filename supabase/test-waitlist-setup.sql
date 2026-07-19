-- Test Setup for Admin Waitlist Management Verification
-- Run this in Supabase SQL Editor to create test data

-- Step 1: Create test users (if they don't exist)
INSERT INTO public.users (id, name, email, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Waitlist Test User 1', 'waitlist1@test.com', 'student'),
  ('22222222-2222-2222-2222-222222222222', 'Waitlist Test User 2', 'waitlist2@test.com', 'student'),
  ('33333333-3333-3333-3333-333333333333', 'Waitlist Test User 3', 'waitlist3@test.com', 'student')
ON CONFLICT (email) DO NOTHING;

-- Step 2: Create or find a test event
-- Option A: Create new test event
INSERT INTO public.events (
  id,
  title,
  description,
  category,
  venue,
  event_date,
  registration_deadline,
  total_seats,
  seats_remaining,
  created_at
)
VALUES (
  '99999999-9999-9999-9999-999999999999',
  'Waitlist Test Event',
  'This is a test event for waitlist management',
  'technology',
  'Test Hall',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '6 days',
  2, -- Total seats
  0, -- No seats remaining (full)
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  seats_remaining = 0,
  total_seats = 2;

-- Step 3: Create confirmed registrations to fill the event
DELETE FROM public.registrations WHERE event_id = '99999999-9999-9999-9999-999999999999';

INSERT INTO public.registrations (user_id, event_id, status, qr_code, checked_in)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'confirmed', 'REG-TEST01', false),
  ('22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999', 'confirmed', 'REG-TEST02', false);

-- Step 4: Add users to waitlist (in order)
DELETE FROM public.waitlist WHERE event_id = '99999999-9999-9999-9999-999999999999';

INSERT INTO public.waitlist (user_id, event_id, joined_at)
VALUES 
  ('33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', NOW() - INTERVAL '1 hour'),
  (
    (SELECT id FROM public.users WHERE role = 'student' AND email NOT IN ('waitlist1@test.com', 'waitlist2@test.com', 'waitlist3@test.com') LIMIT 1),
    '99999999-9999-9999-9999-999999999999',
    NOW() - INTERVAL '30 minutes'
  );

-- Verification Query: Check the setup
SELECT 
  e.title,
  e.total_seats,
  e.seats_remaining,
  COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'confirmed') as confirmed_registrations,
  COUNT(DISTINCT w.id) as waitlist_count
FROM public.events e
LEFT JOIN public.registrations r ON e.id = r.event_id
LEFT JOIN public.waitlist w ON e.id = w.event_id
WHERE e.id = '99999999-9999-9999-9999-999999999999'
GROUP BY e.id, e.title, e.total_seats, e.seats_remaining;

-- View waitlist in order
SELECT 
  ROW_NUMBER() OVER (ORDER BY w.joined_at) as position,
  u.name,
  u.email,
  w.joined_at
FROM public.waitlist w
JOIN public.users u ON w.user_id = u.id
WHERE w.event_id = '99999999-9999-9999-9999-999999999999'
ORDER BY w.joined_at;

-- To clean up test data later, run:
-- DELETE FROM public.waitlist WHERE event_id = '99999999-9999-9999-9999-999999999999';
-- DELETE FROM public.registrations WHERE event_id = '99999999-9999-9999-9999-999999999999';
-- DELETE FROM public.events WHERE id = '99999999-9999-9999-9999-999999999999';
-- DELETE FROM public.users WHERE email LIKE 'waitlist%@test.com';
