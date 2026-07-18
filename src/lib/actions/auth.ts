'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function signUp(formData: { name: string; email: string; password: string }) {
  const supabase = await createClient();

  // Check if user has admin invitation
  const { data: invitation } = await (supabase as any)
    .from('admin_invitations')
    .select('*')
    .eq('email', formData.email)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .single();

  const role = invitation ? 'admin' : 'student';

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        name: formData.name,
        role: role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: 'Failed to create user' };
  }

  // If admin invitation exists, mark it as accepted
  if (invitation) {
    await (supabase as any)
      .from('admin_invitations')
      .update({ 
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invitation.id);
  }

  revalidatePath('/', 'layout');
  redirect(role === 'admin' ? '/admin' : '/dashboard');
}

export async function signIn(formData: { email: string; password: string }) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
