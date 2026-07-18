# Certificate & Feedback Feature Guide

## 🎓 Certificate Download Feature

### Where to Find It
**Location**: Dashboard → My Events Tab → Past Events Section → Right side of event card

```
http://localhost:3000/dashboard
└── My Events Tab
    └── Past Events (scroll down)
        └── [Your Event Card]
            └── Right Sidebar:
                ├── [Certificate] ← Click here to download
                └── [Feedback]
```

### Requirements for Certificate Button to Appear

All three conditions must be met:

1. ✅ **Event must be PAST** - `event_date < NOW()`
2. ✅ **You must be CHECKED IN** - `checked_in = true`
3. ✅ **Registration must be CONFIRMED** - `status = 'confirmed'`

### Certificate Button States

| Condition | Button State | Appearance |
|-----------|-------------|------------|
| ✅ All requirements met | **Enabled** | Blue outline, clickable |
| ❌ Not checked in | **Disabled** | Grayed out, tooltip: "Available after event check-in" |
| ❌ Event is future | **Hidden** | Won't appear until event is past |

---

## 💬 Feedback Feature

### Where to Find It
**Same location as Certificate**: Dashboard → Past Events → Right side of card

### Requirements

Only **ONE** condition:
1. ✅ **Event must be PAST** - `event_date < NOW()`

**Note**: Unlike certificates, feedback does **NOT** require check-in! You can give feedback even if you didn't attend.

### Feedback Button States

| Condition | Button Text | Behavior |
|-----------|------------|----------|
| No feedback submitted yet | **"Feedback"** | Opens dialog to submit rating |
| Already submitted | **"Feedback"** (same) | Opens dialog showing your existing rating (can edit) |

---

## 🕐 When Does an Event Become "Past"?

### Technical Definition

An event becomes "past" when:
```sql
event_date < NOW()
```

### Real-World Examples

**If event_date is**: `2025-01-15 18:00:00` (6:00 PM on Jan 15, 2025)

| Current Time | Is Past? | Certificate/Feedback Available? |
|--------------|----------|--------------------------------|
| Jan 15, 2025 5:59 PM | ❌ No | ❌ Not yet - still "Upcoming" |
| Jan 15, 2025 6:00 PM | ❌ No | ❌ Not yet - exact time |
| Jan 15, 2025 6:01 PM | ✅ Yes | ✅ Yes - now shows in "Past Events" |
| Jan 16, 2025 12:00 AM | ✅ Yes | ✅ Yes |
| Any time after | ✅ Yes | ✅ Yes |

### Key Points

1. **Instant transition**: Event moves from "Upcoming" to "Past Events" the moment `event_date` time passes
2. **Time-sensitive**: Includes both date AND time (timestamp)
3. **Server time**: Uses your database server's time (NOW())
4. **No grace period**: Not "end of event", just when event_date timestamp passes

---

## 📅 Event Timeline Visual

```
Event Registration → Event Happens → Event Ends
     |                    |              |
     |                    |              |
     v                    v              v
[Upcoming Events]    [Happening]   [Past Events]
- Register           - QR Check-in  - Certificate ✅
- View QR            - Can't cancel - Feedback ✅
- Cancel             - Show QR      - View only
```

---

## 🧪 Testing Guide

### Step 1: Create a Test Event & Registration

```sql
-- Run this in Supabase SQL Editor
WITH new_event AS (
  INSERT INTO events (
    title, 
    description, 
    venue, 
    event_date,  -- Set to 1 minute ago
    registration_deadline, 
    category, 
    total_seats, 
    seats_remaining
  )
  VALUES (
    '[TEST] Certificate & Feedback Demo',
    'Test event to try certificate and feedback features',
    'Demo Hall',
    NOW() - INTERVAL '1 minute',  -- Already past!
    NOW() - INTERVAL '1 hour',
    'general',
    50,
    49
  )
  RETURNING id, title, event_date
)
INSERT INTO registrations (user_id, event_id, status, checked_in, qr_code)
SELECT 
  auth.uid(),
  new_event.id,
  'confirmed',
  true,  -- Already checked in
  'REG-DEMO-' || UPPER(encode(gen_random_bytes(3), 'hex'))
FROM new_event
RETURNING 
  id,
  qr_code,
  'Event created and you are checked in!' as message;
```

### Step 2: Verify Setup

```sql
-- Check everything is ready
SELECT 
  e.title,
  e.event_date,
  e.event_date < NOW() as is_past,
  r.checked_in,
  r.qr_code,
  CASE 
    WHEN NOT (e.event_date < NOW()) THEN '❌ Event not past yet'
    WHEN NOT r.checked_in THEN '❌ Not checked in'
    ELSE '✅ Certificate & Feedback ready!'
  END as status
FROM registrations r
JOIN events e ON e.id = r.event_id
WHERE r.user_id = auth.uid()
  AND e.title LIKE '%Certificate & Feedback Demo%';
```

### Step 3: Test in Browser

1. **Refresh Dashboard**: `http://localhost:3000/dashboard`
2. **Scroll to "Past Events"** section
3. **Find**: "[TEST] Certificate & Feedback Demo"
4. **Test Certificate**:
   - Click "Certificate" button
   - PDF should download immediately
   - Open PDF and verify your name appears
5. **Test Feedback**:
   - Click "Feedback" button
   - Rate with 5 stars
   - Add comment: "Testing feedback feature"
   - Click "Submit Feedback"
   - Success toast should appear
   - Click "Feedback" again - your rating should be saved

---

## 🔄 Making an Event Past (Manual)

### If you have an existing future event:

```sql
-- Option 1: Make it 1 day past
UPDATE events 
SET event_date = NOW() - INTERVAL '1 day'
WHERE id = 'your-event-id';

-- Option 2: Make it JUST past (1 minute ago)
UPDATE events 
SET event_date = NOW() - INTERVAL '1 minute'
WHERE id = 'your-event-id';

-- Option 3: Set specific past date
UPDATE events 
SET event_date = '2025-01-10 18:00:00'
WHERE id = 'your-event-id';
```

### For a specific registration (using QR code):

```sql
-- Make the event past for registration: 5C0CEE0EE7BA1C8B8CAD2DDD
UPDATE events 
SET event_date = NOW() - INTERVAL '1 day'
WHERE id = (
  SELECT event_id 
  FROM registrations 
  WHERE qr_code = '5C0CEE0EE7BA1C8B8CAD2DDD'
);
```

---

## ⏰ Automatic Event Transition

Events automatically transition from "Upcoming" to "Past" based on real-time checks:

### How It Works

1. **Page Load**: When you visit dashboard, app checks `event_date < NOW()` for each registration
2. **Filtering**: Events are split into two arrays:
   ```typescript
   upcomingRegistrations = events where event_date >= NOW()
   pastRegistrations = events where event_date < NOW()
   ```
3. **Display**: Past events show in separate section with Certificate/Feedback buttons

### What This Means

- **No manual action needed** - events move automatically
- **Refresh to see changes** - if event just passed, refresh page
- **Real-time accurate** - always uses current server time
- **No scheduled jobs** - happens on every page load

---

## 🐛 Troubleshooting

### Certificate Button Not Showing

```sql
-- Debug: Why isn't certificate showing?
SELECT 
  e.title,
  e.event_date,
  r.checked_in,
  r.status,
  NOW() as current_time,
  e.event_date < NOW() as is_past,
  CASE 
    WHEN r.status != 'confirmed' THEN '❌ Registration not confirmed'
    WHEN NOT r.checked_in THEN '❌ Not checked in (run: UPDATE registrations SET checked_in = true WHERE id = ''' || r.id || ''')'
    WHEN e.event_date >= NOW() THEN '❌ Event still in future (run: UPDATE events SET event_date = NOW() - INTERVAL ''1 day'' WHERE id = ''' || e.id || ''')'
    ELSE '✅ Should work! Try refreshing dashboard'
  END as diagnosis
FROM registrations r
JOIN events e ON e.id = r.event_id
WHERE r.user_id = auth.uid()
ORDER BY e.event_date DESC;
```

### Feedback Button Not Showing

```sql
-- Debug: Why isn't feedback showing?
SELECT 
  e.title,
  e.event_date,
  NOW() as current_time,
  e.event_date < NOW() as is_past,
  CASE 
    WHEN e.event_date >= NOW() THEN '❌ Event still in future (run: UPDATE events SET event_date = NOW() - INTERVAL ''1 day'' WHERE id = ''' || e.id || ''')'
    ELSE '✅ Should work! Try refreshing dashboard'
  END as diagnosis
FROM registrations r
JOIN events e ON e.id = r.event_id
WHERE r.user_id = auth.uid()
ORDER BY e.event_date DESC;
```

### Event Still Showing as Upcoming

**Cause**: Browser cache or need to refresh

**Solution**:
1. Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
2. Or just refresh: `F5` or click refresh button
3. Check database: Run the debug queries above

---

## 📋 Quick Reference

### Certificate Requirements Checklist

- [ ] Event date is in the past (`event_date < NOW()`)
- [ ] Registration status is 'confirmed'
- [ ] You are checked in (`checked_in = true`)
- [ ] You're logged in as the user who registered
- [ ] You're on the Dashboard page (/dashboard)
- [ ] You're looking in "Past Events" section (scroll down)

### Feedback Requirements Checklist

- [ ] Event date is in the past (`event_date < NOW()`)
- [ ] You're logged in
- [ ] You're on the Dashboard page (/dashboard)
- [ ] You're looking in "Past Events" section (scroll down)

### Quick Test Commands

```sql
-- Make ALL your events past (for testing)
UPDATE events 
SET event_date = NOW() - INTERVAL '1 day'
WHERE created_by = auth.uid();

-- Check in ALL your registrations (for testing)
UPDATE registrations 
SET checked_in = true 
WHERE user_id = auth.uid();

-- Create complete test scenario (copy-paste ready)
WITH new_event AS (
  INSERT INTO events (title, description, venue, event_date, registration_deadline, category, total_seats, seats_remaining)
  VALUES ('[TEST] Full Feature Test', 'Test both certificate and feedback', 'Test Venue', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days', 'general', 100, 99)
  RETURNING id
)
INSERT INTO registrations (user_id, event_id, status, checked_in, qr_code)
SELECT auth.uid(), id, 'confirmed', true, 'REG-' || UPPER(encode(gen_random_bytes(3), 'hex'))
FROM new_event;
```

---

## ✅ Success Indicators

When everything is working correctly, you should see:

1. **Past Events section appears** on dashboard (below Upcoming Events)
2. **Certificate button is blue/enabled** (not grayed out)
3. **Clicking Certificate** downloads a PDF file immediately
4. **PDF opens** and shows your name, event details, professional design
5. **Feedback button** opens a dialog with 5 stars
6. **Submitting feedback** shows success toast
7. **Re-opening feedback** shows your saved rating

If all of this works, features are fully functional! 🎉
