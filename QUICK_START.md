# Quick Start Guide - Event Listing & Dashboard

## 🚀 Get Started in 3 Steps

### Step 1: Seed Test Data
```bash
cd /Users/visheshverma/Documents/EUPAY/campus-events
node scripts/seed-test-events.js
```

**Expected Output**:
```
🌱 Seeding test events...
✅ Successfully inserted 6 test events!
✨ Seeding complete! Visit /events to see the test events.
```

---

### Step 2: Start Development Server
```bash
npm run dev
```

**Opens at**: http://localhost:3000 (or 3001 if 3000 is in use)

---

### Step 3: Test the Features

#### ✅ Test Event Listing
1. Navigate to http://localhost:3000/events
2. **Verify**:
   - [ ] 6 test events appear
   - [ ] "Music Fest" shows **red** progress bar (2/150 seats = 98.7% filled)
   - [ ] "Career Fair" shows **red** progress bar (0/200 seats = full)
   - [ ] "Tech Talk" shows **green** progress bar (87/100 seats = 13% filled)
   - [ ] Progress bars are visible below seat counts
   - [ ] If you have 10+ events, pagination appears

#### ✅ Test Event Detail
1. Click on "Annual Music Fest 2026"
2. **Verify**:
   - [ ] Progress bar shows in availability section (red, ~99% filled)
   - [ ] "Filling Fast" badge appears
   - [ ] Register button is enabled (if logged in)

#### ✅ Test Registration Flow
1. **Sign Up / Log In** (if not already)
   - Go to http://localhost:3000/register
   - Create test account or log in
   
2. **Register for Tech Talk**
   - Go to `/events`, click "Tech Talk: Future of AI"
   - Click "Register" button
   - **Verify**: Toast notification appears ("Registration successful")
   - **Verify**: Page shows "You are registered" + QR code

3. **Check Dashboard**
   - Go to http://localhost:3000/dashboard
   - **Verify**: Tech Talk appears in "Upcoming Events"
   - **Verify**: Event banner image displays (if event has one)
   - **Verify**: QR Code button is present
   - Click QR Code → **Verify**: Modal opens with scannable QR

4. **Cancel Registration**
   - In dashboard, click "Cancel" on Tech Talk
   - Confirm in dialog
   - **Verify**: Toast appears ("Registration cancelled")
   - **Verify**: Event disappears from dashboard
   - Go back to `/events`
   - **Verify**: Seat count increased (88/100 instead of 87/100)

#### ✅ Test Pagination
1. Go to `/events`
2. If you have more than 9 events:
   - **Verify**: Pagination controls appear at bottom
   - Click "Next" or page number
   - **Verify**: URL changes to `/events?page=2`
   - **Verify**: Different events show
   - **Verify**: "Showing X-Y of Z events" counter updates

#### ✅ Test Filters
1. In `/events`, type in search box (e.g., "Tech")
   - **Verify**: Only matching events show
   
2. Select category filter (e.g., "Cultural")
   - **Verify**: Only cultural events show
   
3. Change sort order
   - **Verify**: Events reorder

#### ✅ Test Branding
1. Check header (both desktop and mobile)
   - **Verify**: Says "CampusEvents" (not "CampusPulse")
   
2. Check footer
   - **Verify**: Says "CampusEvents"

---

## 🎯 What Should Work

### Event Cards
- ✅ Color-coded seat indicators (green/amber/red)
- ✅ Visual progress bars showing fill level
- ✅ Category badges
- ✅ Register button (or "Event Full" / "Registration Closed")

### Event Detail Pages
- ✅ Full description
- ✅ Seat availability progress bar
- ✅ "Filling Fast" badge when >80% filled
- ✅ QR code after registration
- ✅ Event announcements (if any)

### Dashboard
- ✅ Upcoming vs Past events sections
- ✅ Event banner images on cards
- ✅ QR code modal for check-in
- ✅ Cancel registration flow
- ✅ Announcements feed

### Registration Flow
- ✅ Register → Toast notification → QR code
- ✅ Event appears in dashboard
- ✅ Cancel → Seat count increases on listing
- ✅ Can't register for full events
- ✅ Can't register after deadline

---

## 🐛 Known Test Scenarios

### Edge Cases to Test

#### 1. Full Event (Career Fair)
- **Test**: Try to register for "Career Fair 2026"
- **Expected**: "Event Full" button is disabled
- **Status**: ✅ Should work

#### 2. Past Deadline (Marathon)
- **Test**: Try to register for "Marathon for Charity"
- **Expected**: "Registration Closed" button is disabled
- **Status**: ✅ Should work

#### 3. Happening Today (Tech Talk)
- **Test**: Check event date on Tech Talk
- **Expected**: Shows today's date + 8 hours from when seed ran
- **Status**: ✅ Should work

#### 4. Nearly Full (Music Fest)
- **Test**: Music Fest should show red bar and "Filling Fast"
- **Expected**: Red progress bar, 2/150 seats visible
- **Status**: ✅ Should work (bug is now fixed!)

#### 5. Multiple Registrations
- **Test**: Register for multiple events
- **Expected**: All appear in dashboard
- **Status**: ✅ Should work

#### 6. Responsive Mobile (375px)
- **Test**: Resize browser to iPhone SE width
- **Expected**: Cards stack, pagination works, header collapses
- **Status**: ✅ Should work

---

## 🔧 Troubleshooting

### Issue: "No events found"
**Cause**: Test data not seeded  
**Fix**:
```bash
node scripts/seed-test-events.js
```

### Issue: All events show green (even with 2/150 seats)
**Cause**: Code not updated or build cache  
**Fix**:
```bash
# Stop dev server (Ctrl+C)
rm -rf .next
npm run dev
```

### Issue: "Registration failed"
**Cause**: Not logged in, or database RPC function issue  
**Fix**:
1. Log in first
2. Check Supabase console → SQL Editor → Run:
   ```sql
   SELECT * FROM register_for_event('event-id-here');
   ```
3. Check browser console for errors

### Issue: Pagination not appearing
**Cause**: Less than 10 events in database  
**Fix**: Pagination only appears with 10+ events. Add more events or it's working as designed.

### Issue: QR code not showing
**Cause**: Registration didn't complete or `qr_code` column empty  
**Fix**: Check `registrations` table in Supabase:
```sql
SELECT id, qr_code FROM registrations WHERE user_id = 'your-user-id';
```

### Issue: Branding still says "CampusPulse"
**Cause**: Browser cache  
**Fix**: Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

---

## 📋 Test Checklist (Copy/Paste to Issue or PR)

```markdown
## Event Listing Tests
- [ ] Events load on `/events` page
- [ ] Music Fest (2/150) shows RED progress bar ← Critical fix!
- [ ] Career Fair (0/200) shows RED progress bar
- [ ] Tech Talk (87/100) shows GREEN progress bar
- [ ] Progress bars display below seat counts
- [ ] Pagination works (if 10+ events)
- [ ] Search filters events
- [ ] Category filter works
- [ ] Sort options work

## Event Detail Tests
- [ ] Seat progress bar displays with correct color
- [ ] "Filling Fast" badge shows for >80% filled events
- [ ] Register button works
- [ ] Can't register for full event (Career Fair)
- [ ] Can't register past deadline (Marathon)
- [ ] QR code shows after successful registration

## Dashboard Tests
- [ ] Registered events appear in "Upcoming Events"
- [ ] Event banners display on registration cards
- [ ] QR Code button works and shows modal
- [ ] Cancel button works:
  - [ ] Shows confirmation dialog
  - [ ] Removes event from dashboard
  - [ ] Updates seat count on event listing
  - [ ] Shows toast notification
- [ ] Past events move to "Past Events" section
- [ ] No QR/Cancel buttons on past events

## Branding Tests
- [ ] Header (desktop) says "CampusEvents"
- [ ] Header (mobile) says "CampusEvents"
- [ ] Footer says "CampusEvents"
- [ ] Browser tab title includes "CampusEvents"

## Build & Deploy Tests
- [ ] `npm run build` completes without errors
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All pages compile successfully
```

---

## 🎉 Success Criteria

Your implementation is complete when:

1. ✅ Music Fest event shows **RED** progress bar (not green)
2. ✅ You can register for an event and see it in dashboard with banner
3. ✅ You can cancel registration and seat count increases
4. ✅ Pagination appears and works (with 10+ events)
5. ✅ Header says "CampusEvents" everywhere
6. ✅ Build completes: `npm run build` succeeds

---

## 📚 Related Documentation

- **Full Implementation**: See `IMPLEMENTATION_SUMMARY.md`
- **Before/After**: See `BEFORE_AFTER.md`
- **Database Schema**: See `supabase/schema.sql`
- **Seed Data**: See `supabase/seed-test-events.sql` and `scripts/seed-test-events.js`

---

## 🆘 Need Help?

### Check These First:
1. **Console Errors**: Open browser DevTools → Console tab
2. **Network Errors**: DevTools → Network tab → Filter by "Fetch/XHR"
3. **Supabase Logs**: Supabase Dashboard → Logs
4. **Terminal Output**: Check dev server terminal for errors

### Common Questions:

**Q: Why are all events green even when almost full?**  
A: This was the bug we fixed! Make sure you've pulled the latest code and restarted the dev server.

**Q: How do I reset test data?**  
A: Re-run `node scripts/seed-test-events.js` - it automatically deletes old test events first.

**Q: Can I use my own event data?**  
A: Yes! The app works with any events in your `public.events` table. Test events are just prefixed with `[TEST]` for easy identification.

**Q: What's the difference between the SQL and JS seed scripts?**  
A: Same data, different execution:
- **JS script** (`scripts/seed-test-events.js`): Run from terminal, uses Supabase client
- **SQL script** (`supabase/seed-test-events.sql`): Run in Supabase SQL Editor

Use whichever is more convenient!
