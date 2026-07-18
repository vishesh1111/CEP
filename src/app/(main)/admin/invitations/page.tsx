import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { InviteAdminForm } from '@/components/admin/invite-admin-form';
import { InvitationsTable } from '@/components/admin/invitations-table';
import { getAdminInvitations } from '@/lib/actions/admin-invitations';

export default async function AdminInvitationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const { invitations, error } = await getAdminInvitations();

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Invitations</h1>
        <p className="text-muted-foreground">
          Invite new administrators to manage events and the platform.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Invite Form */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Invite New Admin</h2>
          <InviteAdminForm />
        </div>

        {/* Invitations List */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Pending & Recent Invitations</h2>
          {error ? (
            <div className="text-red-500 p-4 bg-red-50 rounded-md">
              Error loading invitations: {error}
            </div>
          ) : (
            <InvitationsTable invitations={invitations || []} />
          )}
        </div>
      </div>
    </div>
  );
}
