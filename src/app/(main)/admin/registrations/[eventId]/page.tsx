import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock } from 'lucide-react';
import { Registration, User } from '@/types/database';
import { RegistrationActions } from '@/components/admin/registration-actions';
import { getEventWaitlist } from '@/lib/actions/admin-waitlist';
import { WaitlistActions } from '@/components/admin/waitlist-actions';

export default async function EventRegistrationsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: event } = await supabase.from('events').select('title, seats_remaining').eq('id', resolvedParams.eventId).single() as any;
  const { data: registrations } = await supabase.from('registrations').select('*, users(*)').eq('event_id', resolvedParams.eventId).eq('status', 'confirmed') as unknown as { data: (Registration & { users: User })[] };
  
  // Get waitlist entries
  const waitlistResult = await getEventWaitlist(resolvedParams.eventId);
  const waitlist = waitlistResult.data || [];

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/events">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registrations: {event?.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-muted-foreground">
              {registrations?.length || 0} confirmed registration{registrations?.length !== 1 ? 's' : ''}
            </p>
            {waitlist.length > 0 && (
              <>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{waitlist.length} on waitlist</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmed Registrations Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-4">Confirmed Registrations</h2>
          <div className="rounded-lg border overflow-hidden">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Student Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Checked In</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Registration Date</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {registrations?.map(reg => (
                  <tr key={reg.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle">{reg.users?.name}</td>
                    <td className="p-4 align-middle">{reg.users?.email}</td>
                    <td className="p-4 align-middle">
                      <Badge variant={reg.status === 'confirmed' ? 'default' : 'destructive'}>{reg.status}</Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant={reg.checked_in ? 'default' : 'secondary'}>{reg.checked_in ? 'Yes' : 'No'}</Badge>
                    </td>
                    <td className="p-4 align-middle">{formatDate(reg.registered_at)}</td>
                    <td className="p-4 align-middle">
                      <div className="flex justify-end">
                        <RegistrationActions
                          registrationId={reg.id}
                          eventId={resolvedParams.eventId}
                          userId={reg.user_id}
                          userName={reg.users?.name || 'Unknown'}
                          eventTitle={event?.title || 'Unknown Event'}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {(!registrations || registrations.length === 0) && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <p className="font-medium">No registrations yet</p>
                        <p className="text-sm">Students who register for this event will appear here.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>

      {/* Waitlist Section */}
      {waitlist.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-500" />
              <h2 className="text-xl font-semibold">Waitlist</h2>
            </div>
            <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30">
              {waitlist.length} waiting
            </Badge>
          </div>
          <div className="rounded-lg border border-amber-200 dark:border-amber-800/50 overflow-hidden">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="bg-amber-50/80 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/50">
                  <tr>
                    <th className="h-12 px-4 text-left align-middle font-medium text-foreground">Position</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-foreground">Student Name</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-foreground">Email</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-foreground">Joined Date</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-transparent [&_tr:last-child]:border-0">
                  {waitlist.map((entry: any) => (
                    <tr key={entry.id} className="border-b border-amber-100 dark:border-amber-900/30 transition-colors hover:bg-amber-50/30 dark:hover:bg-amber-950/20">
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-semibold text-sm">
                            {entry.position}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle font-medium text-foreground">{entry.users?.name}</td>
                      <td className="p-4 align-middle text-muted-foreground">{entry.users?.email}</td>
                      <td className="p-4 align-middle text-muted-foreground">{formatDate(entry.joined_at)}</td>
                      <td className="p-4 align-middle">
                        <div className="flex justify-end gap-2">
                          <WaitlistActions
                            waitlistId={entry.id}
                            eventId={resolvedParams.eventId}
                            userName={entry.users?.name || 'Unknown'}
                            position={entry.position}
                            seatsRemaining={event?.seats_remaining || 0}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
