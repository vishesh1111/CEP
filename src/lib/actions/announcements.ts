'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createAnnouncement(formData: {
  event_id?: string;
  title: string;
  message: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase.from('announcements').insert({
    event_id: formData.event_id ?? null,
    title: formData.title,
    message: formData.message,
    posted_by: user.id,
  }).select().single();

  if (error) return { error: error.message };
  revalidatePath('/admin/announcements');
  if (formData.event_id) {
    revalidatePath(`/events/${formData.event_id}`);
  } else {
    revalidatePath('/');
  }
  return { data };
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.from('announcements').delete().eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/admin/announcements');
  return { success: true };
}
