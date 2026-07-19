import { redirect } from 'next/navigation';
import { Calendar, Bell, History } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RegistrationCard } from '@/components/dashboard/registration-card';
import { AnnouncementsFeed } from '@/components/dashboard/announcements-feed';
import { AdminInvitationBanner } from '@/components/dashboard/admin-invitation-banner';
import { isEventPast } from '@/lib/utils';
import { RegistrationWithEvent } from '@/types/database';

export default async function DashboardPage() {
  try {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle() as any;

  // Check for a pending admin invitation for this user's email
  const { data: pendingInvitation } = await (supabase as any)
    .from('admin_invitations')
    .select('id, invited_by_user:users!admin_invitations_invited_by_fkey(name, email)')
    .eq('email', user.email)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  const inviterName =
    pendingInvitation?.invited_by_user?.name ||
    pendingInvitation?.invited_by_user?.email ||
    'An admin';

  const { data: registrationsData } = await supabase
    .from('registrations')
    .select(`
      *,
      events (
        *,
        completed,
        completed_at
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'confirmed')
    .order('registered_at', { ascending: false });

  const registrations = (registrationsData as unknown as RegistrationWithEvent[]) || [];
  
  const upcomingRegistrations = registrations.filter(r => r.events && !isEventPast(r.events.event_date));
  const pastRegistrations = registrations.filter(r => r.events && isEventPast(r.events.event_date));
  
  const eventIds = registrations.map(r => r.event_id);
  
  // Conditionally build the announcements query to avoid syntax errors when eventIds is empty
  let announcementsQuery = supabase
    .from('announcements')
    .select('*');
    
  if (eventIds.length > 0) {
    announcementsQuery = announcementsQuery.or(`event_id.is.null,event_id.in.(${eventIds.join(',')})`);
  } else {
    announcementsQuery = announcementsQuery.is('event_id', null);
  }
  
  const { data: announcementsData } = await announcementsQuery
    .order('posted_at', { ascending: false })
    .limit(20);

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Admin invitation banner — only shown when a valid invite is pending */}
      {pendingInvitation && (
        <AdminInvitationBanner
          invitationId={pendingInvitation.id}
          inviterName={inviterName}
        />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Welcome back, {profile?.name?.split(' ')[0] || user.email?.split('@')[0] || 'Student'}!
        </h1>
        <p className="text-muted-foreground">Manage your event registrations and stay updated.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col justify-center">
          <div className="text-4xl font-bold text-primary mb-1">{upcomingRegistrations.length}</div>
          <div className="text-sm font-medium text-muted-foreground">Upcoming Events</div>
        </div>
        <div className="bg-card border rounded-xl p-6 flex flex-col justify-center">
          <div className="text-4xl font-bold mb-1">{registrations.length}</div>
          <div className="text-sm font-medium text-muted-foreground">Total Registrations</div>
        </div>
        <div className="bg-muted/20 border border-dashed rounded-xl p-6 flex flex-col justify-center">
          <div className="text-4xl font-bold mb-1">{pastRegistrations.length}</div>
          <div className="text-sm font-medium text-muted-foreground">Past Events</div>
        </div>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="mb-6 w-full sm:w-auto flex flex-col sm:flex-row h-auto p-1">
          <TabsTrigger value="events" className="py-2.5 px-6 flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="w-4 h-4" />
            My Events
          </TabsTrigger>
          <TabsTrigger value="announcements" className="py-2.5 px-6 flex items-center gap-2 w-full sm:w-auto">
            <Bell className="w-4 h-4" />
            Announcements
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="events" className="space-y-8 focus-visible:outline-none focus-visible:ring-0">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            {upcomingRegistrations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingRegistrations.map(reg => (
                  <RegistrationCard key={reg.id} registration={reg} isPast={false} />
                ))}
              </div>
            ) : (
              <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center">
                <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-medium mb-1">No upcoming events</h3>
                <p className="text-sm text-muted-foreground mb-4">You aren't registered for any future events.</p>
              </div>
            )}
          </div>
          
          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-semibold">Past Events</h2>
            {pastRegistrations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75">
                {pastRegistrations.map(reg => (
                  <RegistrationCard key={reg.id} registration={reg} isPast={true} />
                ))}
              </div>
            ) : (
              <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center">
                <History className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-medium mb-1">No past events</h3>
                <p className="text-sm text-muted-foreground mb-4">You haven't attended any events yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="announcements" className="focus-visible:outline-none focus-visible:ring-0">
          <AnnouncementsFeed announcements={announcementsData || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
  } catch (error: any) {
    return <div className="p-10 text-red-500 font-bold bg-black w-full h-screen z-50 fixed inset-0 overflow-scroll">ERROR: {error.message} <pre className="mt-4 text-xs whitespace-pre-wrap">{error.stack}</pre></div>;
  }
}

