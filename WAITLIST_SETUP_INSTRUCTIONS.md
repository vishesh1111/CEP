# Waitlist Feature - Setup Instructions

## Error You're Seeing
```
Could not find the table 'public.waitlist' in the schema cache
```

This error appears because the waitlist table doesn't exist in your Supabase database yet.

## Quick Fix (5 minutes)

### Step 1: Run SQL Migration

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor** (left sidebar)
3. Click **"New query"**
4. Copy and paste the ENTIRE content from:
   ```
   supabase/create-waitlist-table.sql
   ```
5. Click **"Run"** button
6. You should see: ✅ "Success. No rows returned"

### Step 2: Verify Table Creation

In the SQL Editor, run this query to verify:
```sql
SELECT * FROM public.waitlist LIMIT 1;
```
You should see: ✅ "Success. No rows returned" (empty table is expected)

### Step 3: Restart Dev Server

```bash
# Stop your current dev server (Ctrl+C)
npm run dev
```

### Step 4: Test the Feature

1. Navigate to an event that is **full** (seats_remaining = 0)
2. You should now see the **"Join Waitlist"** button (orange color)
3. Click it - you should be added to the waitlist
4. The error should be gone ✅

---

## What the SQL Migration Does

✅ Creates `waitlist` table with proper foreign keys  
✅ Sets up Row Level Security (RLS) policies  
✅ Creates indexes for faster queries  
✅ Creates `get_waitlist_position()` function  
✅ Updates `cancel_registration()` to auto-promote waitlisted users  

---

## Testing the Auto-Promotion Feature

### Test Scenario:
1. **Event Setup**: Make sure you have a full event (seats_remaining = 0)
2. **User A**: Join the waitlist (should see position #1)
3. **User B**: Join the waitlist (should see position #2)
4. **User C** (already registered): Cancel registration
5. **Expected Result**: User A should automatically get registered and removed from waitlist
6. **Email**: User A should receive promotion notification email

---

## Troubleshooting

### Issue: Still seeing the error after running SQL
**Solution**: Clear your browser cache or hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### Issue: RLS policy errors
**Solution**: Make sure you're logged in as a user (not anonymous)

### Issue: Waitlist button not showing
**Solution**: 
1. Check event has `seats_remaining = 0`
2. Check you're not already registered
3. Check you're not already on the waitlist

### Issue: Auto-promotion not working
**Solution**:
1. Check the SQL function was created: 
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_name = 'cancel_registration';
   ```
2. Re-run the SQL migration

---

## Files Involved

- `supabase/create-waitlist-table.sql` - Database setup (RUN THIS FIRST)
- `src/lib/actions/waitlist.ts` - Server actions
- `src/components/events/waitlist-button.tsx` - UI component
- `src/app/(main)/events/[id]/page.tsx` - Event detail page

---

## Current Status

✅ Waitlist table SQL ready  
✅ UI components created  
✅ Server actions implemented  
❌ **NOT YET EXECUTED** - You need to run the SQL in Supabase

**Next step**: Run the SQL migration in Supabase SQL Editor!
