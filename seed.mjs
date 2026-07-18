import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sbfsthidxwkuxpmimhux.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiZnN0aGlkeHdrdXhwbWltaHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNTc0NjIsImV4cCI6MjA5OTkzMzQ2Mn0.GMaJ8Q6RuoxmLnbOISSXavNBkvgqbMH2o_sWIe2R7Zo';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
    banner_url: '/CodeStormHackathon.jpg',
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
    banner_url: '/Guestlecture.jpg',
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
    banner_url: '/MOVIENIGHT.jpg',
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
    banner_url: '/AnnualMusicFest.png',
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
    banner_url: '/BloodDonation.jpg',
  },
  {
    title: '[TEST] Live Coding Contest',
    description: 'Timed competitive programming contest, solo participation. Top 3 scorers get direct interview referrals from our recruiting partners.',
    category: 'technology',
    venue: 'Computer Lab 1, IT Block',
    event_date: '2026-07-18T19:00:00+05:30',
    registration_deadline: '2026-07-18T18:55:00+05:30', // Just 5 minutes from now (which is 18:49)
    total_seats: 50,
    seats_remaining: 50,
    banner_url: '/CodingContest.jpg',
  }
];

async function insertEvents() {
  console.log('Inserting events...');
  const { data, error } = await supabase.from('events').insert(events).select();
  if (error) {
    console.error('Error inserting events:', error);
  } else {
    console.log('Successfully inserted events:', data.length);
  }
}

insertEvents();
