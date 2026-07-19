'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function markEventCompleted(eventId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'You must be logged in' };
    }

    // Verify admin role
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userProfile || userProfile.role !== 'admin') {
      return { error: 'Admin access required' };
    }

    // Call the completion function
    const { data, error } = await supabase.rpc('mark_event_completed', {
      p_event_id: eventId
    });

    if (error) {
      console.error('Event completion error:', error);
      return { error: 'Failed to mark event as completed' };
    }

    // Revalidate relevant pages
    revalidatePath('/admin/events');
    revalidatePath('/admin');
    revalidatePath('/dashboard');
    revalidatePath(`/events/${eventId}`);

    return { 
      success: true, 
      data: data,
      message: 'Event marked as completed successfully!' 
    };
  } catch (error) {
    console.error('Event completion error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function reopenEvent(eventId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'You must be logged in' };
    }

    // Verify admin role
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userProfile || userProfile.role !== 'admin') {
      return { error: 'Admin access required' };
    }

    // Call the reopen function
    const { data, error } = await supabase.rpc('reopen_event', {
      p_event_id: eventId
    });

    if (error) {
      console.error('Event reopen error:', error);
      return { error: 'Failed to reopen event' };
    }

    // Revalidate relevant pages
    revalidatePath('/admin/events');
    revalidatePath('/admin');
    revalidatePath('/dashboard');
    revalidatePath(`/events/${eventId}`);

    return { 
      success: true, 
      data: data,
      message: 'Event reopened successfully!' 
    };
  } catch (error) {
    console.error('Event reopen error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function getEventCompletionStats(eventId: string) {
  try {
    const supabase = await createClient();

    // Get event details with completion status
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        id,
        title,
        event_date,
        completed,
        completed_at,
        total_seats
      `)
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return { error: 'Event not found' };
    }

    // Get registration stats
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('status, checked_in')
      .eq('event_id', eventId)
      .eq('status', 'confirmed');

    if (regError) {
      return { error: 'Failed to fetch registration stats' };
    }

    const totalRegistrations = registrations?.length || 0;
    const checkedInCount = registrations?.filter(r => r.checked_in).length || 0;
    const attendanceRate = totalRegistrations > 0 ? 
      Math.round((checkedInCount / totalRegistrations) * 100) : 0;

    const isEventPast = new Date(event.event_date) < new Date();
    const canComplete = isEventPast && !event.completed;
    const canReopen = event.completed;

    return {
      success: true,
      stats: {
        title: event.title,
        eventDate: event.event_date,
        completed: event.completed,
        completedAt: event.completed_at,
        totalSeats: event.total_seats,
        totalRegistrations,
        checkedInCount,
        attendanceRate,
        isEventPast,
        canComplete,
        canReopen
      }
    };
  } catch (error) {
    console.error('Error fetching completion stats:', error);
    return { error: 'An unexpected error occurred' };
  }
}