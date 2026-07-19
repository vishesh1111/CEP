'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function checkInRegistration(qrCode: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Normalize the QR code - trim whitespace
  const normalizedCode = qrCode.trim();

  console.log('Check-in attempt:', {
    originalCode: qrCode,
    normalizedCode,
    length: normalizedCode.length
  });

  // First, find the registration with the QR code (case-insensitive search)
  const { data: registration, error: findError } = await supabase
    .from('registrations')
    .select('*')
    .ilike('qr_code', normalizedCode) // Case-insensitive match
    .eq('status', 'confirmed')
    .single();

  if (findError) {
    console.error('Find error:', findError);
    // Try to find any registration with this code (ignore status)
    const { data: anyReg } = await supabase
      .from('registrations')
      .select('id, qr_code, status')
      .ilike('qr_code', normalizedCode)
      .single();
    
    if (anyReg) {
      console.log('Found registration but status is:', anyReg.status);
      return { error: `Registration found but status is: ${anyReg.status}. Must be 'confirmed'.` };
    }
    
    return { error: 'Invalid QR code or registration not found' };
  }

  if (!registration) {
    return { error: 'Invalid QR code or registration not confirmed' };
  }

  console.log('Registration found:', {
    id: registration.id,
    status: registration.status,
    checked_in: registration.checked_in
  });

  // Check if already checked in
  const isAlreadyCheckedIn = registration.checked_in;

  // If not already checked in, update the registration
  if (!isAlreadyCheckedIn) {
    const { error: updateError } = await supabase
      .from('registrations')
      .update({ checked_in: true })
      .eq('id', registration.id);

    if (updateError) {
      console.error('Update error:', updateError);
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
  
  console.log('Check-in successful');
  
  // Return with a flag indicating if they were already checked in
  return { 
    data: transformedData,
    alreadyCheckedIn: isAlreadyCheckedIn 
  };
}
