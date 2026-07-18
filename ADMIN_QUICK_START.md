# Admin System - Quick Start Guide

## ✅ What Was Implemented

You now have **TWO ways** to create admin users:

1. **Manual SQL** - For creating the first admin
2. **Admin Invitation System** - For inviting additional admins (UI-based)

---

## 🚀 Quick Setup (5 Steps)

### **Step 1: Run the SQL Schema**

Go to **Supabase Dashboard** → **SQL Editor** and run:

```bash
File: supabase/admin-invitations.sql
```

Copy the entire file and execute it. This creates:
- `admin_invitations` table
- RLS policies
- Helper functions

### **Step 2: Create Your First Admin**

Register a normal account, then promote to admin:

```sql
-- Replace with your email
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### **Step 3: Login as Admin**

- Logout and login again
- You should now see "Admin" in the navbar
- Click "Admin" → Go to admin dashboard

### **Step 4: Test Admin Invitation**

1. Go to `/admin/invitations`
2. Enter an email address (e.g., `admin2@test.com`)
3. Click "Invite"
4. Copy the registration link
5. Open in incognito/private window
6. Register with that email
7. ✅ You should automatically become admin!

### **Step 5: Verify It Works**

- [ ] First admin can access `/admin`
- [ ] First admin sees "Invite Admin" in quick actions
- [ ] Can create invitation at `/admin/invitations`
- [ ] Registration link includes `?invited=true`
- [ ] New user becomes admin automatically
- [ ] Invitation shows as "Accepted"

---

## 📍 Key URLs

| Purpose | URL | Access |
|---------|-----|--------|
| Admin Dashboard | `/admin` | Admins only |
| Invite Admins | `/admin/invitations` | Admins only |
| Create Events | `/admin/events/new` | Admins only |
| Manage Events | `/admin/events` | Admins only |

---

## 🎯 How Invitations Work

```
Admin sends invitation
    ↓
Email gets invitation token
    ↓
Shares registration link
    ↓
User registers with that email
    ↓
System checks: invitation exists?
    ↓
YES → Create as ADMIN
NO → Create as STUDENT
```

---

## 💡 Tips

### For Development/Testing
- Create one admin manually (SQL)
- Use invitations for all other test admins
- Invitations expire in 7 days

### For Production
- Create first admin before launch
- Only use invitation system after that
- Monitor `/admin/invitations` regularly
- Revoke unused invitations

### For Evaluators/Demo
- Provide them with registration link from invitation
- OR give them SQL to run after they register
- Show them the invitation UI as a feature

---

## 🔍 Troubleshooting

### "I don't see 'Admin' in navbar"
- Check your role in database:
  ```sql
  SELECT role FROM public.users WHERE email = 'your-email@example.com';
  ```
- Should return 'admin', not 'student'

### "Can't access /admin/invitations"
- Run the SQL schema (Step 1)
- Check if table exists:
  ```sql
  SELECT * FROM public.admin_invitations LIMIT 1;
  ```

### "Invitation doesn't work"
- Check invitation status:
  ```sql
  SELECT * FROM public.admin_invitations WHERE email = 'invited-email@example.com';
  ```
- Should be `status = 'pending'` and `expires_at > now()`

### "New user is still 'student' after registration"
- Check if invitation exists for that email
- Invitation must be pending and not expired
- Try resending invitation from `/admin/invitations`

---

## 📋 Admin Features

Once you're an admin, you can:

✅ Create and manage events  
✅ View all registrations  
✅ Check-in students via QR code  
✅ Send announcements  
✅ View analytics  
✅ **Invite other admins** (NEW!)  

---

## 🎉 Success!

If you can:
1. Login as admin
2. See `/admin` dashboard
3. Create an invitation
4. New user registers and becomes admin

**Then the system is working perfectly!** 🚀

---

Need more details? Check `ADMIN_SETUP.md` for comprehensive documentation.
