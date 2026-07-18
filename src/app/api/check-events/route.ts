import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  
  try {
    // Check all events
    const { data: allEvents, error: allError } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allError) {
      return NextResponse.json({
        success: false,
        error: allError.message,
        hint: 'Error fetching events from database'
      }, { status: 500 });
    }
    
    // Check test events specifically
    const { data: testEvents, error: testError } = await supabase
      .from('events')
      .select('*')
      .like('title', '[TEST]%');
    
    return NextResponse.json({
      success: true,
      totalEvents: allEvents?.length || 0,
      testEvents: testEvents?.length || 0,
      allEvents: allEvents?.map(e => ({
        id: e.id,
        title: e.title,
        category: e.category,
        seats: `${e.seats_remaining}/${e.total_seats}`,
        event_date: e.event_date,
        created_at: e.created_at
      })),
      message: allEvents?.length === 0 
        ? 'No events found in database. The table might be empty or there might be a permission issue.'
        : `Found ${allEvents.length} events in database`
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      hint: 'Unexpected error occurred'
    }, { status: 500 });
  }
}
