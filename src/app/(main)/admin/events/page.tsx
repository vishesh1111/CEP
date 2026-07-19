import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, Users, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Event } from '@/types/database';
import { EventCompletionButton } from '@/components/admin/event-completion-button';
import { Badge } from '@/components/ui/badge';

export default async function AdminEventsPage() {
  const supabase = await createClient();
  
  // Fetch events with registration stats (using left join to include events without registrations)
  const { data: eventsData } = await supabase
    .from('events')
    .select(`
      *,
      registrations(
        status,
        checked_in
      )
    `)
    .order('event_date', { ascending: false });

  // Get waitlist counts for all events
  const { data: waitlistData } = await (supabase as any)
    .from('waitlist')
    .select('event_id');

  // Count waitlist entries per event
  const waitlistCounts = (waitlistData || []).reduce((acc: Record<string, number>, entry: any) => {
    acc[entry.event_id] = (acc[entry.event_id] || 0) + 1;
    return acc;
  }, {});

  // Process events to include registration stats and waitlist counts
  const events = eventsData?.map(event => {
    const registrations = (event.registrations as any[]) || [];
    const confirmedRegistrations = registrations.filter(r => r.status === 'confirmed');
    const checkedInCount = confirmedRegistrations.filter(r => r.checked_in).length;
    const waitlistCount = waitlistCounts[event.id] || 0;
    
    return {
      ...event,
      totalRegistrations: confirmedRegistrations.length,
      checkedInCount,
      waitlistCount,
    };
  }) || [];

  return (
    <div className="container mx-auto py-8 px-4 space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Events Management</h1>
        <Link href="/admin/events/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Seats</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {events?.map(event => (
                <tr key={event.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-4 align-middle font-medium">{event.title}</td>
                  <td className="p-4 align-middle capitalize">{event.category}</td>
                  <td className="p-4 align-middle">{formatDate(event.event_date)}</td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <span>{event.seats_remaining} / {event.total_seats}</span>
                      {event.waitlistCount > 0 && event.seats_remaining === 0 && (
                        <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.waitlistCount} waiting
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <EventCompletionButton
                      eventId={event.id}
                      eventTitle={event.title}
                      eventDate={event.event_date}
                      completed={event.completed || false}
                      completedAt={event.completed_at || undefined}
                      totalRegistrations={event.totalRegistrations}
                      checkedInCount={event.checkedInCount}
                    />
                  </td>
                  <td className="p-4 align-middle text-right flex justify-end gap-2">
                    <Link href={`/admin/registrations/${event.id}`}>
                      <Button variant="outline" size="sm">
                        <Users className="h-4 w-4" />
                        <span className="sr-only">Registrations</span>
                      </Button>
                    </Link>
                    <Link href={`/admin/events/${event.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {(!events || events.length === 0) && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">No events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
