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

export async function registerForEvent(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  
  // Get event details for email
  const { data: event } = await supabase
    .from('events')
    .select('title, event_date, venue')
    .eq('id', eventId)
    .single();
  
  const { data, error } = await supabase.rpc('register_for_event', {
    p_event_id: eventId,
    p_user_id: user.id,
  });
  
  if (error) return { error: error.message };
  
  // Send confirmation email
  if (data && event) {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Registration Confirmed! 🎉</h1>
        <p>Hi ${user.user_metadata?.name || 'there'},</p>
        <p>You've successfully registered for:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin: 0 0 10px 0; color: #1f2937;">${event.title}</h2>
          <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${new Date(event.event_date).toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>📍 Venue:</strong> ${event.venue}</p>
          <p style="margin: 15px 0 0 0;"><strong>🎫 QR Code:</strong> ${(data as any).qr_code}</p>
        </div>
        <p>Your QR code will be available in your dashboard for check-in at the event.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          View Dashboard
        </a>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          See you at the event!<br/>
          - CampusEvents Team
        </p>
      </div>
    `;
    
    await sendEmail(
      user.email!,
      `Confirmed: ${event.title}`,
      emailHtml
    );
  }
  
  revalidatePath('/events');
  revalidatePath('/dashboard');
  return { data };
}

export async function cancelRegistration(registrationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  
  // Get registration and event details before cancellation
  const { data: registration } = await supabase
    .from('registrations')
    .select('*, events(title, event_date, venue)')
    .eq('id', registrationId)
    .single();
  
  const eventId = (registration as any)?.event_id;

  // Get the waitlist state BEFORE cancellation so we can detect if someone gets promoted
  let firstWaitlisted: any = null;
  if (eventId) {
    const { data: waitlistEntry } = await (supabase as any)
      .from('waitlist')
      .select('user_id')
      .eq('event_id', eventId)
      .order('joined_at', { ascending: true })
      .limit(1)
      .single();
    firstWaitlisted = waitlistEntry;
  }

  const { error } = await supabase.rpc('cancel_registration', {
    p_registration_id: registrationId,
    p_user_id: user.id,
  });
  
  if (error) return { error: error.message };
  
  // Send cancellation email to the user who cancelled
  if (registration && (registration as any).events) {
    const event = (registration as any).events;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Registration Cancelled</h1>
        <p>Hi ${user.user_metadata?.name || 'there'},</p>
        <p>Your registration has been cancelled for:</p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h2 style="margin: 0 0 10px 0; color: #991b1b;">${event.title}</h2>
          <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${new Date(event.event_date).toLocaleString()}</p>
        </div>
        <p>You can register again if you change your mind (subject to availability).</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/events" 
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Browse Events
        </a>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          - CampusEvents Team
        </p>
      </div>
    `;
    
    await sendEmail(
      user.email!,
      `Cancelled: ${event.title}`,
      emailHtml
    );

    // If someone was on the waitlist, they got auto-promoted by the RPC.
    // Send them a promotion notification email.
    if (firstWaitlisted) {
      try {
        // Look up the promoted user's details
        const { data: promotedUser } = await supabase
          .from('users')
          .select('email, name')
          .eq('id', firstWaitlisted.user_id)
          .single() as any;

        if (promotedUser?.email) {
          const promotionHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #16a34a;">Great News — You're In! 🎉</h1>
              <p>Hi ${promotedUser.name || 'there'},</p>
              <p>A spot just opened up and you've been <strong>automatically registered</strong> for:</p>
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
                <h2 style="margin: 0 0 10px 0; color: #166534;">${event.title}</h2>
                <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${new Date(event.event_date).toLocaleString()}</p>
                <p style="margin: 5px 0;"><strong>📍 Venue:</strong> ${event.venue}</p>
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
            promotedUser.email,
            `🎉 You're In: ${event.title}`,
            promotionHtml
          );
        }
      } catch (emailErr) {
        console.error('Failed to send waitlist promotion email:', emailErr);
      }
    }
  }
  
  revalidatePath('/events');
  revalidatePath('/dashboard');
  return { success: true };
}
