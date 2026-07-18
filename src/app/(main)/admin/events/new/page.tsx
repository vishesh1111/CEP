import EventForm from '@/components/admin/event-form';
import { createEvent } from '@/lib/actions/events';

export default function NewEventPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
      <EventForm onSubmitAction={createEvent as any} />
    </div>
  );
}
