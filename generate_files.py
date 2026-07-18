import os

base_dir = "/Users/visheshverma/Documents/EUPAY/campus-events"

files = {
    "src/lib/actions/events.ts": """'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createEvent(formData: {
  title: string; description: string; banner_url?: string;
  category: string; venue: string; event_date: string;
  registration_deadline: string; total_seats: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase.from('events').insert({
    ...formData,
    seats_remaining: formData.total_seats,
    created_by: user.id,
  }).select().single();

  if (error) return { error: error.message };
  revalidatePath('/events');
  revalidatePath('/admin');
  return { data };
}

export async function updateEvent(eventId: string, formData: Partial<{
  title: string; description: string; banner_url: string;
  category: string; venue: string; event_date: string;
  registration_deadline: string; total_seats: number;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase.from('events').update(formData).eq('id', eventId).select().single();

  if (error) return { error: error.message };
  revalidatePath('/events');
  revalidatePath('/admin');
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}/edit`);
  return { data };
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.from('events').delete().eq('id', eventId);

  if (error) return { error: error.message };
  revalidatePath('/events');
  revalidatePath('/admin');
  return { success: True };
}
""",

    "src/lib/actions/announcements.ts": """'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createAnnouncement(formData: {
  event_id?: string;
  title: string;
  message: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase.from('announcements').insert({
    ...formData,
    posted_by: user.id,
  }).select().single();

  if (error) return { error: error.message };
  revalidatePath('/admin/announcements');
  if (formData.event_id) {
    revalidatePath(`/events/${formData.event_id}`);
  } else {
    revalidatePath('/');
  }
  return { data };
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.from('announcements').delete().eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/admin/announcements');
  return { success: true };
}
""",

    "src/lib/actions/checkin.ts": """'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function checkInRegistration(qrCode: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase.rpc('check_in_registration', { qr_code_param: qrCode });

  if (error) return { error: error.message };
  revalidatePath('/admin/check-in');
  return { data };
}
""",

    "src/lib/actions/profile.ts": """'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: { name?: string; avatar_url?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase.from('users').update(formData).eq('id', user.id).select().single();

  if (error) return { error: error.message };
  revalidatePath('/profile');
  return { data };
}
""",

    "src/app/(main)/admin/page.tsx": """import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CalendarDays, CheckCircle, Ticket, Plus, FileText, BarChart } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Event, RegistrationWithUser } from '@/types/database';

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch stats
  const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true });
  const { count: registrationsCount } = await supabase.from('registrations').select('*', { count: 'exact', head: true });
  const { count: studentsCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student');
  const { data: upcomingEvents } = await supabase.from('events').select('*').gte('event_date', new Date().toISOString()).order('event_date', { ascending: true }).limit(5) as { data: Event[] };
  
  // Recent registrations
  const { data: recentRegistrations } = await supabase
    .from('registrations')
    .select('*, users(*), events(*)')
    .order('registered_at', { ascending: false })
    .limit(10) as { data: any[] };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventsCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrationsCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
          <Link href="/admin/events/new">
            <Plus className="h-6 w-6" />
            Create Event
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
          <Link href="/admin/events">
            <CalendarDays className="h-6 w-6" />
            Manage Events
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
          <Link href="/admin/announcements">
            <FileText className="h-6 w-6" />
            Announcements
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
          <Link href="/admin/check-in">
            <CheckCircle className="h-6 w-6" />
            QR Check-in
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
          <Link href="/admin/analytics">
            <BarChart className="h-6 w-6" />
            Analytics
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRegistrations?.map(reg => (
                <div key={reg.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm">{reg.users?.name}</p>
                    <p className="text-xs text-muted-foreground">{reg.events?.title}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(reg.registered_at)}
                  </div>
                </div>
              ))}
              {(!recentRegistrations || recentRegistrations.length === 0) && (
                <p className="text-sm text-muted-foreground">No recent registrations.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
""",

    "src/app/(main)/admin/events/page.tsx": """import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Event } from '@/types/database';

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase.from('events').select('*').order('event_date', { ascending: false }) as { data: Event[] };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Events Management</h1>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Seats</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {events?.map(event => (
                <tr key={event.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-4 align-middle font-medium">{event.title}</td>
                  <td className="p-4 align-middle capitalize">{event.category}</td>
                  <td className="p-4 align-middle">{formatDate(event.event_date)}</td>
                  <td className="p-4 align-middle">{event.seats_remaining} / {event.total_seats}</td>
                  <td className="p-4 align-middle text-right flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/registrations/${event.id}`}>
                        <Users className="h-4 w-4" />
                        <span className="sr-only">Registrations</span>
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/events/${event.id}/edit`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {(!events || events.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">No events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
""",

    "src/app/(main)/admin/events/new/page.tsx": """import EventForm from '@/components/admin/event-form';
import { createEvent } from '@/lib/actions/events';

export default function NewEventPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
      <EventForm onSubmitAction={createEvent as any} />
    </div>
  );
}
""",

    "src/app/(main)/admin/events/[id]/edit/page.tsx": """import { createClient } from '@/lib/supabase/server';
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
""",

    "src/components/admin/event-form.tsx": """'use client';

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
""",

    "src/app/(main)/admin/registrations/[eventId]/page.tsx": """import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Registration, User } from '@/types/database';

export default async function EventRegistrationsPage({ params }: { params: { eventId: string } }) {
  const supabase = await createClient();
  const { data: event } = await supabase.from('events').select('title').eq('id', params.eventId).single();
  const { data: registrations } = await supabase.from('registrations').select('*, users(*)').eq('event_id', params.eventId) as { data: (Registration & { users: User })[] };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/events"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Registrations: {event?.title}</h1>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Student Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Checked In</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Registration Date</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {registrations?.map(reg => (
                <tr key={reg.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-4 align-middle">{reg.users?.name}</td>
                  <td className="p-4 align-middle">{reg.users?.email}</td>
                  <td className="p-4 align-middle">
                    <Badge variant={reg.status === 'confirmed' ? 'default' : 'destructive'}>{reg.status}</Badge>
                  </td>
                  <td className="p-4 align-middle">
                    <Badge variant={reg.checked_in ? 'default' : 'secondary'}>{reg.checked_in ? 'Yes' : 'No'}</Badge>
                  </td>
                  <td className="p-4 align-middle">{formatDate(reg.registered_at)}</td>
                </tr>
              ))}
              {(!registrations || registrations.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">No registrations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
""",

    "src/app/(main)/admin/announcements/page.tsx": """import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { deleteAnnouncement } from '@/lib/actions/announcements';

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const { data: announcements } = await supabase.from('announcements').select('*, events(title)').order('posted_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
      <div className="space-y-4">
        {announcements?.map(ann => (
          <div key={ann.id} className="p-4 border rounded-md relative group">
            <h3 className="font-semibold">{ann.title}</h3>
            {ann.events && <p className="text-sm text-muted-foreground mb-2">Event: {ann.events.title}</p>}
            <p className="text-sm mt-2">{ann.message}</p>
            <p className="text-xs text-muted-foreground mt-4">{formatDate(ann.posted_at)}</p>
            
            <form action={async () => {
              'use server';
              await deleteAnnouncement(ann.id);
            }} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button type="submit" variant="destructive" size="icon">
                <Trash className="h-4 w-4" />
              </Button>
            </form>
          </div>
        ))}
        {(!announcements || announcements.length === 0) && (
          <p className="text-muted-foreground">No announcements found.</p>
        )}
      </div>
    </div>
  );
}
""",

    "src/app/(main)/admin/check-in/page.tsx": """'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { checkInRegistration } from '@/lib/actions/checkin';
import { toast } from 'sonner';

const QrScanner = dynamic(() => import('@/components/admin/qr-scanner'), { ssr: false });

export default function CheckInPage() {
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScan = async (code: string) => {
    setLoading(true);
    const res = await checkInRegistration(code);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success('Successfully checked in!');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-center">QR Check-in</h1>
      
      <div className="p-4 border rounded-md bg-muted/50">
        <QrScanner onScan={handleScan} />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or manual entry</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Input 
          placeholder="Enter QR code string..." 
          value={manualCode} 
          onChange={e => setManualCode(e.target.value)} 
        />
        <Button onClick={() => handleScan(manualCode)} disabled={!manualCode || loading}>
          Check In
        </Button>
      </div>
    </div>
  );
}
""",

    "src/components/admin/qr-scanner.tsx": """'use client';
import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QrScanner({ onScan }: { onScan: (text: string) => void }) {
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false);
    
    scanner.render((decodedText) => {
      if (!scanned) {
        setScanned(true);
        onScan(decodedText);
        setTimeout(() => setScanned(false), 3000); // prevent multi scans
      }
    }, (error) => {
      // ignore
    });

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScan, scanned]);

  return <div id="qr-reader" className="w-full" />;
}
""",

    "src/app/(main)/admin/analytics/page.tsx": """import { createClient } from '@/lib/supabase/server';
import AnalyticsCharts from '@/components/admin/analytics-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase.from('events').select('*');
  const { data: registrations } = await supabase.from('registrations').select('*');

  const totalEvents = events?.length || 0;
  const totalRegs = registrations?.length || 0;
  const checkedIn = registrations?.filter(r => r.checked_in).length || 0;
  const checkInRate = totalRegs ? Math.round((checkedIn / totalRegs) * 100) : 0;

  let totalSeats = 0;
  let remainingSeats = 0;
  events?.forEach(e => {
    totalSeats += e.total_seats;
    remainingSeats += e.seats_remaining;
  });
  const fillRate = totalSeats ? Math.round(((totalSeats - remainingSeats) / totalSeats) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Events</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalEvents}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Registrations</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalRegs}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Check-in Rate</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{checkInRate}%</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Average Fill Rate</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{fillRate}%</div></CardContent>
        </Card>
      </div>

      <AnalyticsCharts events={events || []} registrations={registrations || []} />
    </div>
  );
}
""",

    "src/components/admin/analytics-charts.tsx": """'use client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export default function AnalyticsCharts({ events, registrations }: { events: any[], registrations: any[] }) {
  // Process data for charts
  const categories = events.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const pieData = Object.entries(categories).map(([name, value]) => ({ name, value }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const barData = events.map(e => ({
    name: e.title.substring(0, 10) + '...',
    filled: e.total_seats - e.seats_remaining,
    total: e.total_seats
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-4 border rounded-md bg-card">
        <h3 className="font-semibold mb-4">Events by Category</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="p-4 border rounded-md bg-card">
        <h3 className="font-semibold mb-4">Seats Filled per Event</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" fontSize={10} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="filled" fill="#8884d8" name="Filled Seats" />
              <Bar dataKey="total" fill="#82ca9d" name="Total Seats" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
""",

    "src/app/(main)/profile/page.tsx": """'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateProfile } from '@/lib/actions/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { User } from '@/types/database';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single();
        setUser(data);
      }
      setLoading(false);
    }
    loadProfile();
  }, [supabase]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);
    const form = new FormData(e.currentTarget);
    const name = form.get('name') as string;
    
    const res = await updateProfile({ name });
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success('Profile updated');
      setUser(prev => prev ? { ...prev, name } : null);
    }
    setUpdating(false);
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
      
      <div className="p-6 border rounded-md space-y-4">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input name="name" defaultValue={user.name} required />
          </div>
          <div>
            <label className="text-sm font-medium">Email (Cannot be changed)</label>
            <Input defaultValue={user.email} disabled />
          </div>
          <div>
            <label className="text-sm font-medium">Role</label>
            <Input defaultValue={user.role} disabled className="capitalize" />
          </div>
          <Button type="submit" disabled={updating}>
            {updating ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  );
}
""",

    "src/app/(main)/events/calendar/page.tsx": """'use client';
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
      const { data } = await supabase.from('events').select('*');
      if (data) {
        setEvents(data.map(e => ({
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
""",

    "src/app/api/email/route.ts": """import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html } = await request.json();
    
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ message: 'Email service not configured' }, { status: 200 });
    }

    const { data, error } = await resend.emails.send({
      from: 'CampusEvents <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
"""
}

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)
