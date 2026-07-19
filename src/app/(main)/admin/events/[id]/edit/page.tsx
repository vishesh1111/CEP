import { createClient } from '@/lib/supabase/server';
import EventForm from '@/components/admin/event-form';
import { updateEvent } from '@/lib/actions/events';
import { notFound } from 'next/navigation';
import { DeleteEventButton } from '@/components/admin/delete-event-button';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: event } = await supabase.from('events').select('*').eq('id', resolvedParams.id).single();

  if (!event) {
    notFound();
  }

  const handleUpdate = async (formData: any) => {
    'use server';
    return updateEvent(resolvedParams.id, formData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8 px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Event: {event.title}</h1>
        <DeleteEventButton eventId={resolvedParams.id} eventTitle={event.title} />
      </div>
      <EventForm initialData={event} onSubmitAction={handleUpdate as any} />
    </div>
  );
}
