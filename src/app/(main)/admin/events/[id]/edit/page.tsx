import { createClient } from '@/lib/supabase/server';
import EventForm from '@/components/admin/event-form';
import { updateEvent } from '@/lib/actions/events';
import { notFound } from 'next/navigation';

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: event } = await supabase.from('events').select('*').eq('id', params.id).single();

  if (!event) {
    notFound();
  }

  const handleUpdate = async (formData: any) => {
    'use server';
    return updateEvent(params.id, formData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Event: {event.title}</h1>
      <EventForm initialData={event} onSubmitAction={handleUpdate as any} />
    </div>
  );
}
