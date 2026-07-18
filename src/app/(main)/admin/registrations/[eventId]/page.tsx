import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Registration, User } from '@/types/database';
import { RegistrationActions } from '@/components/admin/registration-actions';

export default async function EventRegistrationsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: event } = await supabase.from('events').select('title').eq('id', resolvedParams.eventId).single() as any;
  const { data: registrations } = await supabase.from('registrations').select('*, users(*)').eq('event_id', resolvedParams.eventId).eq('status', 'confirmed') as unknown as { data: (Registration & { users: User })[] };

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
          <p className="text-muted-foreground mt-1">
            {registrations?.length || 0} confirmed registration{registrations?.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="rounded-md border">
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
  );
}
