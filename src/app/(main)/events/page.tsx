import { Suspense } from 'react';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { EventFilters } from '@/components/events/event-filters';
import { EventGrid } from '@/components/events/event-grid';
import { EventGridSkeleton } from '@/components/events/event-grid-skeleton';
import { EventCategory } from '@/types/database';

export const metadata: Metadata = {
  title: 'Events | College Event Portal',
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined;
  const category = typeof resolvedParams.category === 'string' && resolvedParams.category !== 'all' 
    ? (resolvedParams.category as EventCategory) 
    : undefined;
  const sort = typeof resolvedParams.sort === 'string' ? resolvedParams.sort : 'date_asc';
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let userRegistrations: any[] = [];
  if (user) {
    const { data } = await supabase
      .from('registrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'confirmed');
    if (data) userRegistrations = data;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Explore Events</h1>
        <p className="text-muted-foreground">Discover and register for upcoming events on campus.</p>
      </div>

      <EventFilters />

      <Suspense fallback={<EventGridSkeleton />}>
        <EventList 
          search={search} 
          category={category} 
          sort={sort} 
          userRegistrations={userRegistrations} 
        />
      </Suspense>
    </div>
  );
}

async function EventList({ 
  search, 
  category, 
  sort, 
  userRegistrations 
}: { 
  search?: string; 
  category?: EventCategory; 
  sort: string;
  userRegistrations: any[];
}) {
  const supabase = await createClient();
  
  let query = supabase.from('events').select('*');
  
  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  
  if (category) {
    query = query.eq('category', category);
  }
  
  if (sort === 'date_asc') query = query.order('event_date', { ascending: true });
  else if (sort === 'date_desc') query = query.order('event_date', { ascending: false });
  else if (sort === 'seats_desc') query = query.order('seats_remaining', { ascending: false });
  else if (sort === 'seats_asc') query = query.order('seats_remaining', { ascending: true });

  const { data: events, error } = await query;
  
  if (error) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-md">Error loading events: {error.message}</div>;
  }

  return <EventGrid events={events || []} userRegistrations={userRegistrations} />;
}
