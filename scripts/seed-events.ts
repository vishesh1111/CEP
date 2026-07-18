/**
 * Quick seed script to add test events
 * Run with: npx tsx scripts/seed-events.ts
 * OR add to package.json: "seed": "tsx scripts/seed-events.ts"
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedEvents() {
  console.log('🌱 Seeding test events...\n');
  
  const now = new Date();
  
  const testEvents = [
    {
      title: '[TEST] Tech Talk: Future of AI',
      description: 'Join us for an exciting discussion on the future of artificial intelligence and machine learning. Industry experts will share their insights on emerging trends and career opportunities in AI. Perfect for students interested in tech careers.',
      event_date: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(),
      registration_deadline: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
      venue: 'Main Auditorium, Block A',
      category: 'academic',
      total_seats: 100,
      seats_remaining: 87,
      banner_url: null
    },
    {
      title: '[TEST] Annual Music Fest 2026',
      description: 'The biggest cultural event of the year! Live performances by campus bands, DJ night, and special guest performances. Food stalls, game booths, and lots of fun activities. Don\'t miss out on this spectacular celebration!',
      event_date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      registration_deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      venue: 'Open Air Theatre',
      category: 'cultural',
      total_seats: 150,
      seats_remaining: 2,
      banner_url: null
    },
    {
      title: '[TEST] Career Fair 2026',
      description: 'Meet recruiters from top companies! Network with industry professionals, attend resume workshops, and explore internship opportunities. Companies from tech, finance, consulting, and more will be present.',
      event_date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      registration_deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      venue: 'Sports Complex Hall 1',
      category: 'career',
      total_seats: 200,
      seats_remaining: 0,
      banner_url: null
    },
    {
      title: '[TEST] Marathon for Charity',
      description: 'Run for a cause! Join our annual charity marathon supporting local NGOs. 5K, 10K, and half-marathon options available. All proceeds go to education initiatives for underprivileged children.',
      event_date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      registration_deadline: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      venue: 'Campus Main Gate (Starting Point)',
      category: 'sports',
      total_seats: 300,
      seats_remaining: 45,
      banner_url: null
    },
    {
      title: '[TEST] Web Development Bootcamp',
      description: 'Learn modern web development from scratch! This hands-on 3-day workshop covers HTML, CSS, JavaScript, React, and deployment. Perfect for beginners. Laptops required. Limited seats available.',
      event_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      registration_deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      venue: 'Computer Lab 3, IT Block',
      category: 'workshop',
      total_seats: 40,
      seats_remaining: 28,
      banner_url: null
    },
    {
      title: '[TEST] Inter-College Basketball Tournament',
      description: 'Cheer for your campus team! Exciting basketball matches between top colleges. Finals on the last day. Free entry for all students. Refreshments available.',
      event_date: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      registration_deadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      venue: 'Indoor Sports Complex',
      category: 'sports',
      total_seats: 500,
      seats_remaining: 320,
      banner_url: null
    }
  ];
  
  // Delete existing test events
  console.log('🗑️  Deleting existing test events...');
  const { error: deleteError } = await supabase
    .from('events')
    .delete()
    .like('title', '[TEST]%');
  
  if (deleteError) {
    console.warn('⚠️  Warning:', deleteError.message);
  } else {
    console.log('✅ Deleted existing test events\n');
  }
  
  // Insert new events
  console.log('📝 Inserting test events...');
  const { data, error } = await supabase
    .from('events')
    .insert(testEvents)
    .select();
  
  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  console.log(`✅ Successfully inserted ${data?.length || 0} test events!\n`);
  
  // Display summary
  console.log('📊 Test Events Summary:');
  console.log('─'.repeat(80));
  data?.forEach((event: any, idx: number) => {
    const fillPercentage = Math.round(((event.total_seats - event.seats_remaining) / event.total_seats) * 100);
    let status = 'AVAILABLE';
    if (new Date(event.registration_deadline) < now) status = 'CLOSED';
    else if (event.seats_remaining === 0) status = 'FULL';
    else if (fillPercentage > 90) status = 'FILLING FAST';
    
    console.log(`${idx + 1}. ${event.title}`);
    console.log(`   Category: ${event.category} | Seats: ${event.seats_remaining}/${event.total_seats} (${fillPercentage}% filled)`);
    console.log(`   Status: ${status}`);
    console.log('');
  });
  
  console.log('✨ Seeding complete! Visit /events to see the test events.');
}

seedEvents().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
