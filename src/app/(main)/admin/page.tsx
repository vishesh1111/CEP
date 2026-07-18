import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, CalendarDays, CheckCircle, Ticket, Plus, FileText, BarChart3, QrCode } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { Event } from '@/types/database';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

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
  const { count: checkedInCount } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('checked_in', true);

  // Recent registrations
  const { data: recentRegistrations } = await supabase
    .from('registrations')
    .select('*, users!inner(name, email), events!inner(title)')
    .order('registered_at', { ascending: false })
    .limit(10);

  const quickActions = [
    { href: '/admin/events/new', icon: Plus, label: 'Create Event', color: 'bg-primary/10 text-primary' },
    { href: '/admin/events', icon: CalendarDays, label: 'Manage Events', color: 'bg-blue-500/10 text-blue-500' },
    { href: '/admin/announcements', icon: FileText, label: 'Announcements', color: 'bg-amber-500/10 text-amber-500' },
    { href: '/admin/check-in', icon: QrCode, label: 'QR Check-in', color: 'bg-green-500/10 text-green-500' },
    { href: '/admin/analytics', icon: BarChart3, label: 'Analytics', color: 'bg-purple-500/10 text-purple-500' },
  ];

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage events, registrations, and announcements.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Registrations</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrationsCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkedInCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-24 flex flex-col gap-2 rounded-xl hover:shadow-md transition-all'
              )}
            >
              <div className={cn('p-2 rounded-lg', action.color)}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Registrations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRegistrations?.map((reg: Record<string, unknown>) => {
              const users = reg.users as { name: string; email: string } | null;
              const events = reg.events as { title: string } | null;
              return (
                <div key={reg.id as string} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{users?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground truncate">{events?.title || 'Unknown Event'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={reg.status === 'confirmed' ? 'default' : 'secondary'}>
                      {reg.status as string}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(reg.registered_at as string)}
                    </span>
                  </div>
                </div>
              );
            })}
            {(!recentRegistrations || recentRegistrations.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-8">No recent registrations.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
