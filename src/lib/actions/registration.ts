'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function registerForEvent(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  
  const { data, error } = await supabase.rpc('register_for_event', {
    p_event_id: eventId,
    p_user_id: user.id,
  });
  
  if (error) return { error: error.message };
  
  revalidatePath('/events');
  revalidatePath('/dashboard');
  return { data };
}

export async function cancelRegistration(registrationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  
  const { error } = await supabase.rpc('cancel_registration', {
    p_registration_id: registrationId,
    p_user_id: user.id,
  });
  
  if (error) return { error: error.message };
  
  revalidatePath('/events');
  revalidatePath('/dashboard');
  return { success: true };
}
