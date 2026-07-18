'use client';
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
