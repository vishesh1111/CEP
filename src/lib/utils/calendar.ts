// Calendar utility functions — no external dependencies needed

interface CalendarEventData {
  title: string;
  description: string;
  eventDate: string;
  venue: string;
  eventId: string;
}

/**
 * Converts a date string to the iCalendar UTC format: YYYYMMDDTHHmmssZ
 */
function toICSDate(dateString: string): string {
  const d = new Date(dateString);
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Converts a date string to Google Calendar format: YYYYMMDDTHHmmssZ
 * (same as ICS but Google uses it in URL params)
 */
function toGoogleDate(dateString: string): string {
  return toICSDate(dateString);
}

/**
 * Adds hours to a date string and returns the new ISO string
 */
function addHours(dateString: string, hours: number): string {
  const d = new Date(dateString);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

/**
 * Escapes text for ICS format (folds long lines, escapes special chars)
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generates a valid .ics file content string for an event.
 * Assumes a 2-hour event duration from event_date.
 */
export function generateICSContent(event: CalendarEventData): string {
  const startDate = toICSDate(event.eventDate);
  const endDate = toICSDate(addHours(event.eventDate, 2));
  const now = toICSDate(new Date().toISOString());

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusEvents//Event Portal//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.eventId}@campusevents`,
    `DTSTAMP:${now}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(event.description)}`,
    `LOCATION:${escapeICS(event.venue)}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${escapeICS(event.title)} starts in 30 minutes`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Generates a Google Calendar event creation URL.
 * Assumes a 2-hour event duration from event_date.
 */
export function generateGoogleCalendarUrl(event: CalendarEventData): string {
  const startDate = toGoogleDate(event.eventDate);
  const endDate = toGoogleDate(addHours(event.eventDate, 2));

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate}/${endDate}`,
    details: event.description,
    location: event.venue,
    sf: 'true',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
