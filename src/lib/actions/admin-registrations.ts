'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function removeUserRegistration(registrationId: string, eventId: string) {
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
    return { error: 'Unauthorized: Only admins can remove registrations' };
  }
  
  // Delete the registration
  const { error } = await supabase
    .from('registrations')
    .delete()
    .eq('id', registrationId);
  
  if (error) {
    return { error: error.message };
  }
  
  // Increment seats_remaining
  const { error: updateError } = await supabase.rpc('increment_seats' as any, {
    event_id: eventId
  });
  
  if (updateError) {
    console.error('Error updating seats:', updateError);
  }
  
  revalidatePath(`/admin/registrations/${eventId}`);
  revalidatePath(`/events/${eventId}`);
  revalidatePath('/events');
  
  return { success: true, message: 'Registration removed successfully' };
}

export async function banUserFromEvent(userId: string, eventId: string) {
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
    return { error: 'Unauthorized: Only admins can ban users' };
  }
  
  // Add to banned_users table
  const { error } = await (supabase as any)
    .from('banned_users')
    .insert({
      user_id: userId,
      event_id: eventId,
      banned_by: user.id
    });
  
  if (error) {
    // If already banned, update the record
    if (error.code === '23505') { // Unique violation
      return { success: true, message: 'User is already banned from this event' };
    }
    return { error: error.message };
  }
  
  // Also remove their registration if they have one
  await supabase
    .from('registrations')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId);
  
  revalidatePath(`/admin/registrations/${eventId}`);
  
  return { success: true, message: 'User banned from event successfully' };
}

export async function unbanUserFromEvent(userId: string, eventId: string) {
  const supabase = await createClient();
  
  const { error } = await (supabase as any)
    .from('banned_users')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId);
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath(`/admin/registrations/${eventId}`);
  
  return { success: true, message: 'User unbanned from event successfully' };
}

