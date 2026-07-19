# Event Completion Feature - Setup Guide

## ✅ IMPLEMENTATION STATUS: COMPLETE

**All code is implemented.** Only database migration needs to be run.

## 🎯 What This Fixes

**Problem**: Currently there's no way for admins to mark when an event has ended, creating ambiguity about when students can:
- Download certificates (requires check-in + event completion)
- Submit feedback (requires event completion)

**Solution**: Admin panel now has a "Mark Complete" button that explicitly marks events as finished.

## ⚡ Quick Start

**For the impatient:** See `QUICK_COMPLETE_EVENT_FEATURE.md` for a 2-minute setup guide.

**For comprehensive testing:** See `EVENT_COMPLETION_TEST_PLAN.md` for detailed test scenarios.

---

## 📋 Step 1: Run Database Migration

**Copy and paste this SQL into your Supabase SQL Editor:**

```sql
-- Add event completion tracking
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_events_completed ON public.events(completed);
CREATE INDEX IF NOT EXISTS idx_events_completed_at ON public.events(completed_at);

-- Function to mark an event as completed (admin only)
CREATE OR REPLACE FUNCTION mark_event_completed(p_event_id UUID)
RETURNS JSON AS $$
DECLARE
  v_event_title TEXT;
  v_registrations_count INTEGER;
  v_checked_in_count INTEGER;
BEGIN
  -- Verify event exists and get details
  SELECT title INTO v_event_title
  FROM public.events
  WHERE id = p_event_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found';
  END IF;
  
  -- Get registration stats
  SELECT 
    COUNT(*) FILTER (WHERE status = 'confirmed') as total,
    COUNT(*) FILTER (WHERE status = 'confirmed' AND checked_in = true) as checked_in
  INTO v_registrations_count, v_checked_in_count
  FROM public.registrations
  WHERE event_id = p_event_id;
  
  -- Mark event as completed
  UPDATE public.events
  SET 
    completed = true,
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_event_id;
  
  -- Return summary
  RETURN json_build_object(
    'success', true,
    'event_title', v_event_title,
    'total_registrations', v_registrations_count,
    'checked_in_count', v_checked_in_count,
    'message', 'Event marked as completed. Students can now submit feedback and download certificates.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reopen an event (undo completion)
CREATE OR REPLACE FUNCTION reopen_event(p_event_id UUID)
RETURNS JSON AS $$
DECLARE
  v_event_title TEXT;
BEGIN
  -- Verify event exists
  SELECT title INTO v_event_title
  FROM public.events
  WHERE id = p_event_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found';
  END IF;
  
  -- Reopen event
  UPDATE public.events
  SET 
    completed = false,
    completed_at = NULL,
    updated_at = NOW()
  WHERE id = p_event_id;
  
  RETURN json_build_object(
    'success', true,
    'event_title', v_event_title,
    'message', 'Event reopened. Students can no longer access certificates/feedback until marked complete again.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify setup
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'events'
  AND column_name IN ('completed', 'completed_at');
```

**Expected Result**: Should show 2 rows (completed, completed_at columns)

---

## 📋 Step 2: Verify Migration Worked

Run this to check:

```sql
-- Should return 2 functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('mark_event_completed', 'reopen_event');
```

---

## 🎨 Step 3: How It Works

### Admin Workflow

1. **Event happens** (check-in students via QR codes)
2. **Event ends**
3. **Admin goes to**: `/admin/events`
4. **Sees status column** with buttons:
   - Future events: "Upcoming" badge
   - Past events not completed: Orange "Mark Complete" button
   - Completed events: Green "Completed" button

5. **Click "Mark Complete"**:
   - Dialog shows event summary
   - Shows registration stats (X/Y checked in)
   - Explains what will happen
   - Click "Mark Complete" to confirm

6. **Event is now completed**:
   - Status changes to green "Completed" badge
   - Students can now download certificates (if checked in)
   - Students can now submit feedback

### Student Experience

**Before Admin Marks Complete**:
```
Dashboard > Past Events > Event Card
├── Certificate button: DISABLED (gray)
│   Tooltip: "Certificate available when event is marked complete by admin"
└── Feedback button: DISABLED (gray)
    Tooltip: "Feedback available when event is marked complete by admin"
```

**After Admin Marks Complete**:
```
Dashboard > Past Events > Event Card
├── Certificate button: 
│   - If checked_in = true: ENABLED (blue, clickable)
│   - If checked_in = false: DISABLED with tooltip "Available after check-in"
└── Feedback button: ENABLED (blue, clickable)
```

---

## 🧪 Step 4: Test It

### Create a Test Past Event

```sql
-- Create an event that happened yesterday
INSERT INTO events (
  title, description, venue, 
  event_date, registration_deadline,
  category, total_seats, seats_remaining
)
VALUES (
  '[TEST] Completed Event Test',
  'Test event for completion feature',
  'Test Venue',
  NOW() - INTERVAL '1 day',  -- Yesterday
  NOW() - INTERVAL '2 days',
  'general', 50, 48
)
RETURNING id, title;
```

Copy the `id` from the result.

### Test as Admin

1. Go to: `http://localhost:3000/admin/events`
2. Find "[TEST] Completed Event Test"
3. Should see orange "Mark Complete" button in Status column
4. Click it
5. Dialog appears showing event details
6. Click "Mark Complete" button
7. Success toast appears
8. Status changes to green "Completed" badge

### Test as Student

1. Register yourself for the test event (via database):
```sql
INSERT INTO registrations (user_id, event_id, status, checked_in, qr_code)
VALUES (
  auth.uid(),
  'event-id-from-above',
  'confirmed',
  true,  -- Checked in
  'REG-TEST-' || UPPER(encode(gen_random_bytes(3), 'hex'))
);
```

2. Go to: `http://localhost:3000/dashboard`
3. Scroll to "Past Events"
4. Find your test event
5. **Certificate button should be ENABLED** (blue, clickable)
6. **Feedback button should be ENABLED** (blue, clickable)

---

## 🔄 Workflow Timeline

```
Event Lifecycle:
─────────────────────────────────────────────────────────────────

1. Event Created
   Admin Panel: Shows "Upcoming" badge
   Students: Can register

2. Event Date Arrives
   Admin Panel: Can check in students via QR
   Students: See QR code for check-in

3. Event Happens
   Admin Panel: Checking in attendees
   Students: Getting checked in

4. Event Ends (THIS IS THE NEW STEP!)
   Admin Panel: Click "Mark Complete"
   Students: Buttons still disabled

5. Admin Marks Complete ← NEW FEATURE!
   Admin Panel: Status shows "Completed"
   Students: Certificate & Feedback buttons ENABLED

6. Post-Event
   Students: Download certificates, submit feedback
   Admin: View feedback in analytics
```

---

## 🎯 Certificate & Feedback Requirements

### Certificate Download
Requires **ALL THREE**:
1. ✅ Event is past (event_date < NOW())
2. ✅ Event is marked complete by admin (completed = true)
3. ✅ Student was checked in (checked_in = true)

### Feedback Submission
Requires **BOTH**:
1. ✅ Event is past (event_date < NOW())  
2. ✅ Event is marked complete by admin (completed = true)

*(Note: Feedback does NOT require check-in)*

---

## 🐛 Troubleshooting

### Error: "Failed to mark event as completed"

**Cause**: Database functions not created yet

**Fix**: Run the SQL migration in Step 1

---

### Error: "function mark_event_completed does not exist"

**Cause**: Same as above

**Fix**: Make sure you ran ALL the SQL in Step 1, including the CREATE OR REPLACE FUNCTION parts

---

### Buttons Still Disabled After Marking Complete

**Cause**: Frontend not fetching completion status

**Fix**: Hard refresh the dashboard (Ctrl+F5 or Cmd+Shift+R)

---

### Can't See Status Column in Admin Events Table

**Cause**: May need to restart dev server

**Fix**: 
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## 📊 Database Check Queries

### Check Completion Status of All Events

```sql
SELECT 
  title,
  event_date::date,
  event_date < NOW() as is_past,
  completed,
  completed_at,
  CASE 
    WHEN event_date >= NOW() THEN '🔵 Upcoming'
    WHEN NOT completed THEN '🟠 Needs Completion'
    ELSE '🟢 Completed'
  END as status
FROM events
ORDER BY event_date DESC
LIMIT 20;
```

### Check Student Certificate/Feedback Access

```sql
-- For a specific student
SELECT 
  e.title,
  e.event_date < NOW() as is_past,
  e.completed as event_completed,
  r.checked_in,
  CASE 
    WHEN NOT (e.event_date < NOW()) THEN '❌ Event not past yet'
    WHEN NOT e.completed THEN '❌ Admin has not marked complete'
    WHEN NOT r.checked_in THEN '❌ Not checked in'
    ELSE '✅ Certificate available'
  END as certificate_status,
  CASE 
    WHEN NOT (e.event_date < NOW()) THEN '❌ Event not past yet'
    WHEN NOT e.completed THEN '❌ Admin has not marked complete'
    ELSE '✅ Feedback available'
  END as feedback_status
FROM registrations r
JOIN events e ON e.id = r.event_id
WHERE r.user_id = auth.uid()
  AND r.status = 'confirmed'
ORDER BY e.event_date DESC;
```

---

## ✅ Success Indicators

When everything is working:

1. ✅ Admin events page has "Status" column
2. ✅ Past events show orange "Mark Complete" button
3. ✅ Clicking button shows dialog with event stats
4. ✅ Marking complete changes button to green "Completed"
5. ✅ Students see enabled Certificate/Feedback buttons
6. ✅ Clicking Certificate downloads PDF
7. ✅ Clicking Feedback opens dialog and submits successfully

---

## 🎉 Summary

This feature solves the ambiguity by giving admins explicit control over when an event is "done" and students can access post-event features.

**Before**: Past events automatically enable certificates/feedback (confusing if event just started)

**After**: Admin marks complete when event truly ends → clear signal to students

Run the SQL migration above and you're all set! 🚀
