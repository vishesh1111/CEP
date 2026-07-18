'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function inviteAdmin(email: string) {
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
    return { error: 'Unauthorized: Only admins can invite other admins' };
  }
  
  // Check if email is already registered
  const { data: existingUser } = await supabase
    .from('users')
    .select('email, role')
    .eq('email', email)
    .single();
  
  if (existingUser) {
    if (existingUser.role === 'admin') {
      return { error: 'User is already an admin' };
    }
    return { error: 'User already exists. Use role management to promote them.' };
  }
  
  // Check if invitation already exists
  const { data: existingInvite } = await (supabase as any)
    .from('admin_invitations')
    .select('*')
    .eq('email', email)
    .eq('status', 'pending')
    .single();
  
  if (existingInvite) {
    return { error: 'An invitation has already been sent to this email' };
  }
  
  // Create invitation
  const { data: invitation, error } = await (supabase as any)
    .from('admin_invitations')
    .insert({
      email,
      invited_by: user.id,
    })
    .select()
    .single();
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/admin/invitations');
  
  return { 
    success: true, 
    invitation,
    message: 'Invitation created successfully. Share the registration link with the invited user.'
  };
}

export async function getAdminInvitations() {
  const supabase = await createClient();
  
  const { data, error } = await (supabase as any)
    .from('admin_invitations')
    .select(`
      *,
      invited_by_user:users!admin_invitations_invited_by_fkey(name, email)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    return { error: error.message };
  }
  
  return { invitations: data };
}

export async function revokeAdminInvitation(invitationId: string) {
  const supabase = await createClient();
  
  const { error } = await (supabase as any)
    .from('admin_invitations')
    .update({ status: 'expired' })
    .eq('id', invitationId);
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/admin/invitations');
  return { success: true, message: 'Invitation revoked successfully' };
}

export async function resendAdminInvitation(email: string) {
  const supabase = await createClient();
  
  // Expire old invitation
  await (supabase as any)
    .from('admin_invitations')
    .update({ status: 'expired' })
    .eq('email', email)
    .eq('status', 'pending');
  
  // Create new invitation
  return inviteAdmin(email);
}

export async function checkAdminInvitation(email: string) {
  const supabase = await createClient();
  
  const { data } = await (supabase as any)
    .from('admin_invitations')
    .select('*')
    .eq('email', email)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .single();
  
  return { hasInvitation: !!data, invitation: data };
}
