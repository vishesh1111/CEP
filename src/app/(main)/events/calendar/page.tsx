'use client';
import { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer, Event, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { CATEGORY_COLORS } from '@/types/database';
import { useTheme } from 'next-themes';
import { PulsingBorder } from '@paper-design/shaders-react';

const localizer = momentLocalizer(moment);

interface EventData {
  id: string;
  title: string;
  start: Date;
  end: Date;
  category: string;
  venue: string;
  allDay?: boolean;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const supabase = createClient();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function loadEvents() {
      const { data } = await supabase.from('events').select('*') as any;
      if (data) {
        setEvents(data.map((e: any) => {
          const eventDate = new Date(e.event_date);
          const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

          return {
            id: e.id,
            title: e.title,
            start: eventDate,
            end: endDate,
            category: e.category,
            venue: e.venue,
            allDay: false, // Force time-based view
          };
        }));
      }
    }
    loadEvents();
  }, [supabase]);

  const handleSelectEvent = (event: EventData) => {
    router.push(`/events/${event.id}`);
  };

  const CALENDAR_COLORS = {
    technology: { bg: 'hsl(221 83% 53% / 0.15)', border: 'hsl(221 83% 53%)', text: 'hsl(221 83% 53%)' },
    cultural: { bg: 'hsl(271 91% 65% / 0.15)', border: 'hsl(271 91% 65%)', text: 'hsl(271 91% 65%)' },
    workshop: { bg: 'hsl(43 96% 56% / 0.15)', border: 'hsl(43 96% 56%)', text: 'hsl(43 96% 56%)' },
    sports: { bg: 'hsl(142 71% 45% / 0.15)', border: 'hsl(142 71% 45%)', text: 'hsl(142 71% 45%)' },
    seminar: { bg: 'hsl(346 87% 60% / 0.15)', border: 'hsl(346 87% 60%)', text: 'hsl(346 87% 60%)' },
    social: { bg: 'hsl(330 81% 60% / 0.15)', border: 'hsl(330 81% 60%)', text: 'hsl(330 81% 60%)' },
    general: { bg: 'hsl(215 16% 47% / 0.15)', border: 'hsl(215 16% 47%)', text: 'hsl(215 16% 47%)' },
  };

  // Custom event styling based on category
  const eventStyleGetter = (event: EventData) => {
    const color = CALENDAR_COLORS[event.category as keyof typeof CALENDAR_COLORS] || CALENDAR_COLORS.technology;
    return {
      style: {
        backgroundColor: color.bg,
        borderLeft: `3px solid ${color.border}`,
        color: 'hsl(var(--foreground))',
        borderRadius: '4px',
        fontSize: '0.875rem',
        padding: '2px 6px',
        fontWeight: '500'
      }
    };
  };

  // Custom event component to show time + title
  const EventComponent = ({ event }: { event: EventData }) => (
    <div className="flex flex-row items-baseline gap-1.5 truncate">
      <strong className="text-[10px] whitespace-nowrap">{moment(event.start).format('h:mm A')}</strong>
      <span className="text-xs truncate">{event.title}</span>
    </div>
  );

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="container mx-auto py-8 px-4 space-y-6 pb-8 animate-fade-in-up">
      <style>{`
        /* Base calendar styles */
        .rbc-calendar {
          font-family: inherit;
          background-color: hsl(var(--card));
        }
        
        /* Remove off-range dates */
        .rbc-off-range-bg {
          background-color: hsl(var(--muted) / 0.3) !important;
        }
        
        /* Header styling */
        .rbc-header {
          padding: 16px 8px;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid hsl(var(--border));
          background-color: hsl(var(--muted) / 0.3);
        }
        
        /* Today highlight */
        .rbc-today {
          background-color: hsl(var(--primary) / 0.08);
        }
        
        .rbc-header.rbc-today {
          background-color: hsl(var(--primary) / 0.15);
        }
        
        /* Month view date cells */
        .rbc-date-cell {
          padding: 8px;
          text-align: right;
          font-weight: 500;
        }
        
        .rbc-date-cell.rbc-now {
          font-weight: 700;
        }
        
        .rbc-date-cell > a {
          color: hsl(var(--foreground));
        }
        
        .rbc-today .rbc-date-cell > a {
          color: hsl(var(--primary));
          font-weight: 700;
        }
        
        /* Event styling */
        .rbc-event {
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 13px;
          cursor: pointer;
          margin: 2px 4px;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .rbc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
        }
        
        .rbc-event-label {
          display: none;
        }
        
        .rbc-event-content {
          font-weight: 500;
        }
        
        /* Show more link */
        .rbc-show-more {
          color: hsl(var(--primary));
          font-weight: 600;
          font-size: 12px;
          padding: 4px 8px;
          margin: 2px 4px;
          background-color: hsl(var(--primary) / 0.1);
          border-radius: 4px;
          cursor: pointer;
        }
        
        .rbc-show-more:hover {
          background-color: hsl(var(--primary) / 0.2);
        }
        
        /* Week view styles */
        .rbc-time-slot {
          min-height: 40px;
          border-top: 1px solid hsl(var(--border) / 0.5);
        }
        
        .rbc-time-header-content {
          border-left: 1px solid hsl(var(--border));
        }
        
        .rbc-time-content {
          border-top: 2px solid hsl(var(--border));
        }
        
        .rbc-timeslot-group {
          min-height: 80px;
          border-bottom: 1px solid hsl(var(--border));
        }
        
        .rbc-time-column {
          background-color: hsl(var(--background));
        }
        
        .rbc-current-time-indicator {
          background-color: hsl(var(--primary));
          height: 2px;
        }
        
        .rbc-time-header-gutter {
          background-color: hsl(var(--muted) / 0.3);
        }
        
        .rbc-label {
          padding: 8px;
          font-size: 12px;
          color: hsl(var(--muted-foreground));
        }
        
        /* Day view styles */
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid hsl(var(--border) / 0.5);
        }
        
        .rbc-day-slot .rbc-event {
          border: none;
          margin: 0 2px;
        }
        
        /* Toolbar */
        .rbc-toolbar {
          padding: 16px 0;
          margin-bottom: 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          justify-content: space-between;
        }
        
        .rbc-toolbar-label {
          font-size: 20px;
          font-weight: 700;
          color: hsl(var(--foreground));
          flex-grow: 1;
          text-align: center;
        }
        
        .rbc-toolbar button {
          padding: 8px 16px;
          border: 1px solid hsl(var(--border));
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .rbc-toolbar button:hover {
          background-color: hsl(var(--accent));
          border-color: hsl(var(--primary) / 0.5);
        }
        
        .rbc-toolbar button.rbc-active {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border-color: hsl(var(--primary));
          font-weight: 600;
        }
        
        .rbc-btn-group {
          display: flex;
          gap: 4px;
        }
        
        .rbc-btn-group button:first-child {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
        
        .rbc-btn-group button:last-child {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
        
        .rbc-btn-group button:not(:first-child):not(:last-child) {
          border-radius: 0;
        }
        
        /* Agenda view */
        .rbc-agenda-view {
          padding: 16px;
        }
        
        .rbc-agenda-view table {
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          overflow: hidden;
        }
        
        .rbc-agenda-view table thead {
          background-color: hsl(var(--muted) / 0.5);
        }
        
        .rbc-agenda-view table tbody tr {
          border-top: 1px solid hsl(var(--border));
        }
        
        .rbc-agenda-view table tbody tr:hover {
          background-color: hsl(var(--accent));
        }
        
        .rbc-agenda-date-cell,
        .rbc-agenda-time-cell,
        .rbc-agenda-event-cell {
          padding: 12px 16px;
        }
        
        /* Month view event limit */
        .rbc-row-segment {
          padding: 2px 4px;
        }
        
        /* Borders */
        .rbc-month-view,
        .rbc-time-view {
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          overflow: hidden;
        }
        
        .rbc-day-bg {
          border-left: 1px solid hsl(var(--border) / 0.5);
        }
        
        .rbc-month-row {
          border-top: 1px solid hsl(var(--border));
          min-height: 100px;
        }
        
        /* Responsive improvements */
        @media (max-width: 768px) {
          .rbc-toolbar {
            flex-direction: column;
            gap: 8px;
          }
          
          .rbc-toolbar-label {
            order: -1;
            text-align: center;
          }
          
          .rbc-event {
            font-size: 11px;
            padding: 2px 4px;
          }
        }

        /* Light Mode Gradient Border */
        .calendar-card-light::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(120deg, #6366f1, #a855f7, #6366f1);
          background-size: 200% 200%;
          animation: borderFlow 6s ease infinite;
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          z-index: -1;
        }
        @keyframes borderFlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Events Calendar</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Career</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Sports</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Cultural</span>
          </div>
        </div>
      </div>

      <div
        className={`relative border rounded-lg p-6 bg-card z-0 transition-all duration-300 overflow-x-auto ${!isDark ? 'calendar-card-light' : ''}`}
        style={{ minHeight: '750px' }}
      >
        {isMounted && isDark && (
          <div className="absolute inset-0 -z-10 pointer-events-none rounded-lg">
            <PulsingBorder
              colors={['#6366f1']}
              colorBack="#ffffff00"
              intensity={0.15}
              bloom={0.2}
              pulse={0.1}
              speed={0.9}
              scale={1}
              fit="cover"
              thickness={0.02}
              style={{
                width: '100%',
                height: '100%',
                display: 'block'
              }}
            />
          </div>
        )}
        <div className="min-w-[700px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 700 }}
            onSelectEvent={handleSelectEvent}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            views={['month', 'week', 'day', 'agenda']}
            defaultView="month"
            step={30}
            timeslots={2}
            min={new Date(2024, 0, 1, 7, 0, 0)}
            max={new Date(2024, 0, 1, 22, 0, 0)}
            showMultiDayTimes
            popup
            eventPropGetter={eventStyleGetter}
            components={{
              event: EventComponent
            }}
          />
        </div>
      </div>
    </div>
  );
}
