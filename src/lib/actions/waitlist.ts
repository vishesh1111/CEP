'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function sendEmail(to: string, subject: string, html: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    });
    return await response.json();
  } catch (error) {
    console.error('Email send failed:', error);
    return { error: 'Failed to send email' };
  }
}

export async function joinWaitlist(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify event is actually full
  const { data: event } = await supabase
    .from('events')
    .select('title, seats_remaining, event_date, venue, registration_deadline')
    .eq('id', eventId)
    .single() as any;

  if (!event) return { error: 'Event not found' };
  if (event.seats_remaining > 0) return { error: 'Event still has seats available. Register instead!' };

  // Check registration deadline
  if (new Date(event.registration_deadline) < new Date()) {
    return { error: 'Registration deadline has passed' };
  }

  // Check if already registered
  const { data: existingReg } = await supabase
    .from('registrations')
    .select('id')
    .eq('user_id', user.id)
    .eq('event_id', eventId)
    .eq('status', 'confirmed')
    .single() as any;

  if (existingReg) return { error: 'You are already registered for this event' };

  // Check if already on waitlist
  const { data: existingWaitlist } = await (supabase as any)
    .from('waitlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('event_id', eventId)
    .single();

  if (existingWaitlist) return { error: 'You are already on the waitlist' };

  // Join waitlist
  const { error } = await (supabase as any)
    .from('waitlist')
    .insert({
      user_id: user.id,
      event_id: eventId,
    });

  if (error) return { error: error.message };

  // Get position
  const position = await getWaitlistPosition(eventId);

  // Send confirmation email
  if (event) {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #d97706;">You're on the Waitlist! ⏳</h1>
        <p>Hi ${user.user_metadata?.name || 'there'},</p>
        <p>You've been added to the waitlist for:</p>
        <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
          <h2 style="margin: 0 0 10px 0; color: #92400e;">${event.title}</h2>
          <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${new Date(event.event_date).toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>📍 Venue:</strong> ${event.venue}</p>
          <p style="margin: 15px 0 0 0;"><strong>📊 Your Position:</strong> #${position.position || '?'}</p>
        </div>
        <p>We'll automatically register you and send a confirmation if a spot opens up. No action needed from your side!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}" 
           style="display: inline-block; background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          View Event
        </a>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          - CampusEvents Team
        </p>
      </div>
    `;

    await sendEmail(
      user.email!,
      `Waitlisted: ${event.title}`,
      emailHtml
    );
  }

  revalidatePath('/events');
  revalidatePath(`/events/${eventId}`);
  revalidatePath('/dashboard');
  return { success: true, position: position.position };
}

export async function leaveWaitlist(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await (supabase as any)
    .from('waitlist')
    .delete()
    .eq('user_id', user.id)
    .eq('event_id', eventId);

  if (error) return { error: error.message };

  revalidatePath('/events');
  revalidatePath(`/events/${eventId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function getWaitlistPosition(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { position: null };

  // Get user's joined_at timestamp
  const { data: entry } = await (supabase as any)
    .from('waitlist')
    .select('joined_at')
    .eq('user_id', user.id)
    .eq('event_id', eventId)
    .single();

  if (!entry) return { position: null };

  // Count how many people are ahead (joined before this user)
  const { count } = await (supabase as any)
    .from('waitlist')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .lte('joined_at', entry.joined_at);

  return { position: count || 1 };
}

export async function getWaitlistCount(eventId: string) {
  const supabase = await createClient();

  const { count } = await (supabase as any)
    .from('waitlist')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId);

  return count || 0;
}
