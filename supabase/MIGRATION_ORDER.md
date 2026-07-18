# Database Migration Order and Troubleshooting Guide

## 📋 Correct Migration Order

Run these SQL scripts in the Supabase SQL Editor in this exact order:

### Step 1: Base Schema
```sql
-- File: migration.sql
-- Creates: users, events, registrations, announcements tables
-- Creates: RLS policies, storage buckets, triggers
```

### Step 2: Waitlist Feature
```sql
-- File: create-waitlist-table.sql
-- Creates: waitlist table
-- Updates: cancel_registration() function to handle promotion
-- Note: This REPLACES the cancel_registration function with a new return type (JSON instead of void)
```

### Step 3: Feedback Feature
```sql
-- File: create-feedback-table.sql
-- Creates: feedback table with RLS policies
-- Creates: trigger for updated_at timestamp
```

### Step 4: Seed Test Data
```sql
-- File: seed-test-events.sql
-- Inserts: 6 test events with various seat availability scenarios
-- Note: Does NOT require admin user to exist
```

---

## ⚠️ Known Issues and Solutions

### Issue 1: Function Signature Conflict (FIXED)
**Problem**: `cancel_registration` defined twice with different return types
- `migration.sql`: Returns `void`
- `create-waitlist-table.sql`: Returns `JSON`

**Solution**: ✅ Fixed in `create-waitlist-table.sql`
- Added explicit DROP statements for both function signatures
- Uses `CREATE OR REPLACE FUNCTION` with full schema qualification

**Verify Fix**:
```sql
-- Check function definition
SELECT 
  routine_schema,
  routine_name,
  data_type as return_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'cancel_registration';

-- Should show: return_type = 'json'
```

---

### Issue 2: QR Code Format Inconsistency
**Problem**: Different QR code formats in different functions
- `register_for_event()`: Uses `encode(gen_random_bytes(12), 'hex')` (24 chars)
- `cancel_registration()` (new): Uses `'REG-' || UPPER(encode(gen_random_bytes(3), 'hex'))` (10 chars)

**Recommendation**: Standardize to one format

**Fix Option A** (Make them match in create-waitlist-table.sql):
```sql
-- Change line 115 in create-waitlist-table.sql
v_new_qr_code := encode(gen_random_bytes(12), 'hex');
```

**Fix Option B** (Update register function to use REG- prefix):
```sql
-- In migration.sql, update register_for_event function
qr_code = 'REG-' || UPPER(encode(gen_random_bytes(3), 'hex'))
```

---

### Issue 3: Seed Events Missing created_by
**Status**: ✅ OK - created_by is nullable

The seed script sets `created_by = NULL` which is fine since:
```sql
-- From migration.sql
created_by uuid references public.users(id),  -- No NOT NULL constraint
```

---

## 🧪 Testing Checklist

### 1. Database Setup
- [ ] Run `migration.sql` in Supabase SQL Editor
- [ ] Verify no errors
- [ ] Check that tables exist:
  ```sql
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public'
  ORDER BY table_name;
  -- Should show: announcements, events, registrations, users
  ```

### 2. Waitlist Migration
- [ ] Run `create-waitlist-table.sql`
- [ ] Verify `waitlist` table created
- [ ] Check function return type:
  ```sql
  SELECT routine_name, data_type 
  FROM information_schema.routines 
  WHERE routine_name LIKE '%waitlist%' OR routine_name = 'cancel_registration';
  -- Should show:
  -- cancel_registration | json
  -- get_waitlist_position | integer
  ```

### 3. Feedback Migration
- [ ] Run `create-feedback-table.sql`
- [ ] Verify `feedback` table created
- [ ] Check trigger exists:
  ```sql
  SELECT trigger_name, event_object_table 
  FROM information_schema.triggers 
  WHERE trigger_name = 'update_feedback_updated_at';
  ```

### 4. Seed Test Data
- [ ] Run `seed-test-events.sql`
- [ ] Verify 6 events created:
  ```sql
  SELECT title, seats_remaining, total_seats 
  FROM public.events 
  WHERE title LIKE '%[TEST]%'
  ORDER BY event_date;
  -- Should show 6 events
  ```

### 5. Application Testing
- [ ] Start dev server: `npm run dev`
- [ ] Visit `http://localhost:3000/events`
- [ ] Check seat colors:
  - Music Fest (2/150): Should be RED
  - Career Fair (0/200): Should be RED
  - Marathon (45/300): Should be AMBER
  - Others: Should be GREEN
- [ ] Test registration flow
- [ ] Test waitlist feature
- [ ] Test feedback submission

---

## 🔍 Common Errors and Fixes

### Error: "function already exists with same argument types"
**Cause**: Function signature conflict

**Fix**:
```sql
-- Run these DROP statements first
DROP FUNCTION IF EXISTS cancel_registration(UUID, UUID);
DROP FUNCTION IF EXISTS public.cancel_registration(p_registration_id UUID, p_user_id UUID);

-- Then re-run create-waitlist-table.sql
```

---

### Error: "relation does not exist"
**Cause**: Running migrations out of order

**Fix**: Run migrations in correct order (see Step 1-4 above)

---

### Error: "insert or update violates foreign key constraint"
**Cause**: Trying to insert data referencing non-existent users

**Fix**: 
- For test events: Use `created_by = NULL` (already done in seed script)
- For real data: Ensure user exists first

---

## 🎯 Quick Verification Query

Run this to check everything is set up correctly:

```sql
-- Check all tables and row counts
SELECT 
  schemaname,
  tablename,
  (SELECT COUNT(*) FROM public.users) as users_count,
  (SELECT COUNT(*) FROM public.events) as events_count,
  (SELECT COUNT(*) FROM public.registrations) as registrations_count,
  (SELECT COUNT(*) FROM public.waitlist) as waitlist_count,
  (SELECT COUNT(*) FROM public.feedback) as feedback_count,
  (SELECT COUNT(*) FROM public.announcements) as announcements_count
FROM pg_tables 
WHERE schemaname = 'public' 
LIMIT 1;
```

---

## 📝 Next Steps After Migration

1. **Create first admin user**:
   ```bash
   # Sign up via the app first, then run:
   # File: supabase/create-first-admin.sql
   ```

2. **Test complete flow**:
   - User registration
   - Event browsing with correct colors
   - Event registration
   - Waitlist join/leave
   - Admin event creation
   - Feedback submission

3. **Deploy to production**:
   - Review `DEPLOYMENT_CHECKLIST.md`
   - Set environment variables
   - Run migrations on production database

---

## 🐛 Still Having Issues?

If you encounter errors:

1. **Check Supabase logs**: Dashboard → Database → Logs
2. **Verify RLS policies**: Ensure `auth.uid()` returns correct user ID
3. **Check function permissions**: Functions should use `SECURITY DEFINER`
4. **Test in SQL Editor**: Run queries directly before testing in app

Need help? Check these files:
- `ADMIN_SETUP.md` - Admin user creation
- `WAITLIST_SETUP_INSTRUCTIONS.md` - Waitlist feature details
- `QUICK_START.md` - General setup guide
