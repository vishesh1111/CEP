import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Event } from '@/types/database';

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase.from('events').select('*').order('event_date', { ascending: false }) as { data: Event[] };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Events Management</h1>
        <Link href="/admin/events/new" passHref legacyBehavior>
          <Button>
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
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {events?.map(event => (
                <tr key={event.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-4 align-middle font-medium">{event.title}</td>
                  <td className="p-4 align-middle capitalize">{event.category}</td>
                  <td className="p-4 align-middle">{formatDate(event.event_date)}</td>
                  <td className="p-4 align-middle">{event.seats_remaining} / {event.total_seats}</td>
                  <td className="p-4 align-middle text-right flex justify-end gap-2">
                    <Link href={`/admin/registrations/${event.id}`} passHref legacyBehavior>
                      <Button variant="outline" size="sm">
                        <Users className="h-4 w-4" />
                        <span className="sr-only">Registrations</span>
                      </Button>
                    </Link>
                    <Link href={`/admin/events/${event.id}/edit`} passHref legacyBehavior>
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
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">No events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
