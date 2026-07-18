# Quick Start Guide - New Features

## 🚀 Getting Started (2 steps)

### Step 1: Run SQL Migration
Open Supabase Dashboard → SQL Editor → Run this file:
```
supabase/create-feedback-table.sql
```
Click **"Run"** and wait for success message.

### Step 2: Restart Server
```bash
npm run dev
```

That's it! All features are now active. ✅

---

## 📱 Feature Locations

### For Students:

**Dashboard** (`/dashboard`):
- **Past Events Tab:**
  - 📥 Download Certificate button (if checked in)
  - 💬 Leave Feedback button
  - 🔄 Undo Cancel (5-second window)

**Events Page** (`/events`):
- 📤 Share button on each event card (top-left)

**Event Detail** (`/events/[id]`):
- ⭐ Average rating display (for past events with feedback)
- 📤 Share button (next to title)

### For Admins:

**Analytics Dashboard** (`/admin`):
- View average ratings per event (optional enhancement)

---

## 🎯 Quick Test Guide

### Test Certificate Download (30 seconds):
1. Register for an event
2. Set `checked_in = true` in Supabase (registrations table)
3. Go to Dashboard → Past Events
4. Click "Download Certificate"
5. ✅ PDF should download with your name and event details

### Test Feedback System (1 minute):
1. Go to Dashboard → Past Events
2. Click "Leave Feedback" on any event
3. Rate 1-5 stars + optional comment
4. Submit
5. Go to event detail page
6. ✅ Should see average rating displayed

### Test Undo Cancel (30 seconds):
1. Go to Dashboard → Upcoming Events
2. Click "Cancel" on a registration
3. ✅ Toast appears with "Undo" button
4. Click Undo within 5 seconds
5. ✅ Registration restored
6. Try again, let it expire
7. ✅ Registration actually cancelled after 5 seconds

### Test Share Feature (30 seconds):
1. Go to any event card or detail page
2. Click share icon
3. Click "Copy Link"
4. ✅ Paste to verify full URL copied
5. Click "Share on WhatsApp"
6. ✅ Opens WhatsApp with pre-filled message

---

## 🔧 Troubleshooting

### "Table 'feedback' does not exist"
→ Run `supabase/create-feedback-table.sql` in Supabase SQL Editor

### Certificate shows 403 error
→ Make sure the registration has `checked_in = true`

### Rating not displaying on event page
→ Event must be past (event_date < now) and have at least 1 feedback

### Undo button not showing
→ Make sure toast library (sonner) is working, check browser console

### Share button not copying
→ Requires HTTPS or localhost, check `navigator.clipboard` permissions

---

## 📊 Database Quick Reference

**Feedback Table:**
```sql
-- Check feedback entries
SELECT f.*, u.name as user_name, e.title as event_title
FROM feedback f
JOIN users u ON u.id = f.user_id
JOIN events e ON e.id = f.event_id
ORDER BY f.created_at DESC;

-- Check average rating for an event
SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
FROM feedback
WHERE event_id = 'your-event-id';
```

**Registrations:**
```sql
-- Mark registration as checked in (for certificate testing)
UPDATE registrations
SET checked_in = true
WHERE id = 'your-registration-id';
```

---

## 💡 Pro Tips

1. **Certificates:** Only visible on past events with checked_in status
2. **Feedback:** Can be edited - clicking "Leave Feedback" again updates existing
3. **Undo Cancel:** Uses setTimeout, persists even if user navigates away
4. **Share:** WhatsApp option great for campus viral growth
5. **Ratings:** Average calculated server-side, cached on event page

---

## 🎨 Customization Options

**Certificate Design:** Edit `src/lib/pdf/certificate.tsx`
- Change colors, fonts, layout
- Add signatures or logos
- Modify border styles

**Feedback Stars:** Edit `src/components/feedback/feedback-dialog.tsx`
- Change star icons
- Adjust hover effects
- Modify comment character limit

**Undo Timeout:** Edit `src/components/dashboard/registration-card.tsx`
- Change from 5000ms to any duration
- Modify toast message
- Adjust loading states

**Share Options:** Edit `src/components/events/share-button.tsx`
- Add more share platforms
- Customize WhatsApp message
- Change button styling

---

## 📈 Next Steps (Optional Enhancements)

1. **Email Certificates:** Send PDF via email after check-in
2. **Feedback Moderation:** Admin panel to hide inappropriate comments
3. **Share Analytics:** Track which events get shared most
4. **Certificate Templates:** Different designs per event category
5. **Bulk Download:** Admin can download all certificates for an event

---

## 🎉 Success Metrics

Your project now has:
- ✅ Professional certificate system
- ✅ Data-driven feedback mechanism
- ✅ Modern UX with undo pattern
- ✅ Viral growth via sharing

Perfect for your internship evaluation! 🚀
