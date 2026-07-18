import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  
  // Get the current user or an admin user to be the creator
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 }
    );
  }
  
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
      banner_url: '/FutureOfAI.png',
      created_by: user.id
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
      banner_url: '/AnnualMusicFest.png',
      created_by: user.id
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
      banner_url: '/CareerFair.png',
      created_by: user.id
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
      banner_url: '/MarathonForCharity.jpg',
      created_by: user.id
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
      banner_url: '/webdevbootcamp.png',
      created_by: user.id
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
      banner_url: '/Basketball.png',
      created_by: user.id
    }
  ];
  
  try {
    // Delete existing test events
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .like('title', '[TEST]%');
    
    if (deleteError) {
      console.warn('Warning deleting old events:', deleteError.message);
    }
    
    // Insert new events
    const { data, error } = await supabase
      .from('events')
      .insert(testEvents as any)
      .select();
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    const summary = data?.map((event: any) => {
      const fillPercentage = Math.round(((event.total_seats - event.seats_remaining) / event.total_seats) * 100);
      let status = 'AVAILABLE';
      if (new Date(event.registration_deadline) < now) status = 'CLOSED';
      else if (event.seats_remaining === 0) status = 'FULL';
      else if (fillPercentage > 90) status = 'FILLING FAST';
      
      return {
        title: event.title,
        category: event.category,
        seats: `${event.seats_remaining}/${event.total_seats}`,
        fillPercentage: `${fillPercentage}%`,
        status
      };
    });
    
    return NextResponse.json({
      success: true,
      message: `Successfully inserted ${data?.length || 0} test events!`,
      events: summary
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
