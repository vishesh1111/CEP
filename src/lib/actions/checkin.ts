'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function checkInRegistration(qrCode: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Normalize the QR code to uppercase for case-insensitive matching
  const normalizedCode = qrCode.trim().toUpperCase();

  // First, find the registration with the QR code
  const { data: registration, error: findError } = await supabase
    .from('registrations')
    .select('*')
    .eq('qr_code', normalizedCode)
    .eq('status', 'confirmed')
    .single();

  if (findError || !registration) {
    return { error: 'Invalid QR code or registration not confirmed' };
  }

  // Check if already checked in
  const isAlreadyCheckedIn = registration.checked_in;

  // If not already checked in, update the registration
  if (!isAlreadyCheckedIn) {
    const { error: updateError } = await supabase
      .from('registrations')
      .update({ checked_in: true })
      .eq('id', registration.id);

    if (updateError) {
      return { error: updateError.message };
    }
  }

  // Fetch full registration details with user and event info
  const { data: fullRegistration, error: fetchError } = await supabase
    .from('registrations')
    .select(`
      id,
      user_id,
      event_id,
      status,
      checked_in,
      qr_code,
      registered_at,
      users!inner (
        name,
        email
      ),
      events!inner (
        title,
        event_date,
        venue,
        category
      )
    `)
    .eq('id', registration.id)
    .single();

  if (fetchError) {
    console.error('Fetch error:', fetchError);
    return { error: 'Failed to fetch registration details' };
  }

  // Transform the data to match the expected format
  const transformedData = {
    ...fullRegistration,
    user: Array.isArray(fullRegistration.users) ? fullRegistration.users[0] : fullRegistration.users,
    event: Array.isArray(fullRegistration.events) ? fullRegistration.events[0] : fullRegistration.events,
  };
  
  revalidatePath('/admin/check-in');
  
  // Return with a flag indicating if they were already checked in
  return { 
    data: transformedData,
    alreadyCheckedIn: isAlreadyCheckedIn 
  };
}
