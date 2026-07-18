# 🚀 Complete Database Setup Guide

## 📝 Overview

This guide will walk you through setting up your Campus Events database from scratch. All SQL issues have been identified and fixed.

---

## ✅ Issues Fixed

1. **Function signature conflict** in `create-waitlist-table.sql` - ✅ FIXED
2. **QR code format inconsistency** in `migration.sql` - ✅ FIXED
3. **Comprehensive documentation** added - ✅ DONE

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New query"

### Step 2: Run Migrations in Order

Copy and paste each file's content into the SQL editor and click "Run":

```
1️⃣ migration.sql                    (Base schema, ~5 seconds)
2️⃣ create-waitlist-table.sql         (Waitlist feature, ~2 seconds)
3️⃣ create-feedback-table.sql         (Feedback feature, ~2 seconds)
4️⃣ seed-test-events.sql              (Test data, ~1 second)
5️⃣ verify-setup.sql                  (Verification, ~1 second)
```

### Step 3: Verify Setup
The `verify-setup.sql` script will show:
- ✅ All tables created
- ✅ All functions have correct return types
- ✅ Test events loaded
- ✅ RLS policies active

---

## 📚 Detailed Step-by-Step

### 1. Run `migration.sql`

**What it does:**
- Creates core tables: `users`, `events`, `registrations`, `announcements`
- Creates functions: `register_for_event()`, `cancel_registration()`, `check_in_registration()`
- Sets up RLS policies for security
- Creates storage buckets for images
- Sets up auto-trigger for user creation

**Expected output:**
```
Success. No rows returned.
```

**Verify:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```
Should show: `announcements`, `events`, `registrations`, `users`

---

### 2. Run `create-waitlist-table.sql`

**What it does:**
- Creates `waitlist` table
- Creates `get_waitlist_position()` function
- **REPLACES** `cancel_registration()` with new version that handles waitlist promotion
- Sets up RLS policies for waitlist

**Important:** This changes `cancel_registration()` return type from `void` to `JSON`

**Expected output:**
```
Success. No rows returned.
```

**Verify:**
```sql
SELECT routine_name, data_type 
FROM information_schema.routines 
WHERE routine_name = 'cancel_registration';
```
Should show: `data_type = 'json'`

---

### 3. Run `create-feedback-table.sql`

**What it does:**
- Creates `feedback` table
- Sets up RLS policies
- Creates trigger for `updated_at` timestamp

**Expected output:**
```
Success. No rows returned.
```

**Verify:**
```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_name = 'feedback';
```
Should show: `1`

---

### 4. Run `seed-test-events.sql`

**What it does:**
- Inserts 6 test events with different scenarios:
  - Tech Talk: 87/100 seats (13% filled) - 🟢 GREEN
  - Music Fest: 2/150 seats (98.7% filled) - 🔴 RED
  - Career Fair: 0/200 seats (100% filled) - 🔴 RED
  - Marathon: 45/300 seats (85% filled) - 🟠 AMBER
  - Bootcamp: 28/40 seats (30% filled) - 🟢 GREEN
  - Basketball: 320/500 seats (36% filled) - 🟢 GREEN

**Expected output:**
```
Successfully inserted 6 rows.
Query returned 6 rows.
```
You'll see a table with all test events and their statuses.

---

### 5. Run `verify-setup.sql`

**What it does:**
- Comprehensive checks of entire database setup
- Verifies tables, functions, policies, test data

**Expected output:**
Multiple result sets showing:
- ✅ Tables Check: PASS (6 tables)
- ✅ Functions Check: PASS for all functions
- ✅ Test Events Check: PASS (6 events)
- ✅ RLS Policies Check: PASS for all tables
- ✅ Storage Buckets Check: PASS (2 buckets)
- ✅ Summary with row counts

---

## 🧪 Testing the App

### 1. Start Development Server
```bash
cd /Users/visheshverma/Documents/EUPAY/campus-events
npm run dev
```

### 2. Test Event Browsing
1. Open `http://localhost:3000/events`
2. **Verify seat colors match expected:**
   - Tech Talk: **GREEN** (87/100 seats)
   - Music Fest: **RED** (2/150 seats) 
   - Career Fair: **RED** (0/200 seats)
   - Marathon: **AMBER** (45/300 seats)
   - Bootcamp: **GREEN** (28/40 seats)
   - Basketball: **GREEN** (320/500 seats)
3. **Verify progress bars** are visible on each event card

### 3. Test Registration Flow
1. Create an account (register)
2. Click on "Tech Talk: Future of AI"
3. Click "Register Now"
4. Check success message
5. Go to `/dashboard`
6. Verify your registration appears with:
   - Event banner image (if available)
   - Event details
   - QR code button
   - Cancel button

### 4. Test QR Code
1. In dashboard, click "QR Code" button on your registration
2. **Verify QR code format**: Should be `REG-XXXXXX` (10 characters)
3. Example: `REG-A3F7B2`, `REG-9D4E1C`
4. **NOT** like: `a3f7b2c8d9e1f2a3b4c5d6e7` (old 24-char format)

### 5. Test Waitlist Feature
1. Try to register for "Career Fair" (0 seats)
2. Should see "Join Waitlist" button instead
3. Click "Join Waitlist"
4. Go to `/dashboard`
5. Should see waitlist status
6. Create another account (or use incognito)
7. Register that user for Career Fair waitlist too
8. Go back to first account
9. Find someone registered for Career Fair, have them cancel
10. First waitlist user should auto-promote to registered

### 6. Test Feedback Feature
1. Register for an event
2. After event date passes (or change event_date to past in database)
3. Should see "Leave Feedback" button
4. Submit rating and comment
5. Verify feedback appears on event detail page

---

## 🔧 Troubleshooting

### Error: "function already exists"
**Solution:** The scripts now include proper DROP statements. Just re-run the script.

### Error: "relation does not exist"
**Solution:** Run migrations in correct order (1 → 2 → 3 → 4)

### Error: "permission denied for schema public"
**Solution:** Make sure you're running queries as the database owner (default in Supabase)

### Issue: QR codes are 24 characters instead of 10
**Cause:** Old migration.sql was used

**Solution:** Run this to fix:
```sql
-- Update the function
CREATE OR REPLACE FUNCTION register_for_event(p_event_id uuid, p_user_id uuid)
RETURNS public.registrations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reg public.registrations;
  v_seats_remaining int;
  v_registration_deadline timestamptz;
BEGIN
  SELECT seats_remaining, registration_deadline 
  INTO v_seats_remaining, v_registration_deadline
  FROM public.events 
  WHERE id = p_event_id;
  
  IF v_registration_deadline < now() THEN
    RAISE EXCEPTION 'Registration deadline has passed';
  END IF;
  
  IF v_seats_remaining <= 0 THEN
    RAISE EXCEPTION 'No seats available';
  END IF;

  INSERT INTO public.registrations (user_id, event_id, qr_code)
  VALUES (p_user_id, p_event_id, 'REG-' || UPPER(encode(gen_random_bytes(3), 'hex')))
  ON CONFLICT (user_id, event_id)
    DO UPDATE SET status = 'confirmed',
                  qr_code = 'REG-' || UPPER(encode(gen_random_bytes(3), 'hex'))
  RETURNING * INTO v_reg;

  RETURN v_reg;
END;
$$;

-- Optionally regenerate existing QR codes (WARNING: Invalidates old QR codes!)
-- UPDATE public.registrations
-- SET qr_code = 'REG-' || UPPER(encode(gen_random_bytes(3), 'hex'))
-- WHERE status = 'confirmed' AND checked_in = false;
```

### Issue: Seat colors are wrong
**This was a frontend bug, already fixed in `BEFORE_AFTER.md`**

The logic now correctly shows:
- **RED**: >90% filled or 0 seats
- **AMBER**: 50-90% filled
- **GREEN**: <50% filled

---

## 📊 Database Schema Overview

### Core Tables

**users**
- Stores user profiles (synced with auth.users)
- Fields: id, name, email, role (student/admin), avatar_url

**events**
- Stores all events
- Fields: title, description, banner_url, category, venue, dates, seats, created_by

**registrations**
- Stores event registrations
- Fields: user_id, event_id, status, qr_code, checked_in
- Unique constraint: (user_id, event_id)

**announcements**
- Event-specific announcements
- Fields: event_id, title, message, posted_by

**waitlist**
- Waitlist entries for full events
- Fields: user_id, event_id, joined_at, notified
- Auto-promotes on cancellation

**feedback**
- Event feedback/reviews
- Fields: event_id, user_id, rating (1-5), comment

---

## 🔒 Security (RLS Policies)

### Users
- ✅ All can read all users
- ✅ Users can update their own profile

### Events
- ✅ All can read events
- ✅ Only admins can create/update/delete

### Registrations
- ✅ Users can read their own
- ✅ Admins can read all
- ✅ Uses RPC functions for mutations (atomic seat handling)

### Waitlist
- ✅ Users can view/join/leave their own entries
- ✅ Admins can view all

### Feedback
- ✅ All can read (for averages)
- ✅ Users can insert/update their own

---

## 🎯 Next Steps

### 1. Create First Admin
```sql
-- After signing up via the app, run:
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

Or use: `supabase/create-first-admin.sql`

### 2. Add Real Events
1. Login as admin
2. Go to `/admin/events/create`
3. Upload banner image
4. Fill out event details
5. Publish event

### 3. Test All Features
- [ ] User registration flow
- [ ] Event registration
- [ ] QR code generation
- [ ] Waitlist join/promotion
- [ ] Admin event creation
- [ ] Admin check-in (QR scanner)
- [ ] Feedback submission
- [ ] Analytics dashboard

### 4. Deploy to Production
See `DEPLOYMENT_CHECKLIST.md` for production deployment steps.

---

## 📁 File Reference

| File | Purpose | Run Order |
|------|---------|-----------|
| `migration.sql` | Base schema | 1️⃣ First |
| `create-waitlist-table.sql` | Waitlist feature | 2️⃣ Second |
| `create-feedback-table.sql` | Feedback feature | 3️⃣ Third |
| `seed-test-events.sql` | Test data | 4️⃣ Fourth |
| `verify-setup.sql` | Verification | 5️⃣ Fifth |
| `ISSUE_SUMMARY.md` | Issues found/fixed | Reference |
| `MIGRATION_ORDER.md` | Detailed migration guide | Reference |
| `COMPLETE_SETUP_GUIDE.md` | This file | Reference |

---

## ✅ Success Checklist

- [ ] All migrations ran without errors
- [ ] `verify-setup.sql` shows all ✅ PASS
- [ ] 6 test events visible in `/events`
- [ ] Seat colors match expected (red/amber/green)
- [ ] Can register for events
- [ ] QR codes are format `REG-XXXXXX`
- [ ] Can join waitlist for full events
- [ ] Cancellation promotes waitlist users
- [ ] Can submit feedback
- [ ] Admin panel accessible (after creating admin)

---

## 🎉 You're Done!

Your database is now fully set up and ready to use. 

**What you have:**
- ✅ Complete database schema
- ✅ Security policies (RLS)
- ✅ Waitlist feature with auto-promotion
- ✅ Feedback system
- ✅ Test data for development
- ✅ All SQL issues fixed

**What's working:**
- ✅ Event browsing with correct colors
- ✅ Registration flow
- ✅ QR code generation (new format)
- ✅ Waitlist management
- ✅ Admin features
- ✅ Check-in system

**Need help?**
- Check `ISSUE_SUMMARY.md` for detailed issue analysis
- Check `BEFORE_AFTER.md` for UI improvements
- Check other documentation files for specific features

Happy coding! 🚀
