# 🚀 Run These Migrations NOW

## Quick Action Steps

### 1. Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"**

---

### 2. Run Migration #1: Waitlist System

**File:** `supabase/create-waitlist-table.sql`

**Copy and paste the entire file content, then click "Run"**

**What it does:**
- Creates `waitlist` table
- Adds indexes for performance
- Sets up RLS policies
- Creates `get_waitlist_position()` function
- Updates `cancel_registration()` to auto-promote waitlisted users

**Expected result:** `Success. No rows returned.`

---

### 3. Run Migration #2: Feedback System

**File:** `supabase/create-feedback-table.sql`

**Copy and paste the entire file content, then click "Run"**

**What it does:**
- Creates `feedback` table
- Sets up RLS policies
- Creates trigger for auto-updating `updated_at` timestamp
- Allows 1-5 star ratings with optional comments

**Expected result:** `Success. No rows returned.`

---

### 4. (Optional) Run Migration #3: Test Data

**File:** `supabase/seed-test-events.sql`

**Copy and paste the entire file content, then click "Run"**

**What it does:**
- Inserts 6 test events with varying seat availability:
  - Almost full event (2 seats left) - for testing waitlist
  - Completely full event (0 seats) - for testing waitlist
  - Events with different fill levels - for testing UI colors
  - Past deadline event - for testing locked registration

**Expected result:** `Successfully inserted 6 rows.`

**Note:** You can skip this if you already have real events in your database.

---

## ✅ Verify Everything Worked

Run this verification query in the SQL Editor:

```sql
-- Check tables exist
SELECT 
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'waitlist') as has_waitlist_table,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feedback') as has_feedback_table,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'get_waitlist_position') as has_waitlist_position_func,
  (SELECT data_type FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'cancel_registration') as cancel_registration_returns;
```

**Expected result:**
```
has_waitlist_table: 1
has_feedback_table: 1
has_waitlist_position_func: 1
cancel_registration_returns: json
```

If all values match above, you're done! 🎉

---

## 🧪 Test in Your App

### Test Waitlist
1. Start dev server: `npm run dev`
2. Go to: http://localhost:3000/events
3. Find an event with 0 seats (or make one full by registering all seats)
4. Should see **"Join Waitlist"** button instead of "Register"
5. Click it - should show **"On Waitlist - Position #1"**
6. Create another account, join same waitlist
7. Cancel first user's registration to another event they're registered for
8. Second user should auto-promote to registered status

### Test Feedback
1. Register for any event
2. Mark the event date as past (or wait for real date to pass)
3. Go to event detail page: `/events/[event-id]`
4. Should see **"Give Feedback"** button
5. Click and submit 1-5 stars + comment
6. Should show **"Feedback submitted!"** toast
7. Refresh page - should see average rating displayed

---

## 🐛 Troubleshooting

### Error: "function cancel_registration already exists"
**Fix:** The script includes DROP statements. If you still see this error:
```sql
DROP FUNCTION IF EXISTS cancel_registration(UUID, UUID);
DROP FUNCTION IF EXISTS public.cancel_registration(p_registration_id UUID, p_user_id UUID);
```
Then re-run `create-waitlist-table.sql`

### Error: "relation waitlist already exists"
**Cause:** You already ran this migration
**Fix:** Skip to next migration

### Error: "permission denied"
**Cause:** Not enough permissions
**Fix:** Make sure you're logged in as the project owner in Supabase dashboard

### Tables created but app not working
**Fix:** Check your `.env.local` file has correct Supabase keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📝 Migration Files Location

All SQL files are in:
```
/Users/visheshverma/Documents/EUPAY/campus-events/supabase/
```

**Files to run:**
1. ✅ `create-waitlist-table.sql` (required)
2. ✅ `create-feedback-table.sql` (required)
3. ⚪ `seed-test-events.sql` (optional)

**Reference docs:**
- `COMPLETE_SETUP_GUIDE.md` - Detailed setup guide
- `MIGRATION_ORDER.md` - Migration order and troubleshooting
- `IMPLEMENTATION_STATUS.md` - What's already done

---

## 🎯 After Migrations

Your app will have:
- ✅ Full waitlist system with auto-promotion
- ✅ Star rating and feedback system
- ✅ Email notifications for waitlist promotions
- ✅ Admin visibility into waitlists
- ✅ All security policies (RLS) enforced

**No code changes needed - just run the migrations!**

---

## 📞 Need Help?

If you encounter issues:
1. Check Supabase logs: Dashboard → Database → Logs
2. Verify your base schema exists (users, events, registrations tables)
3. Check `MIGRATION_ORDER.md` for detailed troubleshooting
4. Ensure you ran `migration.sql` first (base schema)

---

**Ready? Open Supabase SQL Editor and paste the files! 🚀**
