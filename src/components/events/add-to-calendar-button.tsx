'use client';

import { CalendarPlus, Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { generateICSContent, generateGoogleCalendarUrl } from '@/lib/utils/calendar';

interface AddToCalendarButtonProps {
  title: string;
  description: string;
  eventDate: string;
  venue: string;
  eventId: string;
  className?: string;
}

export function AddToCalendarButton({
  title,
  description,
  eventDate,
  venue,
  eventId,
  className,
}: AddToCalendarButtonProps) {
  const eventData = { title, description, eventDate, venue, eventId };

  const handleDownloadICS = () => {
    const icsContent = generateICSContent(eventData);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Calendar file downloaded!');
  };

  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(eventData);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 ${className}`} aria-label="Add event to calendar">
          <CalendarPlus className="w-4 h-4" />
          Add to Calendar
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-52">
        <DropdownMenuItem onClick={handleDownloadICS} className="cursor-pointer">
          <Download className="w-4 h-4 mr-2" />
          Download .ics File
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleGoogleCalendar} className="cursor-pointer">
          <ExternalLink className="w-4 h-4 mr-2" />
          Google Calendar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
