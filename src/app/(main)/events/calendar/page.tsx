'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, momentLocalizer, Event, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { CATEGORY_COLORS } from '@/types/database';
import { useTheme } from 'next-themes';
import { PulsingBorder } from '@paper-design/shaders-react';
import { ChevronLeft, ChevronRight, CalendarDays, List, Clock, Grid3X3 } from 'lucide-react';
import Link from 'next/link';

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

// Mobile-optimized calendar list view
function MobileCalendarView({ events, currentDate, onNavigate }: { events: EventData[]; currentDate: Date; onNavigate: (date: Date) => void }) {
  const month = moment(currentDate);
  const startOfMonth = month.clone().startOf('month');
  const endOfMonth = month.clone().endOf('month');

  // Filter events for current month
  const monthEvents = events
    .filter(e => moment(e.start).isBetween(startOfMonth, endOfMonth, undefined, '[]'))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  // Group events by date
  const groupedEvents: Record<string, EventData[]> = {};
  monthEvents.forEach(event => {
    const dateKey = moment(event.start).format('YYYY-MM-DD');
    if (!groupedEvents[dateKey]) groupedEvents[dateKey] = [];
    groupedEvents[dateKey].push(event);
  });

  const CALENDAR_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    technology: { bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-500', text: 'text-blue-700 dark:text-blue-300' },
    cultural: { bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-500', text: 'text-purple-700 dark:text-purple-300' },
    workshop: { bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-500', text: 'text-amber-700 dark:text-amber-300' },
    sports: { bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-500', text: 'text-green-700 dark:text-green-300' },
    seminar: { bg: 'bg-rose-100 dark:bg-rose-900/30', border: 'border-rose-500', text: 'text-rose-700 dark:text-rose-300' },
    social: { bg: 'bg-pink-100 dark:bg-pink-900/30', border: 'border-pink-500', text: 'text-pink-700 dark:text-pink-300' },
    general: { bg: 'bg-gray-100 dark:bg-gray-800/50', border: 'border-gray-500', text: 'text-gray-700 dark:text-gray-300' },
  };

  // Generate mini calendar grid
  const daysInMonth = month.daysInMonth();
  const firstDayOfWeek = startOfMonth.day();
  const today = moment();

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate(month.clone().subtract(1, 'month').toDate())}
          className="p-2 rounded-lg hover:bg-muted/80 transition-colors border border-border/50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold tracking-tight">{month.format('MMMM YYYY')}</h2>
        <button
          onClick={() => onNavigate(month.clone().add(1, 'month').toDate())}
          className="p-2 rounded-lg hover:bg-muted/80 transition-colors border border-border/50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Mini Calendar Grid */}
      <div className="bg-card rounded-xl border border-border/50 p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-xs font-semibold text-muted-foreground py-1">
              {day}
            </div>
          ))}
        </div>
        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before the 1st */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {/* Day numbers */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateKey = month.clone().date(day).format('YYYY-MM-DD');
            const hasEvents = !!groupedEvents[dateKey];
            const isToday = today.isSame(month.clone().date(day), 'day');

            return (
              <div
                key={day}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative transition-colors ${
                  isToday
                    ? 'bg-primary text-primary-foreground font-bold'
                    : hasEvents
                    ? 'bg-primary/10 font-medium'
                    : ''
                }`}
              >
                {day}
                {hasEvents && !isToday && (
                  <div className="absolute bottom-0.5 flex gap-0.5">
                    {groupedEvents[dateKey].slice(0, 3).map((ev, idx) => {
                      const col = CALENDAR_COLORS[ev.category] || CALENDAR_COLORS.general;
                      return <div key={idx} className={`w-1 h-1 rounded-full ${col.border.replace('border-', 'bg-')}`} />;
                    })}
                  </div>
                )}
                {hasEvents && isToday && (
                  <div className="absolute bottom-0.5 flex gap-0.5">
                    {groupedEvents[dateKey].slice(0, 3).map((_, idx) => (
                      <div key={idx} className="w-1 h-1 rounded-full bg-primary-foreground" />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {Object.keys(groupedEvents).length === 0 ? (
          <div className="text-center py-12 px-4">
            <CalendarDays className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No events this month</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Try navigating to a different month</p>
          </div>
        ) : (
          Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
            <div key={dateKey}>
              <div className="flex items-center gap-2 mb-2">
                <div className="text-sm font-semibold text-primary">
                  {moment(dateKey).format('ddd, MMM D')}
                </div>
                {moment(dateKey).isSame(today, 'day') && (
                  <span className="text-[10px] font-bold uppercase bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
                <div className="flex-1 h-px bg-border/50" />
              </div>
              <div className="space-y-2">
                {dayEvents.map(event => {
                  const color = CALENDAR_COLORS[event.category] || CALENDAR_COLORS.general;
                  return (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className={`block p-3 rounded-xl border-l-4 ${color.border} ${color.bg} active:scale-[0.98] transition-all`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-sm truncate ${color.text}`}>
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>{moment(event.start).format('h:mm A')}</span>
                            <span className="text-muted-foreground/50">•</span>
                            <span className="truncate">{event.venue}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${color.bg} ${color.text} border border-current/20`}>
                          {event.category}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const supabase = createClient();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const mql = window.matchMedia('(max-width: 768px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
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

      {/* Mobile Calendar View */}
      {isMounted && isMobile && (
        <div
          className={`relative border rounded-xl p-4 bg-card z-0 transition-all duration-300 ${!isDark ? 'calendar-card-light' : ''}`}
        >
          {isDark && (
            <div className="absolute inset-0 -z-10 pointer-events-none rounded-xl overflow-hidden">
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
          <MobileCalendarView
            events={events}
            currentDate={date}
            onNavigate={setDate}
          />
        </div>
      )}

      {/* Desktop Calendar View */}
      {isMounted && !isMobile && (
        <div
          className={`relative border rounded-lg p-6 bg-card z-0 transition-all duration-300 overflow-x-auto ${!isDark ? 'calendar-card-light' : ''}`}
          style={{ minHeight: '750px' }}
        >
          {isDark && (
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
      )}

      {/* Loading placeholder before mount */}
      {!isMounted && (
        <div className="border rounded-lg p-6 bg-card" style={{ minHeight: '400px' }}>
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
}
