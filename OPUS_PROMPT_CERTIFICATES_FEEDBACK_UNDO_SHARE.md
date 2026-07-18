# Prompt for Opus 4.6 — Certificates, Feedback, Undo Cancel, Share

This is an existing **Next.js 15** (App Router) + Supabase project. Auth, events, registrations, QR check-in, and the admin panel already work. Add the following four features on top of that existing infrastructure — **do not rebuild anything already working**.

---

## Feature 1 — Event Check-In Certificates (PDF)

**Goal:** Any student whose registration has `checked_in = true` can download a "Certificate of Participation" PDF for that event.

### Implementation Steps:

1. **Install dependency:**
   ```bash
   npm install @react-pdf/renderer
   ```

2. **Create `src/lib/pdf/certificate.tsx`** — a PDF document component rendering:
   - The app name/logo at the top ("CampusEvents")
   - "Certificate of Participation" as a heading
   - The student's name
   - The event title
   - The event date
   - A line like "has successfully participated in [Event Title] held on [Date]"
   - Clean and centered — doesn't need elaborate design, but should look intentional (a border, decent spacing, a serif or elegant font for the heading), not like a plain text dump

3. **Add server route: `src/app/api/certificate/[registrationId]/route.ts`** that:
   - Verifies the requesting user owns that registration
   - Verifies `checked_in = true` (return a 403 with a clear error if not — don't silently fail)
   - Fetches the student name + event details
   - Renders the PDF via `@react-pdf/renderer`'s `renderToBuffer`
   - Returns it with `Content-Type: application/pdf` and a `Content-Disposition` header suggesting a filename like `certificate-[event-title].pdf`

4. **On the student dashboard's "Past Events" section:**
   - Add a "Download Certificate" button on each past registration card
   - Visible only if `checked_in = true` for that registration
   - If not checked in, either hide the button entirely or show it disabled with a tooltip like "Available after event check-in"

---

## Feature 2 — Post-Event Feedback & Ratings

**Goal:** Students rate events they attended; admins see average ratings.

### Database Schema:

```sql
-- Add this migration in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Students can insert/update their own feedback
CREATE POLICY "Users can insert their own feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
  ON public.feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- Anyone can read feedback (for average calculations)
CREATE POLICY "Anyone can read feedback"
  ON public.feedback FOR SELECT
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_event_id ON public.feedback(event_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
```

### UI Requirements:

1. **Dashboard "Past Events" Section:**
   - For every past registered event (regardless of check-in status — feedback isn't gated by check-in, attendance intent is enough)
   - Show a "Leave Feedback" button (or "Edit Feedback" if they've already submitted)
   - Clicking opens a dialog with:
     - 5 clickable star icons (lucide-react's `Star`, filled/unfilled based on hover and selected state)
     - Optional comment textarea
   - Submitting does an **upsert** (insert if new, update if `(event_id, user_id)` already exists — use `on conflict` in the query, don't error on duplicate submission)

2. **Event Detail Page (`/events/[id]`):**
   - Show the average rating (e.g., "4.3 ★ · 12 reviews") if the event has any feedback and has already happened (past event)
   - Display below the event title or in the event details sidebar

3. **Admin Analytics Dashboard (`/admin`):**
   - Add average rating per event to the existing events table/list
   - Optionally add an "Average Event Rating" stat card alongside existing stats

---

## Feature 3 — Undo Toast on Cancel Registration

**Goal:** Cancelling a registration doesn't commit immediately — give a 5-second window to undo.

### Behavior:

1. When "Cancel" is clicked on a dashboard registration card:
   - **Do NOT call the `cancel_registration` RPC immediately**
   - Optimistically update the UI to show the event as cancelled/removed from the list
   - Show a toast (using `sonner` which is already installed) that reads "Registration cancelled" with:
     - An "Undo" action button
     - A 5-second auto-dismiss countdown

2. **If "Undo" is clicked within that window:**
   - Revert the optimistic UI change
   - Do NOT call the cancel RPC at all
   - Show confirmation toast: "Registration restored"

3. **If the toast expires without Undo being clicked:**
   - Call the `cancel_registration` RPC for real
   - Keep the UI in cancelled state

4. **Edge case handling:**
   - Use `setTimeout` that fires the actual cancellation after 5 seconds
   - Clear the timeout if Undo is clicked
   - If user navigates away, let the timeout still fire (use a ref to track pending cancellations)

---

## Feature 4 — Share Button on Event Cards

**Goal:** Quick share action for spreading events, relevant to WhatsApp-heavy sharing culture.

### Implementation:

1. **Add share button to:**
   - Event cards in the grid (`src/components/events/event-card.tsx`)
   - Event detail page (`src/app/(main)/events/[id]/page.tsx`)

2. **Button specs:**
   - Small share icon button (lucide-react's `Share2`)
   - On click, open a dropdown/popover with two options:

3. **Share Options:**

   **Option 1: Copy Link**
   - Copies the event's direct URL to clipboard via `navigator.clipboard.writeText`
   - Use full URL format: `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}`
   - Show a brief "Copied!" toast

   **Option 2: Share on WhatsApp**
   - Opens `https://wa.me/?text=` with URL-encoded message
   - Message format: `"Check out [Event Title] on CampusEvents: [event URL]"`
   - Opens in a new tab

   **Optional: Native Share API**
   - If `navigator.share` exists (check browser support)
   - Use as a third option or mobile-only replacement
   - Include title, text, and URL

---

## Current Project Context

### Tech Stack:
- Next.js 15 (App Router)
- TypeScript
- Supabase (PostgreSQL with RLS)
- Tailwind CSS + shadcn/ui components
- Toast notifications: `sonner`
- Icons: `lucide-react`

### Existing Database Tables:
```typescript
// events table
id: UUID
title: TEXT
description: TEXT
event_date: TIMESTAMPTZ
venue: TEXT
category: event_category
total_seats: INTEGER
seats_remaining: INTEGER
banner_url: TEXT
created_by: UUID

// registrations table
id: UUID
user_id: UUID
event_id: UUID
status: registration_status (confirmed, cancelled, waitlisted)
qr_code: TEXT
registered_at: TIMESTAMPTZ
checked_in: BOOLEAN

// users table
id: UUID
email: TEXT
name: TEXT
role: user_role (student, admin)
```

### Existing File Structure:
- `/src/app/(main)/dashboard/page.tsx` - Student dashboard
- `/src/app/(main)/events/[id]/page.tsx` - Event detail page
- `/src/app/(main)/admin/page.tsx` - Admin dashboard
- `/src/components/events/event-card.tsx` - Event card component
- `/src/lib/actions/registration.ts` - Registration server actions
- `/src/lib/supabase/server.ts` - Supabase server client
- `/src/lib/supabase/client.ts` - Supabase client

### Current Server Actions:
```typescript
// In src/lib/actions/registration.ts
export async function registerForEvent(eventId: string)
export async function cancelRegistration(registrationId: string)
```

---

## Verification Checklist

**Before reporting anything done, verify:**

1. ✅ **Certificate Download:**
   - Check in a test registration (`checked_in = true`)
   - Download its certificate
   - Confirm the PDF actually opens and shows correct name/event/date
   - Try downloading for a non-checked-in registration — confirm it's blocked with proper error

2. ✅ **Feedback System:**
   - Submit feedback for a past event
   - Refresh the page, confirm the rating persists
   - Submit with a different user/event
   - Confirm average shown on event detail page updates correctly with multiple ratings

3. ✅ **Undo Cancel:**
   - Cancel a registration, click Undo within the window
   - Confirm it's restored (registration exists, seat count unchanged)
   - Cancel again and let it expire without Undo
   - Confirm seat count increments and registration is marked cancelled in database

4. ✅ **Share Feature:**
   - Test "Copy Link" — confirm copied URL is correct full path (not relative)
   - Test "Share on WhatsApp" — confirm link opens with correct pre-filled text
   - Verify both work on event card and event detail page

5. ✅ **Report Results:**
   - List which checks you performed and their outcomes
   - Not just "code compiles" — actual functional verification

---

## Expected Deliverables

For each feature, provide:
1. ✅ Complete code files (new or modified)
2. ✅ SQL migration files (if database changes needed)
3. ✅ Step-by-step implementation instructions
4. ✅ Package installations needed
5. ✅ Verification test results

---

## Design Guidelines

- Match existing UI patterns (shadcn/ui components)
- Mobile-responsive
- Loading states for async actions
- Toast notifications using `sonner`
- Error handling with user-friendly messages
- Accessibility: proper ARIA labels, keyboard navigation
- Type-safe TypeScript throughout

---

## Notes

- Email infrastructure already exists via Resend (optional to send certificate via email)
- User data available via: `const { data: { user } } = await supabase.auth.getUser()`
- All state changes should call `revalidatePath()` appropriately
- Use existing utilities from `src/lib/utils.ts` (formatDate, formatDateTime, etc.)

Implement these features with production-ready code, including error handling, loading states, and proper TypeScript types. Prioritize user experience and ensure all verification checks pass before reporting completion.
