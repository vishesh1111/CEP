'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ─── Email helper ─────────────────────────────────────────────────────────────

async function sendInvitationEmail(
  to: string,
  inviterName: string,
  dashboardLink: string,
  isExistingUser: boolean,
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping invitation email');
    return { sent: false };
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    const ctaLabel = isExistingUser ? 'View Invitation on Dashboard' : 'Create Account & Accept Invitation';
    const bodyLine = isExistingUser
      ? 'Log in to your CampusEvents account and accept the invitation directly from your dashboard.'
      : 'Create your CampusEvents account using this email address. Once registered, an invitation banner on your dashboard will let you accept the Admin role.';

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to,
      subject: `You've been invited to join CampusEvents as an Admin`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #6366f1;">You're invited to CampusEvents!</h2>
          <p><strong>${inviterName}</strong> has invited you to become an <strong>Administrator</strong> on CampusEvents.</p>
          <p>${bodyLine}</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${dashboardLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              ${ctaLabel}
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">This invitation expires in 7 days. If you weren't expecting this, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">CampusEvents — College Event Management Portal</p>
        </div>
      `,
    });
    return { sent: true };
  } catch (err) {
    console.error('Failed to send invitation email:', err);
    return { sent: false };
  }
}

// ─── Invite Admin ─────────────────────────────────────────────────────────────

export async function inviteAdmin(email: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('users')
    .select('role, name')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized: Only admins can invite other admins' };
  }

  const inviterName = (profile as any)?.name || 'An admin';

  // Check if they already have an account
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('email', email)
    .single();

  if (existingUser?.role === 'admin') {
    return { error: 'This user is already an admin' };
  }

  const isExistingUser = !!existingUser;

  // Expire any old pending invitations for this email first
  await (supabase as any)
    .from('admin_invitations')
    .update({ status: 'expired' })
    .eq('email', email)
    .eq('status', 'pending');

  // Create a fresh invitation record
  const { data: invitation, error: inviteError } = await (supabase as any)
    .from('admin_invitations')
    .insert({ email, invited_by: user.id })
    .select()
    .single();

  if (inviteError) {
    if (inviteError.message?.includes('schema cache') || inviteError.message?.includes('does not exist')) {
      revalidatePath('/admin/invitations');
      return {
        success: true,
        invitation: null,
        noTable: true,
        message: 'admin_invitations table not found. Run supabase/admin-invitations.sql first.',
      };
    }
    return { error: inviteError.message };
  }

  // Send email — link points to /dashboard for existing users, /register for new users
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const link = isExistingUser
    ? `${baseUrl}/dashboard`
    : `${baseUrl}/register?email=${encodeURIComponent(email)}&invited=true`;

  const emailResult = await sendInvitationEmail(email, inviterName, link, isExistingUser);

  revalidatePath('/admin/invitations');

  return {
    success: true,
    invitation,
    emailSent: emailResult.sent,
    isExistingUser,
    message: emailResult.sent
      ? isExistingUser
        ? `Invitation sent to ${email}! They'll see an "Accept Admin" banner on their dashboard.`
        : `Invitation email sent to ${email}! They'll get admin access after signing up and accepting the invite.`
      : `Invitation created for ${email}. (Email not sent — RESEND_API_KEY not configured)`,
  };
}

// ─── Accept Invitation (called from dashboard banner) ─────────────────────────

export async function acceptAdminInvitation(invitationId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify the invitation belongs to this user's email and is still valid
  const { data: invitation } = await (supabase as any)
    .from('admin_invitations')
    .select('id, email, expires_at, status')
    .eq('id', invitationId)
    .eq('status', 'pending')
    .single();

  if (!invitation) return { error: 'Invitation not found or already used' };
  if (new Date(invitation.expires_at) < new Date()) return { error: 'This invitation has expired' };
  if (invitation.email !== user.email) return { error: 'This invitation is not for your account' };

  // Promote to admin
  const { error: updateError } = await supabase
    .from('users')
    .update({ role: 'admin' })
    .eq('id', user.id);

  if (updateError) return { error: `Failed to promote: ${updateError.message}` };

  // Mark invitation as accepted
  await (supabase as any)
    .from('admin_invitations')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', invitationId);

  revalidatePath('/', 'layout');
  redirect('/admin');
}

// ─── Decline Invitation (called from dashboard banner) ────────────────────────

export async function declineAdminInvitation(invitationId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  await (supabase as any)
    .from('admin_invitations')
    .update({ status: 'expired' })
    .eq('id', invitationId)
    .eq('email', user.email);

  revalidatePath('/dashboard');
  return { success: true };
}

// ─── Read helpers ─────────────────────────────────────────────────────────────

export async function getAdminInvitations() {
  const supabase = await createClient();

  const { data, error } = await (supabase as any)
    .from('admin_invitations')
    .select(`*, invited_by_user:users!admin_invitations_invited_by_fkey(name, email)`)
    .order('created_at', { ascending: false });

  if (error) {
    if (
      error.message?.includes('schema cache') ||
      error.message?.includes('does not exist') ||
      error.message?.includes('relation')
    ) {
      return { invitations: [] };
    }
    return { error: error.message };
  }

  return { invitations: data };
}

export async function checkAdminInvitation(email: string) {
  const supabase = await createClient();

  const { data } = await (supabase as any)
    .from('admin_invitations')
    .select('*')
    .eq('email', email)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  return { hasInvitation: !!data, invitation: data };
}

export async function revokeAdminInvitation(invitationId: string) {
  const supabase = await createClient();

  const { error } = await (supabase as any)
    .from('admin_invitations')
    .update({ status: 'expired' })
    .eq('id', invitationId);

  if (error) return { error: error.message };

  revalidatePath('/admin/invitations');
  return { success: true, message: 'Invitation revoked successfully' };
}

export async function resendAdminInvitation(email: string) {
  return inviteAdmin(email);
}
