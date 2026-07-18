-- ============================================
-- Database Setup Verification Script
-- ============================================
-- Run this after completing all migrations to verify everything is set up correctly

-- ============================================
-- 1. CHECK TABLES EXIST
-- ============================================
SELECT 
  'Tables Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 6 THEN '✅ PASS' 
    ELSE '❌ FAIL - Expected at least 6 tables' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name IN ('users', 'events', 'registrations', 'announcements', 'waitlist', 'feedback');

-- ============================================
-- 2. CHECK FUNCTIONS EXIST AND HAVE CORRECT RETURN TYPES
-- ============================================
SELECT 
  'Functions Check' as check_type,
  routine_name,
  data_type as return_type,
  CASE 
    WHEN routine_name = 'register_for_event' AND data_type = 'registrations' THEN '✅ PASS'
    WHEN routine_name = 'cancel_registration' AND data_type = 'json' THEN '✅ PASS'
    WHEN routine_name = 'check_in_registration' AND data_type = 'registrations' THEN '✅ PASS'
    WHEN routine_name = 'get_waitlist_position' AND data_type = 'integer' THEN '✅ PASS'
    ELSE '❌ FAIL - Wrong return type'
  END as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'register_for_event',
    'cancel_registration',
    'check_in_registration',
    'get_waitlist_position',
    'handle_new_user',
    'update_updated_at_column'
  )
ORDER BY routine_name;

-- ============================================
-- 3. CHECK TEST EVENTS EXIST
-- ============================================
SELECT 
  'Test Events Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 6 THEN '✅ PASS - Test events loaded' 
    WHEN COUNT(*) > 0 THEN '⚠️ WARNING - Only ' || COUNT(*) || ' test events'
    ELSE '❌ FAIL - No test events. Run seed-test-events.sql' 
  END as status
FROM public.events
WHERE title LIKE '%[TEST]%';

-- ============================================
-- 4. CHECK RLS POLICIES
-- ============================================
SELECT 
  'RLS Policies Check' as check_type,
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS' 
    ELSE '❌ FAIL - No RLS policies' 
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'events', 'registrations', 'announcements', 'waitlist', 'feedback')
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- 5. CHECK STORAGE BUCKETS
-- ============================================
SELECT 
  'Storage Buckets Check' as check_type,
  name,
  public as is_public,
  CASE 
    WHEN name IN ('event-banners', 'avatars') THEN '✅ PASS'
    ELSE '⚠️ WARNING - Unexpected bucket'
  END as status
FROM storage.buckets
WHERE name IN ('event-banners', 'avatars');

-- ============================================
-- 6. CHECK INDEXES
-- ============================================
SELECT 
  'Indexes Check' as check_type,
  indexname,
  tablename,
  '✅ PASS' as status
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    indexname LIKE 'idx_waitlist%' 
    OR indexname LIKE 'idx_feedback%'
  )
ORDER BY tablename, indexname;

-- ============================================
-- 7. DETAILED TEST EVENTS INFO
-- ============================================
SELECT 
  '📊 Test Events Details' as info,
  title,
  category,
  seats_remaining || '/' || total_seats as seats,
  ROUND((total_seats - seats_remaining)::numeric / total_seats * 100, 1) || '%' as fill_percentage,
  event_date::date as event_date,
  registration_deadline::date as reg_deadline,
  CASE 
    WHEN registration_deadline < NOW() THEN '🔴 CLOSED'
    WHEN seats_remaining = 0 THEN '🔴 FULL'
    WHEN (total_seats - seats_remaining)::numeric / total_seats > 0.9 THEN '🔴 FILLING FAST'
    WHEN (total_seats - seats_remaining)::numeric / total_seats > 0.5 THEN '🟠 MODERATE'
    ELSE '🟢 AVAILABLE'
  END as expected_color_status
FROM public.events
WHERE title LIKE '%[TEST]%'
ORDER BY event_date;

-- ============================================
-- 8. SUMMARY
-- ============================================
SELECT 
  '📋 Summary' as section,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'events', 'registrations', 'announcements', 'waitlist', 'feedback')) as tables_count,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as functions_count,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as policies_count,
  (SELECT COUNT(*) FROM public.events WHERE title LIKE '%[TEST]%') as test_events_count,
  (SELECT COUNT(*) FROM public.users) as users_count,
  (SELECT COUNT(*) FROM public.registrations) as registrations_count,
  (SELECT COUNT(*) FROM public.waitlist) as waitlist_count,
  (SELECT COUNT(*) FROM public.feedback) as feedback_count;

-- ============================================
-- EXPECTED RESULTS
-- ============================================
-- If everything is set up correctly, you should see:
-- 
-- Tables: 6 (users, events, registrations, announcements, waitlist, feedback)
-- Functions: 6+ (register_for_event, cancel_registration, check_in_registration, get_waitlist_position, handle_new_user, update_updated_at_column)
-- Test Events: 6 with different seat availability scenarios
-- RLS Policies: Multiple policies per table
-- Storage Buckets: 2 (event-banners, avatars)
-- 
-- Color coding for test events:
-- - Tech Talk (87/100, 13% filled): 🟢 GREEN
-- - Music Fest (2/150, 98.7% filled): 🔴 RED
-- - Career Fair (0/200, 100% filled): 🔴 RED
-- - Marathon (45/300, 85% filled): 🟠 AMBER
-- - Bootcamp (28/40, 30% filled): 🟢 GREEN
-- - Basketball (320/500, 36% filled): 🟢 GREEN
