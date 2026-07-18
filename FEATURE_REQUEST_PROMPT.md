# Feature Request: Add to Calendar & Waitlist System

I'm building a campus event management system (Next.js 15 + Supabase + TypeScript) for my internship project evaluation. I need to implement two high-impact features that demonstrate innovation and attention to detail.

## Current System Overview

**Tech Stack:**
- Next.js 15 (App Router with Server Actions)
- Supabase (PostgreSQL with RLS policies)
- TypeScript
- Tailwind CSS + shadcn/ui components
- QR code-based check-in system

**Atomic Seat Management:**
The system uses PostgreSQL RPC functions for atomic operations:
- `register_for_event(p_event_id, p_user_id)` - Decrements seats_remaining atomically
- `cancel_registration(p_registration_id, p_user_id)` - Increments seats_remaining atomically

**Database Schema (relevant tables):**
```sql
-- events table
id UUID PRIMARY KEY
title TEXT
description TEXT
event_date TIMESTAMP
registration_deadline TIMESTAMP
venue TEXT
category event_category (enum)
total_seats INTEGER
seats_remaining INTEGER
banner_url TEXT

-- registrations table
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
event_id UUID REFERENCES events(id)
status registration_status (enum: confirmed, cancelled, waitlisted)
qr_code TEXT
registered_at TIMESTAMP
checked_in BOOLEAN
```

**Current File Structure:**
- `/src/app/(main)/events/[id]/page.tsx` - Event detail page (Server Component)
- `/src/lib/actions/registration.ts` - Server Actions for register/cancel
- `/src/components/events/register-button.tsx` - Client component with registration UI

## Feature 1: Add to Calendar Button

**Requirements:**
1. Add "Add to Calendar" button on event detail page (`/events/[id]`)
2. Generate `.ics` file for download (universal calendar format)
3. Provide Google Calendar link as alternative option
4. Button should appear for all users (registered or not)
5. Use shadcn/ui `DropdownMenu` for the two options

**Implementation Details:**
- Event data needed: `title`, `description`, `event_date`, `venue`, `id`
- .ics format should include:
  - Event title, description, location (venue)
  - Start time (event_date)
  - End time (assume 2 hours after start)
  - UID (use event ID)
  - DTSTAMP, DTSTART, DTEND in UTC format
- Google Calendar link format: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=...&dates=...&details=...&location=...`
- Use `lucide-react` icons: `CalendarPlus` for main button, `Download` and `Chrome` (for Google) for options

**File Changes Needed:**
1. Create `/src/lib/utils/calendar.ts` - Helper functions to generate .ics content and Google Calendar URL
2. Create `/src/components/events/add-to-calendar-button.tsx` - Client component with dropdown
3. Update `/src/app/(main)/events/[id]/page.tsx` - Add the button to event details section

## Feature 2: Waitlist System

**Requirements:**
1. When `seats_remaining = 0`, show "Join Waitlist" button instead of disabled "Register" button
2. Create `waitlist` table in Supabase
3. When user cancels registration, automatically promote first waitlisted person
4. Send email notifications for waitlist join and promotion
5. Show waitlist position to users on event detail and dashboard

**Database Changes:**
```sql
-- New table
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  event_id UUID REFERENCES events(id) NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW(),
  position INTEGER, -- auto-calculated based on joined_at
  notified BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, event_id)
);

-- RLS Policies
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own waitlist entries"
  ON waitlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can join waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave waitlist"
  ON waitlist FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all waitlist entries"
  ON waitlist FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
```

**RPC Function Updates:**
Update `cancel_registration` to check waitlist and auto-promote:
```sql
CREATE OR REPLACE FUNCTION cancel_registration(
  p_registration_id UUID,
  p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  v_event_id UUID;
  v_waitlist_entry RECORD;
BEGIN
  -- Get event_id and verify ownership
  SELECT event_id INTO v_event_id
  FROM registrations
  WHERE id = p_registration_id AND user_id = p_user_id AND status = 'confirmed';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found or already cancelled';
  END IF;
  
  -- Mark registration as cancelled
  UPDATE registrations
  SET status = 'cancelled'
  WHERE id = p_registration_id;
  
  -- Increment seats
  UPDATE events
  SET seats_remaining = seats_remaining + 1
  WHERE id = v_event_id;
  
  -- Check for waitlist entries
  SELECT * INTO v_waitlist_entry
  FROM waitlist
  WHERE event_id = v_event_id
  ORDER BY joined_at ASC
  LIMIT 1;
  
  -- If waitlist exists, auto-promote first person
  IF FOUND THEN
    -- Create registration for waitlisted user
    INSERT INTO registrations (user_id, event_id, status, qr_code)
    VALUES (
      v_waitlist_entry.user_id,
      v_event_id,
      'confirmed',
      'REG-' || UPPER(encode(gen_random_bytes(3), 'hex'))
    );
    
    -- Remove from waitlist
    DELETE FROM waitlist WHERE id = v_waitlist_entry.id;
    
    -- Decrement seats (user took the freed spot)
    UPDATE events
    SET seats_remaining = seats_remaining - 1
    WHERE id = v_event_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Server Actions to Create:**
1. `joinWaitlist(eventId: string)` - Add user to waitlist
2. `leaveWaitlist(eventId: string)` - Remove user from waitlist
3. `getWaitlistPosition(eventId: string)` - Get user's position in queue

**Component Changes:**
1. Update `/src/components/events/register-button.tsx`:
   - Check if `seatsRemaining === 0`
   - If zero, show "Join Waitlist" button instead
   - Query waitlist to check if user is already waitlisted
   - Show position if waitlisted

2. Update `/src/lib/actions/registration.ts`:
   - Modify `cancelRegistration` to send promotion email to waitlisted user
   - Email template for waitlist promotion notification

3. Create `/src/lib/actions/waitlist.ts`:
   - `joinWaitlist`, `leaveWaitlist`, `getWaitlistPosition` functions
   - Email notification when joining waitlist

**Email Templates Needed:**
1. Waitlist join confirmation: "You're on the waitlist for [Event]. Position: #X"
2. Waitlist promotion: "Great news! A spot opened up for [Event]. You've been automatically registered!"

## Expected Output

For each feature, provide:
1. Complete SQL migration file (if database changes needed)
2. Complete TypeScript files (new or modified)
3. Step-by-step implementation instructions
4. Any package installations needed (e.g., for .ics generation)

## Design Requirements

- Match existing UI design patterns (shadcn/ui components)
- Mobile-responsive
- Loading states for async actions
- Toast notifications using `sonner` library (already installed)
- Error handling with user-friendly messages
- Accessibility: proper ARIA labels, keyboard navigation

## Evaluation Criteria

These features will be evaluated on:
- **Innovation**: Waitlist with auto-promotion shows advanced system design
- **User Experience**: Add to Calendar is a small touch that shows attention to detail
- **Technical Implementation**: Proper use of atomic operations, RLS policies, server actions
- **Code Quality**: Type-safe, follows Next.js 15 best practices

## Notes

- The system already has email infrastructure via Resend API
- Existing email helper function: `sendEmail(to, subject, html)` in registration.ts
- User data available via: `const { data: { user } } = await supabase.auth.getUser()`
- All registration state changes should call `revalidatePath('/events')` and `revalidatePath('/dashboard')`

Please implement both features with production-ready code, including error handling, loading states, and proper TypeScript types. Prioritize the waitlist feature as it has higher innovation value for evaluation.
