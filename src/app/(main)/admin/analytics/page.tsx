import { createClient } from '@/lib/supabase/server';
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
    <div className="container mx-auto py-8 px-4 space-y-6 animate-fade-in-up">
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
