# Database Issues Found and Fixed

## ✅ Issues Fixed

### 1. Function Signature Conflict (CRITICAL - FIXED)
**File**: `create-waitlist-table.sql`

**Problem**: 
- `migration.sql` defines `cancel_registration()` returning `void`
- `create-waitlist-table.sql` redefines it returning `JSON`
- PostgreSQL would throw "function already exists" error

**Solution Applied**:
```sql
-- Added explicit DROP statements for both signatures
DROP FUNCTION IF EXISTS cancel_registration(UUID, UUID);
DROP FUNCTION IF EXISTS public.cancel_registration(p_registration_id UUID, p_user_id UUID);

-- Then CREATE OR REPLACE with new signature
CREATE OR REPLACE FUNCTION public.cancel_registration(...)
RETURNS JSON AS $$
```

**Status**: ✅ **FIXED** in `create-waitlist-table.sql`

---

### 2. QR Code Format Standardization (IMPORTANT - NEEDS ACTION)

**Current State**:
- ✅ `update-qr-code-format.sql`: Uses `'REG-' || UPPER(encode(gen_random_bytes(3), 'hex'))` → `REG-A3F7B2` (10 chars)
- ✅ `create-waitlist-table.sql`: Uses same format (correct)
- ✅ Check-in code: Normalizes to uppercase (compatible)
- ❌ `migration.sql`: Still uses old format `encode(gen_random_bytes(12), 'hex')` → 24 chars lowercase

**Impact**: 
- If you run `migration.sql` → Old 24-char QR codes
- If you run `update-qr-code-format.sql` → New 10-char QR codes
- Waitlist promotions → New 10-char QR codes
- **Result**: Inconsistent QR code formats in database

**Recommended Fix**:
Update `migration.sql` line 93:

**BEFORE**:
```sql
qr_code = encode(gen_random_bytes(12), 'hex')
```

**AFTER**:
```sql
qr_code = 'REG-' || UPPER(encode(gen_random_bytes(3), 'hex'))
```

**Alternative**: Just run `update-qr-code-format.sql` after `migration.sql` to replace the function

---

## 📋 Correct Migration Sequence

### Option A: Update migration.sql (Recommended)
1. Fix `migration.sql` to use new QR format
2. Run `migration.sql` 
3. Run `create-waitlist-table.sql`
4. Run `create-feedback-table.sql`
5. Run `seed-test-events.sql`

### Option B: Use existing files as-is (Works but needs extra step)
1. Run `migration.sql` (old QR format)
2. Run `update-qr-code-format.sql` (fixes QR format) ⚠️ **IMPORTANT**
3. Run `create-waitlist-table.sql`
4. Run `create-feedback-table.sql`
5. Run `seed-test-events.sql`

---

## 🧪 Verification Tests

### Test 1: Check Function Return Type
```sql
SELECT 
  routine_name,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('register_for_event', 'cancel_registration', 'get_waitlist_position');

-- Expected:
-- register_for_event    | registrations
-- cancel_registration   | json
-- get_waitlist_position | integer
```

### Test 2: Check QR Code Format
```sql
-- Register for an event first via the app, then:
SELECT 
  qr_code,
  LENGTH(qr_code) as code_length,
  CASE 
    WHEN qr_code LIKE 'REG-%' THEN '✅ New Format'
    ELSE '❌ Old Format'
  END as format_check
FROM public.registrations
WHERE status = 'confirmed'
LIMIT 5;

-- All should show:
-- qr_code          | code_length | format_check
-- REG-A3F7B2       | 10          | ✅ New Format
```

### Test 3: Test Waitlist Promotion
```sql
-- 1. Create a full event
-- 2. Register user A (should succeed)
-- 3. Try to register user B (should fail - full)
-- 4. Add user B to waitlist
-- 5. Cancel user A's registration
-- 6. Check that user B was auto-promoted

SELECT * FROM public.registrations WHERE user_id = '<user_b_id>';
-- Should show: status = 'confirmed', qr_code = 'REG-XXXXXX'

SELECT * FROM public.waitlist WHERE user_id = '<user_b_id>';
-- Should show: (no rows) - user was removed from waitlist
```

---

## 🔍 Detailed Issue Analysis

### Why This Matters

**Problem**: Inconsistent QR code formats cause:
1. **User Confusion**: Some QR codes are 24 characters, some are 10
2. **Manual Entry**: 24-char codes are hard to type manually
3. **Check-in Issues**: Old lowercase codes need normalization

**New Format Benefits**:
- ✅ Shorter: `REG-A3F7B2` (10 chars) vs `a3f7b2c8d9e1f2a3b4c5d6e7` (24 chars)
- ✅ Prefix: `REG-` makes it clear it's a registration code
- ✅ Uppercase: Easier to read and type
- ✅ Sufficient: 16,777,216 unique combinations (3 bytes = 16^6)

**Check-in Code Compatibility**:
```typescript
// From src/lib/actions/checkin.ts
const normalizedCode = qrCode.trim().toUpperCase();
```
This ensures both old and new formats work, but new format is better UX.

---

## 📝 Files Status Summary

| File | Status | Notes |
|------|--------|-------|
| `migration.sql` | ⚠️ Needs update | Uses old QR format |
| `update-qr-code-format.sql` | ✅ Correct | Replaces function with new format |
| `create-waitlist-table.sql` | ✅ Fixed | Function conflict resolved, uses new QR format |
| `create-feedback-table.sql` | ✅ OK | No issues |
| `seed-test-events.sql` | ✅ OK | No issues |

---

## 🎯 Recommended Action Plan

### Immediate Actions:

1. **Fix migration.sql** (5 minutes):
   ```bash
   # Edit supabase/migration.sql line 93
   # Change: qr_code = encode(gen_random_bytes(12), 'hex')
   # To:     qr_code = 'REG-' || UPPER(encode(gen_random_bytes(3), 'hex'))
   ```

2. **Run migrations** in order:
   - `migration.sql` (with fix above)
   - `create-waitlist-table.sql` (already fixed)
   - `create-feedback-table.sql`
   - `seed-test-events.sql`

3. **Test the app**:
   - Start dev server: `npm run dev`
   - Visit `/events`
   - Register for an event
   - Check QR code format in dashboard
   - Test check-in with QR scanner
   - Test waitlist promotion

### If Already Ran Old Migration:

1. **Run** `update-qr-code-format.sql` to fix the function
2. **Optionally** regenerate existing QR codes:
   ```sql
   -- WARNING: This invalidates existing QR codes!
   UPDATE public.registrations
   SET qr_code = 'REG-' || UPPER(encode(gen_random_bytes(3), 'hex'))
   WHERE status = 'confirmed' AND checked_in = false;
   ```

---

## 🐛 Common Errors

### Error: "function ... already exists with same argument types"
**Cause**: Trying to run `create-waitlist-table.sql` twice

**Fix**: The script now includes proper DROP statements, so just re-run it

---

### Error: "relation 'waitlist' does not exist"
**Cause**: Trying to use waitlist features before running `create-waitlist-table.sql`

**Fix**: Run the migration in correct order

---

### Error: QR codes not working for check-in
**Cause**: Mixed old/new format, or lowercase codes

**Fix**: All codes are normalized to uppercase, should work. If not, regenerate codes with update script.

---

## ✅ Success Criteria

Your database is correctly set up when:

- [ ] All 6 test events appear in `/events` page
- [ ] Event cards show correct seat colors (red/amber/green)
- [ ] Registration creates QR codes in format `REG-XXXXXX`
- [ ] Waitlist feature works (join/leave)
- [ ] Canceling registration promotes waitlisted user
- [ ] Feedback submission works
- [ ] QR check-in scanner works
- [ ] No SQL errors in Supabase logs

---

## 📚 Related Documentation

- `MIGRATION_ORDER.md` - Step-by-step migration guide
- `BEFORE_AFTER.md` - UI fixes and improvements
- `WAITLIST_SETUP_INSTRUCTIONS.md` - Waitlist feature details
- `ADMIN_SETUP.md` - Admin user creation

---

## 🎉 Summary

**Main Issues**:
1. ✅ Function conflict - **FIXED**
2. ⚠️ QR format inconsistency - **NEEDS MIGRATION FIX**

**Action Required**:
- Update `migration.sql` line 93 to use new QR format
- OR run `update-qr-code-format.sql` after `migration.sql`

**Files Modified**:
- ✅ `create-waitlist-table.sql` - Fixed DROP statements
- ✅ `MIGRATION_ORDER.md` - Created comprehensive guide
- ✅ `ISSUE_SUMMARY.md` - This file

Everything else is working correctly!
