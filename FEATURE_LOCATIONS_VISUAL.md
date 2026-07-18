# 📍 Visual Feature Locations Guide

## Quick Reference: Where Are My Features?

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAMPUSEVENTS APPLICATION                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FEATURE 1: WAITLIST SYSTEM                                     │
├─────────────────────────────────────────────────────────────────┤
│  Location: /events/[id] (Event Detail Page)                     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Event Title                            [Share Button]     │ │
│  │                                                            │ │
│  │  Event Details ─────────────────────────────┐             │ │
│  │  📅 Date: Jan 20, 2025                      │             │ │
│  │  🕒 Deadline: Jan 19, 2025                  │             │ │
│  │  📍 Venue: Main Hall                        │             │ │
│  │  👥 Availability:                           │             │ │
│  │     Event Full                              │             │ │
│  │     [████████████████████] 100%             │  ← Red bar  │ │
│  │     5 people on waitlist  ← Amber text      │             │ │
│  │                                             │             │ │
│  │  ┌─────────────────────────────────────┐   │             │ │
│  │  │  🕒 Join Waitlist                   │   │  ← Orange   │ │
│  │  └─────────────────────────────────────┘   │     button  │ │
│  └────────────────────────────────────────────┘             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  After Joining:                                                 │
│  ┌─────────────────────────────────────────┐                   │
│  │  On Waitlist (#1)  ← Shows position     │                   │
│  └─────────────────────────────────────────┘                   │
│  ┌─────────────────────────────────────────┐                   │
│  │  ❌ Leave Waitlist                      │                   │
│  └─────────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FEATURE 2: CERTIFICATE DOWNLOAD                                │
├─────────────────────────────────────────────────────────────────┤
│  Location: /dashboard → Past Events Tab                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Dashboard                                                 │ │
│  │  ┌──────────────┬──────────────┐                          │ │
│  │  │ Upcoming (3) │ Past (5) ← Click here                   │ │
│  │  └──────────────┴──────────────┘                          │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ [Event Banner Image]                                 │ │ │
│  │  ├──────────────────────────────────────────────────────┤ │ │
│  │  │ Annual Music Fest            [Checked In] ← Badge    │ │ │
│  │  │ Registered on: Jan 5, 2025                           │ │ │
│  │  │                                                      │ │ │
│  │  │ 📅 Jan 10, 2025                    ┌───────────────┐│ │ │
│  │  │ 📍 Main Auditorium                 │ 📥 Certificate││ │ │
│  │  │                                    │               ││ │ │
│  │  │                                    │ 💬 Feedback   ││ │ │
│  │  │                                    └───────────────┘│ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                  ↑                            ↑            │ │
│  │            Event must be past      Click to download PDF  │ │
│  │            + checked_in = true                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  What You Get:                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    CAMPUSEVENTS                            │ │
│  │                                                            │ │
│  │          Certificate of Participation                     │ │
│  │                                                            │ │
│  │              This certifies that                          │ │
│  │                 [Your Name]                               │ │
│  │     has successfully participated in                      │ │
│  │            [Event Title]                                  │ │
│  │           held on [Event Date]                            │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FEATURE 3: FEEDBACK & RATINGS                                  │
├─────────────────────────────────────────────────────────────────┤
│  Part A: Submit Feedback                                        │
│  Location: /dashboard → Past Events Tab                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Dashboard → Past Events                                   │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Past Event Name                                      │ │ │
│  │  │                                                      │ │ │
│  │  │ 📅 Jan 10, 2025                    ┌───────────────┐│ │ │
│  │  │ 📍 Main Hall                       │ 📥 Certificate││ │ │
│  │  │                                    │               ││ │ │
│  │  │                                    │ 💬 Feedback   ││ │ │
│  │  │                                    └───────────────┘│ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                               ↑            │ │
│  │                                      Click to open dialog  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Feedback Dialog Opens:                                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Leave Feedback                                   [✕]      │ │
│  │  ────────────────────────────────────────────────────────  │ │
│  │                                                            │ │
│  │  How was Annual Music Fest?                               │ │
│  │                                                            │ │
│  │  Rating:                                                  │ │
│  │  ☆ ☆ ☆ ☆ ☆  ← Click stars to rate                       │ │
│  │  (Hover to preview, click to select)                     │ │
│  │                                                            │ │
│  │  Comments (optional):                                     │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │ Great event! Learned so much...                    │  │ │
│  │  │                                                    │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │  23/500 characters                                        │ │
│  │                                                            │ │
│  │  [Cancel]                      [Submit Feedback]          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Part B: View Average Rating                                    │
│  Location: /events/[id] (Event Detail Page)                     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  [← Back to Events]                                        │ │
│  │                                                            │ │
│  │  ┌────────────────────────────────────────────────────┐   │ │
│  │  │ [Event Banner Image]                               │   │ │
│  │  └────────────────────────────────────────────────────┘   │ │
│  │                                                            │ │
│  │  Annual Music Fest                         [Share 📤]     │ │
│  │  ⭐ 4.3 ★ · 12 reviews  ← Yellow star + average          │ │
│  │     ↑                                                      │ │
│  │  Only shows for past events with feedback                 │ │
│  │                                                            │ │
│  │  This was an amazing festival bringing together...        │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  BONUS FEATURE: UNDO CANCEL (Already Built In!)                │
├─────────────────────────────────────────────────────────────────┤
│  Location: /dashboard → Upcoming Events Tab                     │
│                                                                  │
│  When you click "Cancel Registration":                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ⚠️  Registration will be cancelled in 5 seconds...        │ │
│  │                                              [Undo]         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                ↑                        ↑        │
│                          Toast appears        Click to restore  │
│                                                                  │
│  - Optimistic UI (button shows "Cancelling...")                │
│  - 5-second countdown                                           │
│  - Click "Undo" to restore registration                        │
│  - If timer expires → actual cancellation happens              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  BONUS FEATURE: SHARE BUTTON (Already Built In!)               │
├─────────────────────────────────────────────────────────────────┤
│  Location 1: Event Cards (/events)                              │
│  Location 2: Event Detail Page (/events/[id])                   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  [Share 📤] ← Click here                                   │ │
│  │     ↓                                                       │ │
│  │  ┌──────────────────────┐                                  │ │
│  │  │ 📋 Copy Link         │                                  │ │
│  │  │ 💬 Share on WhatsApp │                                  │ │
│  │  └──────────────────────┘                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Navigation Map

```
Homepage (/)
  └─→ Events (/events)
        ├─→ Event Detail (/events/[id])
        │     ├─→ 🟠 WAITLIST BUTTON (when full)
        │     ├─→ ⭐ AVERAGE RATING (past events with feedback)
        │     └─→ 📤 SHARE BUTTON (top right)
        │
        └─→ Dashboard (/dashboard)
              ├─→ Upcoming Events Tab
              │     ├─→ 🔄 UNDO CANCEL (5-second window)
              │     └─→ QR Code + Cancel buttons
              │
              └─→ Past Events Tab
                    ├─→ 📥 CERTIFICATE BUTTON (if checked in)
                    ├─→ 💬 FEEDBACK BUTTON (all past events)
                    └─→ Event cards with banner images
```

---

## 🚀 Before Testing: Required Setup

### 1. Run SQL Migrations (MUST DO FIRST!)

**In Supabase Dashboard → SQL Editor:**

```sql
-- Migration 1: Waitlist Table
-- Copy entire file: supabase/create-waitlist-table.sql
-- Paste and click RUN

-- Migration 2: Feedback Table
-- Copy entire file: supabase/create-feedback-table.sql
-- Paste and click RUN
```

### 2. Restart Server

```bash
npm run dev
```

### 3. Test Data Setup (Optional but Helpful)

```sql
-- Make an event full (for waitlist testing)
UPDATE events SET seats_remaining = 0 WHERE id = 'EVENT_ID';

-- Make an event past (for certificate/feedback testing)
UPDATE events SET event_date = '2025-01-10' WHERE id = 'EVENT_ID';

-- Mark yourself as checked in (for certificate testing)
UPDATE registrations 
SET checked_in = true 
WHERE user_id = 'YOUR_USER_ID' AND event_id = 'EVENT_ID';
```

---

## 🎨 Visual Indicators

| Feature | Color/Icon | Where to Look |
|---------|-----------|---------------|
| **Waitlist** | 🟠 Orange button | Event detail page, right sidebar |
| **Certificate** | 📥 Download icon | Dashboard → Past Events → Right side |
| **Feedback** | 💬 Message icon | Dashboard → Past Events → Right side |
| **Rating** | ⭐ Yellow star | Event detail page, below title |
| **Share** | 📤 Share icon | Event cards + Event detail |
| **Undo** | 🔄 Toast notification | Appears after clicking cancel |

---

## ✅ Feature Checklist

- [ ] **Waitlist Table**: SQL migration run in Supabase
- [ ] **Feedback Table**: SQL migration run in Supabase
- [ ] **Dev Server**: Restarted with `npm run dev`
- [ ] **Full Event**: Made event full for waitlist testing
- [ ] **Past Event**: Made event past for certificate/feedback testing
- [ ] **Checked In**: Marked registration as checked in for certificate
- [ ] **Test All Features**: Clicked all buttons, verified they work

---

## 🎉 You're All Set!

Everything is implemented and ready to go. Just:
1. ✅ Run the 2 SQL migrations
2. ✅ Restart server
3. ✅ Navigate to the locations shown above
4. ✅ Test each feature

Good luck with your evaluation! 🚀
