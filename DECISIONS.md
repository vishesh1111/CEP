# Engineering Decisions & Assumptions

This document records all engineering decisions made during development where the brief was ambiguous or required judgment calls.

## Architecture Decisions

### 1. Project Structure — Route Groups
**Decision:** Used Next.js route groups `(auth)` and `(main)` to separate auth pages (login/register) from authenticated pages (dashboard, events, admin).
**Reasoning:** This allows different layouts for auth vs main pages without nesting. Auth pages get a centered card layout; main pages get the full header/footer layout.

### 2. Supabase Auth Trigger for User Creation
**Decision:** Created a Postgres trigger `on_auth_user_created` that automatically inserts into `public.users` when a new auth user is created, rather than doing it in a server action.
**Reasoning:** This ensures atomicity — if the auth user is created but the server action fails, we'd have an orphaned auth user. The trigger runs in the same transaction context.

### 3. Server Actions over API Routes
**Decision:** Used Next.js Server Actions for all mutations (register, cancel, create event, etc.) instead of API routes.
**Reasoning:** Server Actions provide better DX with automatic form handling, simpler error handling, and automatic revalidation. API routes are only used for the email endpoint which needs to be callable from server actions.

### 4. RPC Functions for Seat Management
**Decision:** Used Supabase RPC functions (`register_for_event`, `cancel_registration`) with `SECURITY DEFINER` for all seat-related operations.
**Reasoning:** This prevents race conditions in seat counting. The RPC functions atomically check seat availability, decrement the count, and create the registration in a single transaction. Client-side seat management would be vulnerable to concurrent registration races.

### 5. URL-Based Filtering State
**Decision:** Event filters (search, category, sort) use URL search params rather than React state.
**Reasoning:** This makes filter state shareable via URL, survives page refreshes, and works with Next.js server-side data fetching.

## UI/UX Decisions

### 6. Color Theme — Indigo/Violet
**Decision:** Chose a rich indigo/violet primary color palette with warm accents, rather than the default shadcn zinc theme.
**Reasoning:** The brief explicitly states "give it a distinct visual identity, not a generic admin-template look." Indigo/violet conveys academia and professionalism while being visually distinctive.

### 7. Glassmorphism Effects
**Decision:** Applied glassmorphism (semi-transparent backgrounds with backdrop blur) to the header and key cards.
**Reasoning:** Modern design trend that adds depth and visual interest. The brief calls for "premium designs" and "modern web design."

### 8. Category as Predefined List
**Decision:** Categories are a predefined enum (`technology`, `cultural`, `workshop`, `sports`, `seminar`, `social`, `general`) rather than free-text input.
**Reasoning:** The brief mentions "a predefined category list admins can pick from rather than free text" as the bonus interpretation. This also enables consistent color-coded badges.

### 9. QR Code Contains Token, Not URL
**Decision:** QR codes encode the raw `qr_code` token from the registration, not a URL.
**Reasoning:** The QR is meant for admin check-in scanning within the app. A raw token is simpler and more secure — it can't be used outside the app's check-in flow.

### 10. Pagination — 9 Cards Per Page
**Decision:** Used 9 events per page (3x3 grid on desktop).
**Reasoning:** The brief suggests "9 or 12 cards per page." 9 gives a clean 3x3 grid on desktop, 3 rows of 3. On tablet it's 3 rows of 2 + 1, on mobile it's 9 rows of 1.

## Security Decisions

### 11. RLS Policies — Students Can Read All Events
**Decision:** Events and announcements have `for select using (true)` — anyone can read them, even unauthenticated users.
**Reasoning:** Event discovery should be public to encourage signups. Only registration actions and admin mutations are restricted.

### 12. Admin Check via Database Subquery
**Decision:** Admin write policies use `exists (select 1 from public.users where id = auth.uid() and role = 'admin')` rather than JWT claims.
**Reasoning:** The brief explicitly requires "Write policies should check `role = 'admin'` via a subquery on `public.users`." This is also more reliable since role changes take effect immediately without requiring a token refresh.

### 13. Middleware + RLS Double Protection
**Decision:** Admin routes are protected both by Next.js middleware (redirects non-admins) AND by Supabase RLS (blocks unauthorized database operations).
**Reasoning:** Defense in depth. Middleware provides UX (redirect with message), RLS provides security (blocks data even if middleware is bypassed).

## Technical Decisions

### 14. html5-qrcode Over @yudiel/react-qr-scanner
**Decision:** Used `html5-qrcode` for QR scanning with dynamic import and SSR disabled.
**Reasoning:** More mature library with better browser compatibility. The dynamic import avoids SSR issues since it accesses browser APIs.

### 15. next-themes with Class Strategy
**Decision:** Used `attribute="class"` for next-themes, matching Tailwind's dark mode strategy.
**Reasoning:** Tailwind CSS v4's `@custom-variant dark` already uses the `.dark` class. This ensures consistency.

### 16. Sonner for Toasts
**Decision:** Used `sonner` (shadcn-compatible) for toast notifications instead of the older `@radix-ui/react-toast`.
**Reasoning:** Sonner provides a better API (`toast.success()`, `toast.error()`), richer styling, and is the recommended toast library for modern shadcn projects.

### 17. Docker Standalone Output
**Decision:** Used Next.js `output: 'standalone'` for Docker builds.
**Reasoning:** Creates a self-contained build that doesn't need `node_modules` at runtime, resulting in much smaller Docker images (~100MB vs ~500MB+).

### 18. Resend Email — Graceful Degradation
**Decision:** Email sending gracefully degrades if `RESEND_API_KEY` is not set — it returns success without actually sending.
**Reasoning:** Not all environments will have Resend configured. The app should work fully without email; it's a bonus feature enhancement, not a core requirement.

### 19. Date Handling
**Decision:** Used native JavaScript `Date` for date formatting and `date-fns` for complex operations, with `moment` only for react-big-calendar (which requires it).
**Reasoning:** Minimizes bundle size. react-big-calendar has a hard dependency on moment for its localizer, but we don't use it elsewhere.
