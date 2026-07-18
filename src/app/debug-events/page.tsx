import { createClient } from '@/lib/supabase/server';

export default async function DebugEventsPage() {
  const supabase = await createClient();
  
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });
  
  const { data: testEvents } = await supabase
    .from('events')
    .select('*')
    .like('title', '[TEST]%');
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Database Debug</h1>
      
      <div className="bg-card border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Summary</h2>
        <p>Total events in database: <strong>{events?.length || 0}</strong></p>
        <p>Test events: <strong>{testEvents?.length || 0}</strong></p>
        {error && <p className="text-red-500 mt-2">Error: {error.message}</p>}
      </div>
      
      {events && events.length > 0 ? (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">All Events</h2>
          <div className="space-y-4">
            {events.map((event: any) => (
              <div key={event.id} className="border-b pb-4 last:border-0">
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <p><strong>ID:</strong> {event.id}</p>
                  <p><strong>Category:</strong> {event.category}</p>
                  <p><strong>Seats:</strong> {event.seats_remaining}/{event.total_seats}</p>
                  <p><strong>Event Date:</strong> {new Date(event.event_date).toLocaleString()}</p>
                  <p><strong>Venue:</strong> {event.venue}</p>
                  <p><strong>Created:</strong> {new Date(event.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2 text-yellow-800">No Events Found</h2>
          <p className="text-yellow-700">The events table is empty or there's a permission issue.</p>
          <div className="mt-4">
            <p className="font-semibold mb-2">Try these steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Visit <code className="bg-yellow-100 px-1 rounded">/api/seed-events</code> to insert test data</li>
              <li>Check Supabase dashboard → Table Editor → events table</li>
              <li>Check RLS policies on events table (should allow SELECT for authenticated/anon users)</li>
            </ol>
          </div>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> If you see events here but not on /events page, there might be a filtering issue.
        </p>
      </div>
    </div>
  );
}
