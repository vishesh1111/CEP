# 🔍 Where to Find the 3 Features

## ✅ ALL FEATURES ARE FULLY IMPLEMENTED

All three features (Waitlist, Certificates, Feedback) are **already built and integrated** into your application. Here's exactly where to find them:

---

## 1️⃣ WAITLIST SYSTEM

### Where to See It:

#### A. On Event Detail Page (`/events/[id]`)

**When event is FULL (seats_remaining = 0):**

1. Navigate to any event page
2. Look at the right sidebar under "Event Details"
3. You'll see:
   - ✅ "Event Full" status
   - ✅ "X people on waitlist" message (if anyone joined)
   - ✅ **"Join Waitlist"** button (orange/amber color)

**After joining waitlist:**
- Button changes to "On Waitlist (#1)" showing your position
- "Leave Waitlist" button appears below

#### B. Visual Indicators:
```
┌─────────────────────────────────┐
│  Availability                   │
│  Event Full                     │
│  [██████████████████] 100%      │  ← Red progress bar
│  5 people on waitlist           │  ← Amber text
│                                 │
│  [Join Waitlist] ← Orange btn   │
└─────────────────────────────────┘
```

### How to Test:

**Option 1: Using SQL (Quick)**
```sql
-- Make any event full
UPDATE events 
SET seats_remaining = 0 
WHERE id = 'YOUR_EVENT_ID';
```

**Option 2: Natural Flow**
1. Create event with only 1 seat
2. Register as User 1 → Event becomes full
3. Login as User 2 → See "Join Waitlist" button

### What Happens:
1. **Join Waitlist** → You're added to queue with position
2. **Someone Cancels** → First person in waitlist gets auto-registered
3. **Email Sent** → Promoted user receives notification
4. **Seat Management** → Atomic, no race conditions

### Files Involved:
- ✅ `src/components/events/register-button.tsx` - Waitlist UI
- ✅ `src/lib/actions/waitlist.ts` - Server actions
- ✅ `supabase/create-waitlist-table.sql` - Database schema
- ✅ `src/app/(main)/events/[id]/page.tsx` - Integration

---

## 2️⃣ CERTIFICATE DOWNLOAD (PDF)

### Where to See It:

#### On Dashboard → Past Events Tab (`/dashboard`)

**Requirements to see certificate button:**
- Event must be in the past (event_date < today)
- You must have `checked_in = true` for that event

**Location:**
1. Go to Dashboard (`/dashboard`)
2. Click "Past Events" tab
3. Find any event where you're checked in
4. Look at the RIGHT side of the card
5. You'll see **"Certificate"** button with download icon

#### Visual:
```
┌──────────────────────────────────────────────────────┐
│  📅 Past Event Name                    [Checked In]  │
│  Registered on Jan 15, 2025                          │
│                                                       │
│  📅 Jan 10, 2025                                     │
│  📍 Main Auditorium                     ┌──────────┐ │
│                                         │ 📥 Cert  │ │ ← HERE
│                                         │ 💬 Feed  │ │
│                                         └──────────┘ │
└──────────────────────────────────────────────────────┘
```

**If NOT checked in:**
- Button appears DISABLED (grayed out)
- Tooltip: "Available after event check-in"

### How to Test:

**Quick Setup:**
```sql
-- Step 1: Mark registration as checked in
UPDATE registrations 
SET checked_in = true 
WHERE user_id = 'YOUR_USER_ID' 
  AND event_id = 'PAST_EVENT_ID';

-- Step 2: Ensure event is in the past
UPDATE events 
SET event_date = '2025-01-10'  -- Past date
WHERE id = 'PAST_EVENT_ID';
```

**Then:**
1. Refresh dashboard
2. Go to "Past Events" tab
3. Click "Certificate" button
4. PDF downloads automatically with your name + event details

### What You Get:
- Professional PDF certificate
- Your name
- Event title and date
- "Certificate of Participation" heading
- Bordered, elegant design
- Filename: `certificate-event-name.pdf`

### Files Involved:
- ✅ `src/lib/pdf/certificate.tsx` - PDF layout
- ✅ `src/app/api/certificate/[registrationId]/route.ts` - PDF generation API
- ✅ `src/components/dashboard/registration-card.tsx` - Download button

---

## 3️⃣ FEEDBACK & RATINGS

### Where to See It:

#### A. Submit Feedback - Dashboard → Past Events (`/dashboard`)

**Location:**
1. Go to Dashboard
2. Click "Past Events" tab
3. Find ANY past event (doesn't require check-in)
4. Look at RIGHT side of card
5. Click **"Feedback"** button with message icon

#### Visual:
```
┌──────────────────────────────────────────────────────┐
│  📅 Past Event Name                                   │
│  Registered on Jan 15, 2025                          │
│                                                       │
│  📅 Jan 10, 2025                                     │
│  📍 Main Auditorium                     ┌──────────┐ │
│                                         │ 📥 Cert  │ │
│                                         │ 💬 Feed  │ │ ← HERE
│                                         └──────────┘ │
└──────────────────────────────────────────────────────┘
```

**What Opens:**
- Dialog with 5 stars (clickable/hoverable)
- Optional comment textarea (500 char max)
- Character counter
- Submit button

**Features:**
- ★★★★★ Interactive star rating
- Stars fill on hover (preview)
- Click to select rating
- Can edit existing feedback (shows previous rating)

#### B. View Average Rating - Event Detail Page (`/events/[id]`)

**Location:**
1. Go to any PAST event detail page
2. Look below the event title
3. You'll see: **"4.3 ★ · 12 reviews"**

#### Visual:
```
┌─────────────────────────────────────────┐
│  [Back to Events]                       │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   [Event Banner Image]          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Annual Music Fest            [Share]  │
│  4.3 ★ · 12 reviews  ← HERE             │
│                                         │
│  This is an amazing festival for...    │
└─────────────────────────────────────────┘
```

**Only shows when:**
- Event is in the past
- At least 1 person has submitted feedback

### How to Test:

**Option 1: Submit your own feedback**
1. Register for any event
2. Change event date to past:
   ```sql
   UPDATE events SET event_date = '2025-01-10' WHERE id = 'EVENT_ID';
   ```
3. Go to Dashboard → Past Events
4. Click "Feedback" button
5. Rate 5 stars, add comment
6. Submit
7. Go to event detail page
8. See "5.0 ★ · 1 review"

**Option 2: Test with multiple users**
1. Login as User 1, submit 5-star rating
2. Login as User 2, submit 3-star rating  
3. Check event page: Shows "4.0 ★ · 2 reviews"

### Files Involved:
- ✅ `src/components/feedback/feedback-dialog.tsx` - Star rating UI
- ✅ `src/lib/actions/feedback.ts` - Submit/fetch actions
- ✅ `supabase/create-feedback-table.sql` - Database schema
- ✅ `src/components/dashboard/registration-card.tsx` - Feedback button
- ✅ `src/app/(main)/events/[id]/page.tsx` - Average display

---

## 🎯 QUICK TESTING CHECKLIST

### Test Feature 1: Waitlist
- [ ] Make event full: `UPDATE events SET seats_remaining = 0 WHERE id = '...'`
- [ ] Visit event page
- [ ] See "Join Waitlist" button (orange/amber)
- [ ] Click to join
- [ ] See position: "On Waitlist (#1)"
- [ ] Login as another user, cancel their registration
- [ ] Check if first waitlist user got promoted

### Test Feature 2: Certificate
- [ ] Mark past registration as checked in:
  ```sql
  UPDATE registrations SET checked_in = true 
  WHERE user_id = '...' AND event_id = '...';
  ```
- [ ] Go to Dashboard → Past Events
- [ ] See "Certificate" button (enabled)
- [ ] Click to download
- [ ] PDF opens with your name and event details

### Test Feature 3: Feedback
- [ ] Make event past: `UPDATE events SET event_date = '2025-01-10' WHERE id = '...'`
- [ ] Go to Dashboard → Past Events
- [ ] Click "Feedback" button
- [ ] Rate with stars (e.g., 4 stars)
- [ ] Add comment (optional)
- [ ] Submit
- [ ] Go to event detail page
- [ ] See "4.0 ★ · 1 review" below title

---

## 🚨 IMPORTANT: SQL MIGRATIONS REQUIRED

Before testing, you MUST run these SQL migrations in Supabase:

### Step 1: Waitlist Table
```sql
-- Copy entire content of this file:
supabase/create-waitlist-table.sql

-- Paste and run in Supabase SQL Editor
```

### Step 2: Feedback Table
```sql
-- Copy entire content of this file:
supabase/create-feedback-table.sql

-- Paste and run in Supabase SQL Editor
```

### Step 3: Restart Dev Server
```bash
npm run dev
```

**Why?** The tables need to exist in your database before the features will work.

---

## 📸 VISUAL GUIDE - Screenshots

### 1. Waitlist Button Location
```
Event Detail Page → Right Sidebar → Register/Waitlist Section
[Event Full] → [Join Waitlist Button]
```

### 2. Certificate Button Location
```
Dashboard → Past Events Tab → Event Card → Right Side Actions
[Certificate Button] ← Top button
[Feedback Button] ← Bottom button
```

### 3. Feedback Dialog Location
```
Dashboard → Past Events Tab → Event Card → Right Side Actions
Click [Feedback Button] → Dialog Opens with Stars
```

### 4. Average Rating Location
```
Event Detail Page → Below Title → Yellow Star Icon
"4.3 ★ · 12 reviews"
```

---

## 🎨 COLOR CODES TO SPOT FEATURES

**Waitlist:**
- 🟠 Orange/Amber button: "Join Waitlist"
- 🟠 Amber text: "X people on waitlist"
- 🟠 Amber badge when on waitlist: "On Waitlist (#1)"

**Certificate:**
- 📥 Download icon with "Certificate" text
- ⚪ Outline button style (enabled)
- ⚫ Grayed out if not checked in

**Feedback:**
- 💬 Message icon with "Feedback" text
- ⚪ Outline button style
- ⭐ Yellow star icon in dialog and on event page

---

## ❌ TROUBLESHOOTING "I CAN'T SEE IT"

### "I don't see Join Waitlist button"
**Fix:**
1. Make sure event has `seats_remaining = 0`
2. Make sure you're NOT already registered
3. Make sure registration deadline hasn't passed
4. Run waitlist SQL migration

### "I don't see Certificate button"
**Fix:**
1. Event must be PAST (event_date < today)
2. Registration must have `checked_in = true`
3. You must be on "Past Events" tab, not "Upcoming"

### "I don't see Feedback button"
**Fix:**
1. Event must be PAST (event_date < today)
2. You must have a registration for that event
3. You must be on "Past Events" tab
4. Run feedback SQL migration

### "Average rating not showing"
**Fix:**
1. Event must be PAST
2. At least 1 person must have submitted feedback
3. Refresh the page

---

## 🎉 SUMMARY

All three features are **100% implemented** and ready to use:

1. **Waitlist** → Event detail page, when event is full
2. **Certificate** → Dashboard → Past Events (if checked in)
3. **Feedback** → Dashboard → Past Events (feedback button) + Event detail (average rating)

**Just need to:**
1. ✅ Run the 2 SQL migrations
2. ✅ Restart dev server
3. ✅ Look in the right places (see guide above)

You got this! 🚀
