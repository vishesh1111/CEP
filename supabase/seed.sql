-- College Event Management Portal - Seed Data
-- Run this AFTER the migration in Supabase SQL Editor
-- NOTE: Demo users must be created through Supabase Auth first
-- Use the app's registration flow or Supabase Dashboard to create these users
-- Then run this seed to populate events, registrations, and announcements

-- ============================================
-- DEMO USERS (create via Supabase Auth Dashboard)
-- ============================================
-- Admin:   admin@campus.edu   / password: Admin@123
-- Student: alice@campus.edu   / password: Student@123
-- Student: bob@campus.edu     / password: Student@123
-- Student: carol@campus.edu   / password: Student@123

-- After creating users in Auth, get their IDs and update below.
-- For convenience, we'll use placeholder UUIDs that you should replace
-- with actual auth.users IDs after creating them.

-- ============================================
-- SAMPLE EVENTS
-- ============================================

-- Use a DO block to insert events with proper dates relative to now
do $$
declare
  v_admin_id uuid;
begin
  -- Get the admin user ID (first admin found)
  select id into v_admin_id from public.users where role = 'admin' limit 1;

  -- If no admin exists yet, skip seeding
  if v_admin_id is null then
    raise notice 'No admin user found. Create users first, then run seed.';
    return;
  end if;

  -- Event 1: Tech Hackathon (upcoming, many seats)
  insert into public.events (title, description, banner_url, category, venue, event_date, registration_deadline, total_seats, seats_remaining, created_by)
  values (
    'TechHack 2026: 24-Hour Hackathon',
    'Join the biggest hackathon of the year! Build innovative solutions to real-world problems. Teams of 2-4 members. Prizes worth ₹50,000. Mentors from top tech companies will guide you throughout. Food and drinks provided. Bring your laptop and creativity!',
    null,
    'technology',
    'Computer Science Block - Lab 301',
    now() + interval '14 days',
    now() + interval '10 days',
    100,
    87,
    v_admin_id
  );

  -- Event 2: Cultural Night (upcoming, limited seats)
  insert into public.events (title, description, banner_url, category, venue, event_date, registration_deadline, total_seats, seats_remaining, created_by)
  values (
    'Annual Cultural Night: Rhythms & Beats',
    'A spectacular evening of music, dance, and drama performances by students from all departments. Featuring classical dance, band performances, stand-up comedy, and a surprise celebrity guest appearance. Dress code: Semi-formal.',
    null,
    'cultural',
    'Main Auditorium',
    now() + interval '7 days',
    now() + interval '5 days',
    250,
    12,
    v_admin_id
  );

  -- Event 3: Workshop (upcoming, near full)
  insert into public.events (title, description, banner_url, category, venue, event_date, registration_deadline, total_seats, seats_remaining, created_by)
  values (
    'AI/ML Workshop: From Zero to GPT',
    'A hands-on workshop covering the fundamentals of AI and Machine Learning. Learn about neural networks, transformers, and build your own chatbot. Prerequisites: Basic Python knowledge. Laptops required. Certificate provided on completion.',
    null,
    'workshop',
    'Innovation Hub - Room 105',
    now() + interval '5 days',
    now() + interval '3 days',
    40,
    3,
    v_admin_id
  );

  -- Event 4: Sports Tournament (upcoming, fully booked)
  insert into public.events (title, description, banner_url, category, venue, event_date, registration_deadline, total_seats, seats_remaining, created_by)
  values (
    'Inter-Department Cricket Tournament',
    'The annual cricket showdown between departments! Form your team of 11 and compete for the coveted Champions Trophy. Matches played in T10 format. Refreshments provided. Top scorer and best bowler awards.',
    null,
    'sports',
    'University Cricket Ground',
    now() + interval '21 days',
    now() + interval '14 days',
    60,
    0,
    v_admin_id
  );

  -- Event 5: Seminar (past deadline)
  insert into public.events (title, description, banner_url, category, venue, event_date, registration_deadline, total_seats, seats_remaining, created_by)
  values (
    'Guest Lecture: Future of Quantum Computing',
    'Distinguished Professor Dr. Sharma from IISc Bangalore discusses the latest breakthroughs in quantum computing and their implications for the tech industry. Q&A session followed by networking.',
    null,
    'seminar',
    'Lecture Hall A - Block 2',
    now() + interval '2 days',
    now() - interval '1 day',
    150,
    45,
    v_admin_id
  );

  -- Event 6: Social Event (upcoming, good availability)
  insert into public.events (title, description, banner_url, category, venue, event_date, registration_deadline, total_seats, seats_remaining, created_by)
  values (
    'Freshers Welcome Party 2026',
    'Welcome the new batch with an unforgettable evening! DJ night, games, photo booth, and amazing food. Meet seniors, make friends, and start your college journey with a bang. All first-year students get free entry!',
    null,
    'social',
    'Open Air Theatre',
    now() + interval '10 days',
    now() + interval '8 days',
    300,
    215,
    v_admin_id
  );

  -- ============================================
  -- SAMPLE ANNOUNCEMENTS
  -- ============================================

  -- Global announcement
  insert into public.announcements (title, message, posted_by)
  values (
    'Welcome to Campus Events Portal!',
    'We are excited to launch our new event management platform. Browse upcoming events, register with a single click, and never miss out on campus activities. Stay tuned for exciting events this semester!',
    v_admin_id
  );

  -- Event-specific announcement (for the hackathon)
  insert into public.announcements (event_id, title, message, posted_by)
  values (
    (select id from public.events where title like '%Hackathon%' limit 1),
    'Hackathon Theme Announced!',
    'This year''s hackathon theme is "Sustainable Campus Solutions". Start brainstorming ideas around energy efficiency, waste management, and smart campus infrastructure. Detailed problem statements will be released on the event day.',
    v_admin_id
  );

  -- Another global announcement
  insert into public.announcements (title, message, posted_by)
  values (
    'Exam Schedule Update',
    'Mid-semester examinations have been rescheduled to next month. All event registrations during the exam week will remain valid. Check your department notice board for the updated timetable.',
    v_admin_id
  );

  raise notice 'Seed data inserted successfully!';
end;
$$;
