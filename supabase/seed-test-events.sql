-- Seed test events for development and testing
-- This script can be run via the Supabase SQL editor or via a script
-- It does NOT require an admin user to exist first

-- Delete existing test events (optional - comment out if you want to keep existing data)
-- DELETE FROM public.events WHERE title LIKE '%[TEST]%';

-- Insert 6 test events covering different scenarios
-- Note: created_by is nullable, so we can insert without it
INSERT INTO public.events (
  title,
  description,
  event_date,
  registration_deadline,
  venue,
  category,
  total_seats,
  seats_remaining,
  banner_url,
  created_by
) VALUES
  -- 1. Plenty of seats (good availability) - Happening today
  (
    '[TEST] Tech Talk: Future of AI',
    'Join us for an exciting discussion on the future of artificial intelligence and machine learning. Industry experts will share their insights on emerging trends and career opportunities in AI. Perfect for students interested in tech careers.',
    CURRENT_DATE + INTERVAL '8 hours',
    CURRENT_DATE + INTERVAL '6 hours',
    'Main Auditorium, Block A',
    'academic',
    100,
    87,
    NULL,
    NULL
  ),
  
  -- 2. Nearly full (2-3 seats left)
  (
    '[TEST] Annual Music Fest 2026',
    'The biggest cultural event of the year! Live performances by campus bands, DJ night, and special guest performances. Food stalls, game booths, and lots of fun activities. Don''t miss out on this spectacular celebration!',
    CURRENT_DATE + INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '3 days',
    'Open Air Theatre',
    'cultural',
    150,
    2,
    NULL,
    NULL
  ),
  
  -- 3. Completely full (no seats remaining)
  (
    '[TEST] Career Fair 2026',
    'Meet recruiters from top companies! Network with industry professionals, attend resume workshops, and explore internship opportunities. Companies from tech, finance, consulting, and more will be present.',
    CURRENT_DATE + INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '7 days',
    'Sports Complex Hall 1',
    'career',
    200,
    0,
    NULL,
    NULL
  ),
  
  -- 4. Past registration deadline (but event in future)
  (
    '[TEST] Marathon for Charity',
    'Run for a cause! Join our annual charity marathon supporting local NGOs. 5K, 10K, and half-marathon options available. All proceeds go to education initiatives for underprivileged children.',
    CURRENT_DATE + INTERVAL '15 days',
    CURRENT_DATE - INTERVAL '1 day',
    'Campus Main Gate (Starting Point)',
    'sports',
    300,
    45,
    NULL,
    NULL
  ),
  
  -- 5. Workshop with good seats - coming soon
  (
    '[TEST] Web Development Bootcamp',
    'Learn modern web development from scratch! This hands-on 3-day workshop covers HTML, CSS, JavaScript, React, and deployment. Perfect for beginners. Laptops required. Limited seats available.',
    CURRENT_DATE + INTERVAL '7 days',
    CURRENT_DATE + INTERVAL '5 days',
    'Computer Lab 3, IT Block',
    'workshop',
    40,
    28,
    NULL,
    NULL
  ),
  
  -- 6. Sports event with moderate availability
  (
    '[TEST] Inter-College Basketball Tournament',
    'Cheer for your campus team! Exciting basketball matches between top colleges. Finals on the last day. Free entry for all students. Refreshments available.',
    CURRENT_DATE + INTERVAL '12 days',
    CURRENT_DATE + INTERVAL '10 days',
    'Indoor Sports Complex',
    'sports',
    500,
    320,
    NULL,
    NULL
  );

-- Verify insertion
SELECT 
  id,
  title,
  category,
  seats_remaining || '/' || total_seats as seats,
  event_date::date as event_date,
  registration_deadline::date as reg_deadline,
  CASE 
    WHEN registration_deadline < NOW() THEN 'CLOSED'
    WHEN seats_remaining = 0 THEN 'FULL'
    WHEN seats_remaining < 10 THEN 'FILLING FAST'
    ELSE 'AVAILABLE'
  END as status
FROM public.events
WHERE title LIKE '%[TEST]%'
ORDER BY event_date;
