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

export async function getEventWaitlist(eventId: string) {
  const supabase = await createClient();
  
  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated', data: null };
  }
  
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized: Only admins can view waitlist', data: null };
  }

  // Fetch waitlist entries with user details, ordered by joined_at
  const { data: waitlistEntries, error } = await (supabase as any)
    .from('waitlist')
    .select('*, users(id, name, email)')
    .eq('event_id', eventId)
    .order('joined_at', { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  // Add position to each entry
  const waitlistWithPositions = waitlistEntries?.map((entry: any, index: number) => ({
    ...entry,
    position: index + 1,
  })) || [];

  return { data: waitlistWithPositions, error: null };
}

export async function promoteFromWaitlist(waitlistId: string, eventId: string) {
  const supabase = await createClient();
  
  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized: Only admins can promote from waitlist' };
  }

  // Get event details to check seats_remaining
  const { data: event } = await supabase
    .from('events')
    .select('title, seats_remaining, event_date, venue')
    .eq('id', eventId)
    .single() as any;

  if (!event) {
    return { error: 'Event not found' };
  }

  if (event.seats_remaining <= 0) {
    return { error: 'No seats available' };
  }

  // Get waitlist entry with user details
  const { data: waitlistEntry } = await (supabase as any)
    .from('waitlist')
    .select('*, users(id, name, email)')
    .eq('id', waitlistId)
    .single();

  if (!waitlistEntry) {
    return { error: 'Waitlist entry not found' };
  }

  // Generate QR code for new registration
  const qrCode = 'REG-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  // Create registration
  const { error: regError } = await supabase
    .from('registrations')
    .insert({
      user_id: waitlistEntry.user_id,
      event_id: eventId,
      status: 'confirmed',
      qr_code: qrCode,
    });

  if (regError) {
    return { error: regError.message };
  }

  // Remove from waitlist
  const { error: deleteError } = await (supabase as any)
    .from('waitlist')
    .delete()
    .eq('id', waitlistId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  // Decrement seats_remaining
  const { error: updateError } = await supabase
    .from('events')
    .update({ seats_remaining: event.seats_remaining - 1 })
    .eq('id', eventId);

  if (updateError) {
    console.error('Error updating seats:', updateError);
  }

  // Send promotion email
  if (waitlistEntry.users?.email) {
    const promotionHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">Great News — You're In! 🎉</h1>
        <p>Hi ${waitlistEntry.users.name || 'there'},</p>
        <p>You've been <strong>promoted from the waitlist</strong> and are now registered for:</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <h2 style="margin: 0 0 10px 0; color: #166534;">${event.title}</h2>
          <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${new Date(event.event_date).toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>📍 Venue:</strong> ${event.venue}</p>
          <p style="margin: 15px 0 0 0;"><strong>🎫 QR Code:</strong> ${qrCode}</p>
        </div>
        <p>Your QR code for check-in is now available in your dashboard. No further action needed!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
           style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          View Your Pass
        </a>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          See you at the event!<br/>
          - CampusEvents Team
        </p>
      </div>
    `;

    await sendEmail(
      waitlistEntry.users.email,
      `🎉 You're In: ${event.title}`,
      promotionHtml
    );
  }

  revalidatePath(`/admin/registrations/${eventId}`);
  revalidatePath(`/events/${eventId}`);
  revalidatePath('/events');
  revalidatePath('/admin/events');
  
  return { success: true, message: `${waitlistEntry.users?.name || 'User'} promoted to confirmed registration` };
}

export async function removeFromWaitlist(waitlistId: string, eventId: string) {
  const supabase = await createClient();
  
  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized: Only admins can remove from waitlist' };
  }

  // Delete from waitlist
  const { error } = await (supabase as any)
    .from('waitlist')
    .delete()
    .eq('id', waitlistId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/registrations/${eventId}`);
  revalidatePath(`/events/${eventId}`);
  revalidatePath('/events');
  revalidatePath('/admin/events');
  
  return { success: true, message: 'User removed from waitlist' };
}
