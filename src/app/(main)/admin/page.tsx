import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, CalendarDays, CheckCircle, Ticket, Plus, FileText, BarChart3, QrCode, UserPlus } from 'lucide-react';
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
    { href: '/admin/invitations', icon: UserPlus, label: 'Invite Admin', color: 'bg-indigo-500/10 text-indigo-500' },
    { href: '/admin/announcements', icon: FileText, label: 'Announcements', color: 'bg-amber-500/10 text-amber-500' },
    { href: '/admin/check-in', icon: QrCode, label: 'QR Check-in', color: 'bg-green-500/10 text-green-500' },
    { href: '/admin/analytics', icon: BarChart3, label: 'Analytics', color: 'bg-purple-500/10 text-purple-500' },
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .delay-100 {
          animation-delay: 0.1s;
          opacity: 0;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
        }
        
        .delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
          opacity: 0;
        }
      `}</style>
      
      <div className="animate-fade-in-up">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Manage events, registrations, and announcements.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in-up delay-100 hover:shadow-md hover:border-primary/30 transition-all hover:-translate-y-1 border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Events</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{eventsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Campus-wide events</p>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in-up delay-200 hover:shadow-md hover:border-primary/30 transition-all hover:-translate-y-1 border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Registrations</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Ticket className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{registrationsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total sign-ups</p>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in-up delay-300 hover:shadow-md hover:border-primary/30 transition-all hover:-translate-y-1 border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Students</CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10">
              <Users className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{studentsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active accounts</p>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in-up delay-400 hover:shadow-md hover:border-primary/30 transition-all hover:-translate-y-1 border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Checked In</CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10">
              <CheckCircle className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{checkedInCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Attendance logged</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="animate-fade-in-up delay-300">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                'group h-28 flex flex-col items-center justify-center gap-3 rounded-xl border border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 hover:shadow-xl hover:scale-[1.03] hover:border-primary/50 transition-all duration-300',
                `animate-fade-in-up delay-${(index + 2) * 100}`
              )}
            >
              <div className={cn('p-3 rounded-xl transition-all duration-300 group-hover:scale-110', action.color)}>
                <action.icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold text-center px-2">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Registrations */}
      <Card className="animate-fade-in-up delay-500 hover:shadow-md hover:border-primary/30 transition-all border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-xl font-bold">Recent Registrations</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Latest student sign-ups across all events</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {recentRegistrations?.map((reg: Record<string, unknown>, index: number) => {
              const users = reg.users as { name: string; email: string } | null;
              const events = reg.events as { title: string } | null;
              return (
                <div 
                  key={reg.id as string} 
                  className="flex items-center justify-between border-b border-border/30 pb-4 last:border-0 last:pb-0 transition-all hover:bg-accent/50 p-3 rounded-lg -mx-3"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-semibold text-sm truncate">{users?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                      <CalendarDays className="h-3 w-3" />
                      {events?.title || 'Unknown Event'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <Badge 
                      variant={reg.status === 'confirmed' ? 'default' : 'secondary'} 
                      className="transition-transform hover:scale-105 font-medium"
                    >
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
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No recent registrations</p>
                <p className="text-xs text-muted-foreground mt-1">New sign-ups will appear here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
