'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { EVENT_CATEGORIES } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  venue: z.string().min(1, "Venue is required"),
  event_date: z.string().min(1, "Date is required"),
  registration_deadline: z.string().min(1, "Deadline is required"),
  total_seats: z.number().min(1, "Total seats must be at least 1"),
});

export default function EventForm({ initialData, onSubmitAction }: { initialData?: any, onSubmitAction: (data: any) => Promise<any> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(initialData?.banner_url || '');
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data: any = {
      title: form.get('title'),
      description: form.get('description'),
      category: form.get('category'),
      venue: form.get('venue'),
      event_date: form.get('event_date'),
      registration_deadline: form.get('registration_deadline'),
      total_seats: parseInt(form.get('total_seats') as string, 10),
    };

    try {
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('event-banners').upload(fileName, file);
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage.from('event-banners').getPublicUrl(fileName);
        data.banner_url = publicUrlData.publicUrl;
      }

      const res = await onSubmitAction(data);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(initialData ? 'Event updated' : 'Event created');
        router.push('/admin/events');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Title</label>
        <Input name="title" defaultValue={initialData?.title} required />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea name="description" defaultValue={initialData?.description} required />
      </div>
      <div>
        <label className="text-sm font-medium">Category</label>
        <select name="category" defaultValue={initialData?.category || ''} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          <option value="" disabled>Select category</option>
          {EVENT_CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">Venue</label>
        <Input name="venue" defaultValue={initialData?.venue} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Event Date</label>
          <Input type="datetime-local" name="event_date" defaultValue={initialData?.event_date ? new Date(initialData.event_date).toISOString().slice(0, 16) : ''} required />
        </div>
        <div>
          <label className="text-sm font-medium">Registration Deadline</label>
          <Input type="datetime-local" name="registration_deadline" defaultValue={initialData?.registration_deadline ? new Date(initialData.registration_deadline).toISOString().slice(0, 16) : ''} required />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Total Seats</label>
        <Input type="number" name="total_seats" defaultValue={initialData?.total_seats} required min="1" />
      </div>
      <div>
        <label className="text-sm font-medium">Banner Image</label>
        <Input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && <img src={preview} alt="Preview" className="mt-2 h-32 object-cover rounded-md" />}
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Event'}
      </Button>
    </form>
  );
}
