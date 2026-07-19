# Event Completion Feature - Testing Guide

## ✅ Implementation Status

### Database
- ✅ SQL migration file exists: `supabase/add-event-completion.sql`
- ✅ Contains `completed` and `completed_at` columns
- ✅ Contains `mark_event_completed()` function
- ✅ Contains `reopen_event()` function

### Backend
- ✅ Actions file exists: `src/lib/actions/event-completion.ts`
- ✅ `markEventCompleted()` function implemented
- ✅ `reopenEvent()` function implemented
- ✅ Database types updated with completed fields

### Frontend
- ✅ Component exists: `src/components/admin/event-completion-button.tsx`
- ✅ Integrated in: `src/app/(main)/admin/events/page.tsx`
- ✅ Dashboard checks completed status: `src/app/(main)/dashboard/page.tsx`
- ✅ Registration card respects completion: `src/components/dashboard/registration-card.tsx`

---

## 🚀 Step 1: Run Database Migration

### Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in left sidebar
3. Click **New Query**

### Paste and Run This SQL

Copy the entire contents of `supabase/add-event-completion.sql` and click **Run**.

**Expected result:** `Event completion setup complete!`

### Verify Migration

Run this query:
```sql
-- Check columns exist
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'events'
  AND column_name IN ('completed', 'completed_at');

-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('mark_event_completed', 'reopen_event');
```

**Expected results:**
- 2 columns: `completed` (boolean), `completed_at` (timestamp with time zone)
- 2 functions: `mark_event_completed`, `reopen_event`

---

## 🧪 Step 2: Create Test Event

Run this SQL to create a past event for testing:

```sql
-- Create a test past event
INSERT INTO public.events (
  title, 
  description, 
  venue, 
  event_date, 
  registration_deadline,
  category, 
  total_seats, 
  seats_remaining,
  created_at,
  updated_at,
  completed,
  completed_at
)
VALUES (
  '[TEST] Past Event for Completion Testing',
  'This event happened yesterday and should show Mark Complete button',
  'Test Auditorium',
  NOW() - INTERVAL '1 day',   -- Yesterday
  NOW() - INTERVAL '2 days',  -- 2 days ago
  'academic',
  50,
  45,
  NOW(),
  NOW(),
  false,  -- Not completed yet
  NULL
)
RETURNING id, title, event_date, completed;
```

**Copy the `id` from the result** - you'll need it for testing.

### Register Yourself for This Event

Replace `YOUR_EVENT_ID_HERE` with the ID from above:

```sql
-- Get your user ID first
SELECT id, email FROM public.users WHERE email = 'your-email@example.com';

-- Then register (replace YOUR_USER_ID and YOUR_EVENT_ID)
INSERT INTO public.registrations (
  user_id,
  event_id,
  status,
  qr_code,
  checked_in
)
VALUES (
  'YOUR_USER_ID_HERE',
  'YOUR_EVENT_ID_HERE',
  'confirmed',
  'REG-TEST-' || UPPER(encode(gen_random_bytes(3), 'hex')),
  true  -- Mark as checked in
);
```

---

## 🎯 Step 3: Test Admin Flow

### Navigate to Admin Events Page

```bash
# Start dev server if not running
npm run dev
```

Go to: **http://localhost:3000/admin/events**

### Expected View

You should see your test event with:
- ✅ Title: `[TEST] Past Event for Completion Testing`
- ✅ Status column shows: **Orange "Mark Complete" button**
- ✅ Date shows yesterday
- ✅ Seats show `45 / 50`

### Test Mark Complete

1. **Click** the orange "Mark Complete" button
2. **Dialog appears** showing:
   - Event title and date
   - Registration count: `1 registered`
   - Check-in rate: `1/1 (100%)`
   - Blue notice explaining what will happen
3. **Click** the green "Mark Complete" button
4. **Success toast** appears: "Event marked as completed! Students can now access certificates and submit feedback."
5. **Button changes** to green "Completed" badge

### Test Reopen (Undo)

1. **Click** the green "Completed" button
2. **Dialog shows** completion timestamp
3. **Click** "Reopen Event" button
4. **Success toast** appears: "Event reopened..."
5. **Button changes** back to orange "Mark Complete"

---

## 👨‍🎓 Step 4: Test Student Flow

### Navigate to Dashboard

Go to: **http://localhost:3000/dashboard**

### Expected View (Before Completion)

1. Scroll to **"Past Events"** section
2. Find your test event
3. You should see:
   - ✅ Event card is visible
   - ❌ **Certificate button is DISABLED** (grayed out)
   - ❌ **Feedback button is DISABLED** (grayed out)
   - ℹ️ Tooltip says: "Available when admin marks event as complete"

### Mark Event Complete (as Admin)

1. Go back to: **http://localhost:3000/admin/events**
2. Click orange "Mark Complete" on test event
3. Confirm in dialog

### Check Dashboard Again

1. Go back to: **http://localhost:3000/dashboard**
2. **Refresh the page** (important!)
3. Find your test event in "Past Events"
4. You should now see:
   - ✅ **Certificate button is ENABLED** (blue, clickable)
   - ✅ **Feedback button is ENABLED** (blue, clickable)

### Test Certificate Download

1. **Click** the blue "Certificate" button
2. **PDF should download** with event details
3. File name: `certificate-test-past-event-for-completion-testing.pdf`

### Test Feedback Submission

1. **Click** the blue "Feedback" button
2. **Dialog appears** with star rating
3. **Click** 4 or 5 stars
4. **Type** a comment (optional)
5. **Click** "Submit Feedback"
6. **Success toast** appears: "Feedback submitted!"

---

## 🔍 Step 5: Verify Data

### Check Event Status in Database

```sql
SELECT 
  id,
  title,
  event_date::date,
  completed,
  completed_at,
  CASE 
    WHEN completed THEN '✅ Completed'
    ELSE '⏳ Not Completed'
  END as status
FROM public.events
WHERE title LIKE '%TEST%'
ORDER BY event_date DESC;
```

**Expected result:**
- `completed` = `true`
- `completed_at` = timestamp from when you clicked "Mark Complete"

### Check Student Access Logic

```sql
-- This query shows what each student can access
SELECT 
  u.email,
  e.title,
  e.event_date::date,
  r.checked_in,
  e.completed,
  -- Certificate logic
  CASE 
    WHEN e.event_date >= NOW() THEN '❌ Future event'
    WHEN NOT e.completed THEN '❌ Not marked complete'
    WHEN NOT r.checked_in THEN '❌ Not checked in'
    ELSE '✅ Can download'
  END as certificate_access,
  -- Feedback logic
  CASE 
    WHEN e.event_date >= NOW() THEN '❌ Future event'
    WHEN NOT e.completed THEN '❌ Not marked complete'
    ELSE '✅ Can submit'
  END as feedback_access
FROM public.registrations r
JOIN public.events e ON e.id = r.event_id
JOIN public.users u ON u.id = r.user_id
WHERE e.title LIKE '%TEST%'
  AND r.status = 'confirmed';
```

---

## ✅ Success Criteria

All of these should be true:

### Database Level
- [x] `completed` column exists on `events` table
- [x] `completed_at` column exists on `events` table
- [x] `mark_event_completed()` function exists
- [x] `reopen_event()` function exists
- [x] Functions return JSON with success status

### Admin Panel
- [x] Admin events page shows Status column
- [x] Future events show "Upcoming" badge
- [x] Past uncompleted events show orange "Mark Complete" button
- [x] Completed events show green "Completed" badge
- [x] Clicking button opens dialog with event stats
- [x] Marking complete shows success toast
- [x] Button updates to "Completed" after marking
- [x] Can reopen events (undo completion)

### Student Dashboard
- [x] Past events section shows all past registrations
- [x] Certificate button disabled when event not completed
- [x] Feedback button disabled when event not completed
- [x] Certificate button enabled after admin marks complete
- [x] Feedback button enabled after admin marks complete
- [x] Certificate downloads successfully
- [x] Feedback submits successfully

### Business Logic
- [x] Certificate requires: past event + completed + checked_in
- [x] Feedback requires: past event + completed
- [x] Completion can be undone by admin
- [x] Reopening disables student access again

---

## 🐛 Troubleshooting

### Issue: "Function does not exist"

**Symptom:** Error when clicking "Mark Complete"

**Fix:** Run the SQL migration again:
```sql
-- Make sure functions exist
DROP FUNCTION IF EXISTS mark_event_completed(UUID);
DROP FUNCTION IF EXISTS reopen_event(UUID);

-- Then run the entire add-event-completion.sql file
```

---

### Issue: Buttons Not Changing Color

**Symptom:** Click "Mark Complete" but button stays orange

**Fix:** Check browser console for errors, then:
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+F5` (Windows)
2. Restart dev server: `npm run dev`
3. Verify database was updated:
```sql
SELECT completed, completed_at FROM events WHERE title LIKE '%TEST%';
```

---

### Issue: Certificate/Feedback Still Disabled

**Symptom:** Admin marked complete but student can't access

**Fix:**
1. **Hard refresh** student dashboard
2. Check event is actually marked complete:
```sql
SELECT id, title, completed FROM events WHERE title LIKE '%TEST%';
```
3. Check registration query includes `completed`:
```sql
-- Run in Supabase SQL Editor
SELECT 
  e.completed,
  e.completed_at,
  r.checked_in
FROM registrations r
JOIN events e ON e.id = r.event_id
WHERE r.user_id = auth.uid()
  AND e.title LIKE '%TEST%';
```

---

### Issue: TypeScript Errors About `completed`

**Symptom:** `Property 'completed' does not exist on type 'Event'`

**Fix:** Types are already updated in `src/types/database.ts`. Restart TypeScript server:
- VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"

---

## 🎯 Edge Cases to Test

### Test 1: Event Not Past Yet
- Create event with `event_date = NOW() + INTERVAL '1 day'`
- Should show "Upcoming" badge, no "Mark Complete" button

### Test 2: Not Checked In
- Register for event but set `checked_in = false`
- Admin marks event complete
- Student should see:
  - ✅ Feedback button ENABLED
  - ❌ Certificate button DISABLED (tooltip: "Available after check-in")

### Test 3: Multiple Students
- Register 3 students for same event
- Check in only 2 of them
- Admin marks complete
- Verify:
  - 2 checked-in students can download certificates
  - All 3 students can submit feedback

---

## 📊 Analytics Opportunity

You could add completion stats to the admin analytics page:

```sql
-- Events completion rate
SELECT 
  COUNT(*) FILTER (WHERE event_date < NOW()) as past_events,
  COUNT(*) FILTER (WHERE event_date < NOW() AND completed) as completed_events,
  ROUND(
    COUNT(*) FILTER (WHERE event_date < NOW() AND completed) * 100.0 / 
    NULLIF(COUNT(*) FILTER (WHERE event_date < NOW()), 0)
  ) as completion_rate_percent
FROM events;
```

---

## ✨ Feature Complete!

Once all tests pass, the Event Completion feature is fully functional! 🎉

**What it does:**
- Gives admins explicit control over post-event access
- Prevents premature certificate downloads
- Ensures feedback is only collected after event truly ends
- Provides clear UI signals in both admin and student views
- Can be undone if admin marks complete too early

**Next steps:**
- Add this feature to onboarding/training docs
- Consider adding bulk completion (select multiple events)
- Consider auto-completion X hours after event_date
- Add email notifications when event marked complete
