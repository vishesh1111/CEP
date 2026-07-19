'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { EventCategory } from '@/types/database';

export async function createEvent(formData: {
  title: string; description: string; banner_url?: string;
  category: string; venue: string; event_date: string;
  registration_deadline: string; total_seats: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase.from('events').insert({
    title: formData.title,
    description: formData.description,
    banner_url: formData.banner_url ?? null,
    category: formData.category as EventCategory,
    venue: formData.venue,
    event_date: formData.event_date,
    registration_deadline: formData.registration_deadline,
    total_seats: formData.total_seats,
    seats_remaining: formData.total_seats,
    created_by: user.id,
  }).select().single();

  if (error) return { error: error.message };
  revalidatePath('/events');
  revalidatePath('/admin');
  revalidatePath('/admin/events');
  return { data };
}

export async function updateEvent(eventId: string, formData: Partial<{
  title: string; description: string; banner_url: string;
  category: string; venue: string; event_date: string;
  registration_deadline: string; total_seats: number;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const updateData: Record<string, unknown> = {};
  if (formData.title !== undefined) updateData.title = formData.title;
  if (formData.description !== undefined) updateData.description = formData.description;
  if (formData.banner_url !== undefined) updateData.banner_url = formData.banner_url;
  if (formData.category !== undefined) updateData.category = formData.category as EventCategory;
  if (formData.venue !== undefined) updateData.venue = formData.venue;
  if (formData.event_date !== undefined) updateData.event_date = formData.event_date;
  if (formData.registration_deadline !== undefined) updateData.registration_deadline = formData.registration_deadline;
  if (formData.total_seats !== undefined) updateData.total_seats = formData.total_seats;

  const { data, error } = await supabase
    .from('events')
    .update(updateData as any)
    .eq('id', eventId)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/events');
  revalidatePath('/admin');
  revalidatePath('/admin/events');
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}/edit`);
  return { data };
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.from('events').delete().eq('id', eventId);

  if (error) return { error: error.message };
  revalidatePath('/events');
  revalidatePath('/admin');
  revalidatePath('/admin/events');
  return { success: true };
}
