'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitFeedback(data: {
  eventId: string;
  rating: number;
  comment?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'You must be logged in to submit feedback' };
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      return { error: 'Rating must be between 1 and 5' };
    }

    // Insert or update feedback (upsert)
    const { error } = await supabase
      .from('feedback')
      .upsert(
        {
          event_id: data.eventId,
          user_id: user.id,
          rating: data.rating,
          comment: data.comment?.trim() || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'event_id,user_id',
        }
      );

    if (error) {
      console.error('Feedback submission error:', error);
      return { error: 'Failed to submit feedback' };
    }

    // Revalidate relevant pages
    revalidatePath('/dashboard');
    revalidatePath(`/events/${data.eventId}`);
    revalidatePath('/admin/analytics');

    return { success: true };
  } catch (error) {
    console.error('Feedback submission error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function getFeedbackByUser(eventId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { data: null };
    }

    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching feedback:', error);
      return { data: null };
    }

    return { data };
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return { data: null };
  }
}

export async function getEventFeedback(eventId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('feedback')
      .select('rating')
      .eq('event_id', eventId);

    if (error) {
      console.error('Error fetching event feedback:', error);
      return { average: 0, count: 0 };
    }

    if (!data || data.length === 0) {
      return { average: 0, count: 0 };
    }

    const total = data.reduce((sum, f) => sum + f.rating, 0);
    const average = parseFloat((total / data.length).toFixed(1));

    return { average, count: data.length };
  } catch (error) {
    console.error('Error fetching event feedback:', error);
    return { average: 0, count: 0 };
  }
}
