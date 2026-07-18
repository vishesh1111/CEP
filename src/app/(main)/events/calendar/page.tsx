'use client';
import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadEvents() {
      const { data } = await supabase.from('events').select('*') as any;
      if (data) {
        setEvents(data.map((e: any) => ({
          id: e.id,
          title: e.title,
          start: new Date(e.event_date),
          end: new Date(new Date(e.event_date).getTime() + 2 * 60 * 60 * 1000), // approx 2 hrs
          resource: e
        })));
      }
    }
    loadEvents();
  }, [supabase]);

  const handleSelectEvent = (event: any) => {
    router.push(`/events/${event.id}`);
  };

  return (
    <div className="space-y-6 h-[80vh]">
      <h1 className="text-3xl font-bold tracking-tight">Events Calendar</h1>
      <div className="h-full border rounded-md p-4 bg-background">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleSelectEvent}
          views={['month', 'week', 'day']}
        />
      </div>
    </div>
  );
}
