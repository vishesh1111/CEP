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

  // Get current admins
  const { data: currentAdmins } = await supabase
    .from('users')
    .select('id, name, email, created_at')
    .eq('role', 'admin')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Invitations</h1>
        <p className="text-muted-foreground">
          Invite new administrators to manage events and the platform.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Current Admins List */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Current Admins ({currentAdmins?.length || 0})</h2>
          {currentAdmins && currentAdmins.length > 0 ? (
            <div className="space-y-2">
              {currentAdmins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {admin.name?.charAt(0).toUpperCase() || admin.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{admin.name}</p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      Admin
                    </span>
                    {admin.id === user.id && (
                      <p className="text-xs text-muted-foreground mt-1">(You)</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No admins found
            </div>
          )}
        </div>

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
            <InvitationsTable invitations={(invitations as any) || []} />
          )}
        </div>
      </div>
    </div>
  );
}
