# CampusEvents — College Event Management Portal

A full-stack event management portal for college campuses, built with Next.js, Supabase, and modern UI technologies.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-green?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)

## 🚀 Features

### Core Features
- **Authentication** — Email/password registration & login via Supabase Auth with protected routes
- **Event Discovery** — Browse, search, filter, and sort campus events with paginated grid
- **Student Dashboard** — View registered events, manage registrations, view announcements
- **Admin Panel** — Full CRUD for events, manage registrations, publish announcements
- **Responsive Design** — Mobile-first layout that works on all screen sizes

### Bonus Features
- **QR Code Registration** — Auto-generated QR codes for confirmed registrations
- **Admin QR Check-in** — Scan QR codes or enter manually to check in students
- **Email Confirmations** — Registration/cancellation emails via Resend
- **Dark Mode** — System-aware dark/light theme toggle with next-themes
- **User Profiles** — Edit name, upload avatar, view registration history
- **Analytics Dashboard** — Recharts visualizations for events, registrations, categories
- **Calendar View** — react-big-calendar for date-based event browsing
- **Loading Skeletons** — Skeleton components during data fetching
- **Docker Deployment** — Multi-stage Dockerfile with standalone Next.js output

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Backend | Next.js Server Actions & Route Handlers |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Storage | Supabase Storage |
| Forms | react-hook-form + zod |
| Email | Resend |
| Charts | Recharts |
| Calendar | react-big-calendar |
| QR Codes | qrcode.react + html5-qrcode |
| Theming | next-themes |
| Containerization | Docker |

## 📋 Prerequisites

- Node.js 20+
- npm 9+
- A [Supabase](https://supabase.com) project
- (Optional) A [Resend](https://resend.com) API key for emails

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone <repo-url>
cd campus-events
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
RESEND_API_KEY=re_your_resend_key  # Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Database

1. Go to your Supabase project → SQL Editor
2. Run `supabase/migration.sql` — creates tables, RPC functions, RLS policies, storage buckets, and auth trigger
3. Create demo users through the Supabase Dashboard (Authentication → Users):
   - **Admin:** `admin@campus.edu` / `Admin@123` (set `raw_user_meta_data` to `{"name": "Admin User", "role": "admin"}`)
   - **Student:** `alice@campus.edu` / `Student@123` (set `raw_user_meta_data` to `{"name": "Alice Johnson", "role": "student"}`)
   - **Student:** `bob@campus.edu` / `Student@123` (set `raw_user_meta_data` to `{"name": "Bob Smith", "role": "student"}`)
4. Run `supabase/seed.sql` — creates sample events and announcements

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campus.edu | Admin@123 |
| Student | alice@campus.edu | Student@123 |
| Student | bob@campus.edu | Student@123 |

## 🏗 Architecture

```
src/
├── app/
│   ├── (auth)/          # Auth pages (login, register)
│   ├── (main)/          # Main app pages
│   │   ├── events/      # Event listing, detail, calendar
│   │   ├── dashboard/   # Student dashboard
│   │   ├── admin/       # Admin panel
│   │   └── profile/     # User profile
│   ├── api/             # API routes (email)
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Header, footer, theme toggle
│   ├── events/          # Event-related components
│   ├── dashboard/       # Dashboard components
│   └── admin/           # Admin components
├── lib/
│   ├── supabase/        # Supabase client setup
│   ├── actions/         # Server actions
│   └── utils.ts         # Utility functions
└── types/
    └── database.ts      # TypeScript types
```

### Key Design Decisions

- **Atomic Seat Management** — PostgreSQL RPC functions prevent race-condition overbooking
- **Row Level Security** — All tables have RLS policies; admin checks use subqueries on `public.users`
- **Defense in Depth** — Routes protected both by Next.js middleware AND Supabase RLS
- **Server Actions** — All mutations use Next.js Server Actions for type-safe, automatic revalidation

See [DECISIONS.md](./DECISIONS.md) for the complete list of engineering decisions.

## 🐳 Docker

### Build and Run

```bash
# Build the image
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=your_url \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  -t campus-events .

# Run the container
docker run -p 3000:3000 \
  -e RESEND_API_KEY=your_key \
  campus-events
```

### Docker Compose

```bash
# Set environment variables in .env file, then:
docker-compose up --build
```

## 📦 Database Schema

| Table | Description |
|-------|------------|
| `public.users` | App user profiles (extends `auth.users`) |
| `public.events` | Campus events with metadata |
| `public.registrations` | Event registrations with QR codes |
| `public.announcements` | Global and event-specific announcements |

### RPC Functions
- `register_for_event(p_event_id, p_user_id)` — Atomically registers a user
- `cancel_registration(p_registration_id, p_user_id)` — Cancels and frees seat
- `check_in_registration(p_qr_code)` — Marks attendance via QR token

## 📝 License

MIT License — built as an internship assignment.
