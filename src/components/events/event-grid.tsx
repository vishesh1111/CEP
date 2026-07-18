import { Event, Registration } from '@/types/database';
import { EventCard } from './event-card';
import { CalendarX } from 'lucide-react';

interface EventGridProps {
  events: Event[];
  userRegistrations?: Registration[];
}

export function EventGrid({ events, userRegistrations = [] }: EventGridProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <CalendarX className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No events found</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          We couldn't find any events matching your current filters. Try adjusting your search or category selection.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event, index) => {
        const registration = userRegistrations.find(r => r.event_id === event.id && r.status === 'confirmed');
        return (
          <EventCard 
            key={event.id} 
            event={event} 
            userRegistration={registration} 
            index={index}
          />
        );
      })}
    </div>
  );
}
