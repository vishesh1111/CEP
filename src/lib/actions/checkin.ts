'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function checkInRegistration(qrCode: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase.rpc('check_in_registration', { p_qr_code: qrCode });

  if (error) return { error: error.message };
  revalidatePath('/admin/check-in');
  return { data };
}
