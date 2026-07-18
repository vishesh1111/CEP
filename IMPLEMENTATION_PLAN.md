# Implementation Plan - Admin Features

## ✅ Completed

### 1. Fixed Link Errors (4 errors fixed)
- ✅ `/admin/events/page.tsx` - Removed `legacyBehavior` from 3 Link components
- ✅ `/admin/registrations/[eventId]/page.tsx` - Removed `legacyBehavior` from 1 Link component
- **Result**: All 4 console errors should be gone now

---

## 🚀 To Implement

### 2. Registration Management Features

#### A. Remove User from Event ✅ (Backend Ready)
- **File Created**: `src/lib/actions/admin-registrations.ts`
- **Function**: `removeUserRegistration(registrationId, eventId)`
- **What it does**:
  - Deletes the registration
  - Increments seats_remaining
  - Revalidates pages
- **Status**: Backend done, needs UI integration

#### B. Ban User from Event ✅ (Backend Ready)
- **SQL Created**: `supabase/banned-users.sql`
- **Table**: `banned_users` (user_id, event_id, banned_by, reason, banned_at)
- **Functions**: `banUserFromEvent()`, `unbanUserFromEvent()`, `is_user_banned()`
- **What it does**:
  - Prevents user from registering for specific event
  - Removes existing registration if any
  - Admins can unban users
- **Status**: Backend done, needs UI integration

---

### 3. Enhanced Announcements System

#### A. General Announcements ⏳ (Needs Implementation)
- **Type**: `event_id = NULL`
- **Visible to**: ALL users (students and non-registered)
- **Use case**: Campus-wide announcements

#### B. Event-Specific Announcements ⏳ (Needs Implementation)
- **Type**: `event_id = <specific event>`
- **Visible to**: Only users registered for that event
- **Use case**: Updates for specific event attendees

#### C. Create Announcement Form ⏳ (Needs Implementation)
- **Features**:
  - Select: "General" or "Event-Specific"
  - If event-specific: Dropdown to select event
  - Title input
  - Message textarea
  - Submit button
- **Location**: `/admin/announcements`

---

## 📋 Next Steps

### Step 1: Run SQL Migrations
```bash
# In Supabase SQL Editor, run:
1. supabase/banned-users.sql
```

### Step 2: Enhance Registrations Page
Add buttons to each registration row:
- "Remove Registration" button
- "Ban from Event" button
- Confirmation dialogs

### Step 3: Create Announcement Form
Add form at top of `/admin/announcements`:
- Radio buttons: General / Event-Specific
- Event dropdown (conditional)
- Title and message fields
- Submit action

---

## 🎯 User Flows

### Flow 1: Admin Removes User Registration
1. Admin goes to `/admin/registrations/[eventId]`
2. Sees list of registered users
3. Clicks "Remove" button on a user
4. Confirmation dialog appears
5. Confirms → Registration deleted, seat freed
6. User sees registration removed from their dashboard

### Flow 2: Admin Bans User from Event
1. Admin goes to `/admin/registrations/[eventId]`
2. Clicks "Ban" button on a user
3. Confirmation dialog: "Ban [Name] from [Event]?"
4. Confirms → User banned + registration removed (if exists)
5. User cannot re-register for that event
6. Shows "You have been banned from this event" if they try

### Flow 3: Admin Creates General Announcement
1. Admin goes to `/admin/announcements`
2. Selects "General Announcement"
3. Enters title and message
4. Submits
5. Announcement visible to ALL users on dashboard

### Flow 4: Admin Creates Event Announcement
1. Admin goes to `/admin/announcements`
2. Selects "Event-Specific"
3. Chooses event from dropdown
4. Enters title and message
5. Submits
6. Only registered users for that event see it

---

## 📁 Files to Create/Modify

### Already Created ✅
- `src/lib/actions/admin-registrations.ts`
- `supabase/banned-users.sql`

### Need to Create ⏳
- `src/components/admin/registration-actions.tsx` - Remove/Ban buttons
- `src/components/admin/announcement-form.tsx` - Create announcement form
- `src/lib/actions/announcements.ts` - Create announcement action (if doesn't exist)

### Need to Modify ⏳
- `src/app/(main)/admin/registrations/[eventId]/page.tsx` - Add action buttons
- `src/app/(main)/admin/announcements/page.tsx` - Add create form

---

## ⚠️ Important Notes

1. **Before implementing UI**: Run `supabase/banned-users.sql` first
2. **User feedback**: Banned users see clear message, not generic error
3. **Seat management**: Removing registration automatically frees seat
4. **Announcement visibility**: General = everyone, Event = only registered users

---

## ✨ Success Criteria

- [ ] All 4 Link errors fixed (DONE ✅)
- [ ] Admin can remove user registration
- [ ] Seat count updates when registration removed
- [ ] Admin can ban user from event
- [ ] Banned user cannot register for that event
- [ ] Admin can create general announcements
- [ ] Admin can create event-specific announcements
- [ ] Announcements display correctly on dashboard
