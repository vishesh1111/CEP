'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createAnnouncement } from '@/lib/actions/announcements';

const formSchema = z.object({
  type: z.enum(['general', 'event']),
  eventId: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
}).refine((data) => {
  if (data.type === 'event') {
    return !!data.eventId;
  }
  return true;
}, {
  message: 'Please select an event',
  path: ['eventId'],
});

type FormValues = z.infer<typeof formSchema>;

interface AnnouncementFormProps {
  events: { id: string; title: string }[];
}

export function AnnouncementForm({ events }: AnnouncementFormProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'general',
      eventId: undefined,
      title: '',
      message: '',
    },
  });

  const announcementType = form.watch('type');

  async function onSubmit(data: FormValues) {
    setIsPending(true);
    
    try {
      const result = await createAnnouncement({
        title: data.title,
        message: data.message,
        event_id: data.type === 'event' ? data.eventId : undefined,
      });
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Announcement created successfully!');
        form.reset();
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Megaphone className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Create Announcement</h2>
          <p className="text-sm text-muted-foreground">
            Send messages to students
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Announcement Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Announcement Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || 'general'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="general">General (All Users)</SelectItem>
                    <SelectItem value="event">Event-Specific</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {announcementType === 'general' 
                    ? 'Visible to all users on the platform' 
                    : 'Only visible to users registered for the selected event'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Event Selection (conditional) */}
          {announcementType === 'event' && (
            <FormField
              control={form.control}
              name="eventId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Event</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an event" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The announcement will only be shown to users registered for this event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Important Update" 
                    disabled={isPending} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Message */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter your announcement message here..."
                    className="min-h-[120px]"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Be clear and concise. Students will see this on their dashboard.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Announcement
          </Button>
        </form>
      </Form>
    </div>
  );
}
