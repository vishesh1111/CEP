import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Please log in as admin.' }, { status: 401 });
  }

  const events = [
    {
      title: '[TEST] CodeStorm Hackathon 2026',
      description: '24-hour overnight hackathon. Build anything — web, mobile, AI, or hardware hacks. Free food, mentors on-site, and prizes worth ₹50,000 for the top three teams.',
      category: 'technology',
      venue: 'Innovation Lab, Block C',
      event_date: '2026-08-08T09:00:00+05:30',
      registration_deadline: '2026-08-05T23:59:00+05:30',
      total_seats: 80,
      seats_remaining: 80,
      banner_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
      created_by: user.id
    },
    {
      title: '[TEST] Guest Lecture: Future of Quantum Computing',
      description: 'A talk by a leading quantum computing researcher on where the field is headed and what it means for students entering tech careers. Q&A session follows.',
      category: 'seminar',
      venue: 'Seminar Hall 2, Academic Block',
      event_date: '2026-07-29T15:00:00+05:30',
      registration_deadline: '2026-07-27T23:59:00+05:30',
      total_seats: 120,
      seats_remaining: 120,
      banner_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
      created_by: user.id
    },
    {
      title: '[TEST] Movie Night Under the Stars',
      description: 'Open-air screening on the main lawn. Bring your own blanket — popcorn and drinks provided by the Film Club. Casual, no registration pressure.',
      category: 'social',
      venue: 'Main Lawn, Central Quad',
      event_date: '2026-07-24T20:00:00+05:30',
      registration_deadline: '2026-07-24T18:00:00+05:30',
      total_seats: 200,
      seats_remaining: 200,
      banner_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80',
      created_by: user.id
    },
    {
      title: '[TEST] Spectrum 2026 — Annual Cultural Fest',
      description: 'Three-day flagship fest featuring inter-college competitions, celebrity performances, food stalls, and art installations across campus.',
      category: 'cultural',
      venue: 'Entire Campus',
      event_date: '2026-08-12T10:00:00+05:30',
      registration_deadline: '2026-08-08T23:59:00+05:30',
      total_seats: 1000,
      seats_remaining: 1000,
      banner_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
      created_by: user.id
    },
    {
      title: '[TEST] Blood Donation & Volunteering Drive',
      description: 'Organized with the local Red Cross chapter. Volunteers help with registration, guiding donors, and post-donation care. Certificates provided for community service hours.',
      category: 'general',
      venue: 'Health Centre, Ground Floor',
      event_date: '2026-07-31T09:00:00+05:30',
      registration_deadline: '2026-07-29T23:59:00+05:30',
      total_seats: 60,
      seats_remaining: 60,
      banner_url: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&q=80',
      created_by: user.id
    },
    {
      title: '[TEST] Live Coding Contest',
      description: 'Timed competitive programming contest, solo participation. Top 3 scorers get direct interview referrals from our recruiting partners.',
      category: 'technology',
      venue: 'Computer Lab 1, IT Block',
      event_date: '2026-07-18T19:00:00+05:30',
      registration_deadline: '2026-07-18T18:55:00+05:30', // Just ahead of now
      total_seats: 50,
      seats_remaining: 50,
      banner_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
      created_by: user.id
    }
  ];

  const { data, error } = await supabase.from('events').insert(events as any).select();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Seeded 6 events successfully.', data });
}
