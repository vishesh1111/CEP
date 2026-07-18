import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, MapPin, Users, AlertCircle, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RegisterButton } from '@/components/events/register-button';
import { CATEGORY_COLORS } from '@/types/database';
import { cn, formatDate, formatDateTime, getSeatsPercentage } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const id = (await params).id;
  const supabase = await createClient();
  const { data } = await supabase.from('events').select('title, description').eq('id', id).single() as any;
  
  if (!data) return { title: 'Event Not Found' };
  
  return {
    title: `${data.title} | College Event Portal`,
    description: data.description,
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single() as any;
    
  if (error || !event) notFound();

  let registration = null;
  if (user) {
    const { data } = await supabase
      .from('registrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('event_id', event.id)
      .eq('status', 'confirmed')
      .single() as any;
    if (data) registration = data;
  }

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .eq('event_id', event.id)
    .order('posted_at', { ascending: false }) as any;

  // getSeatsPercentage returns FILL percentage (how much is taken)
  const fillPercentage = getSeatsPercentage(event.seats_remaining, event.total_seats);
  
  // Color logic: >90% filled = red, >50% filled = amber, else green
  let progressColor = 'bg-green-600';
  if (fillPercentage > 90 || event.seats_remaining === 0) {
    progressColor = 'bg-red-600';
  } else if (fillPercentage > 50) {
    progressColor = 'bg-amber-600';
  }
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Link href="/events" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Events
      </Link>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden mb-8">
        <div className="relative h-[300px] md:h-[400px] w-full bg-muted">
          {event.banner_url ? (
            <Image src={event.banner_url} alt={event.title} fill className="object-cover" priority />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Calendar className="w-24 h-24 text-primary/20" />
            </div>
          )}
          <div className="absolute top-4 right-4">
            <Badge className={cn("capitalize text-sm px-3 py-1 shadow-md", CATEGORY_COLORS[event.category as keyof typeof CATEGORY_COLORS])}>
              {event.category}
            </Badge>
          </div>
        </div>

        <div className="p-6 md:p-8 md:flex gap-8">
          <div className="md:w-2/3 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{event.title}</h1>
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                <p className="whitespace-pre-line text-muted-foreground">{event.description}</p>
              </div>
            </div>

            {announcements && announcements.length > 0 && (
              <div className="space-y-4 pt-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Announcements
                </h3>
                <div className="space-y-3">
                  {announcements.map((ann: any) => (
                    <div key={ann.id} className="bg-muted/50 rounded-lg p-4 flex gap-3 border">
                      <Info className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <div className="font-medium">{ann.title}</div>
                        <div className="text-sm mt-1">
                          {ann.message}
                          <div className="text-xs text-muted-foreground mt-2">
                            Posted on {formatDate(ann.posted_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="md:w-1/3 mt-8 md:mt-0 space-y-6">
            <div className="bg-muted/30 p-5 rounded-lg border space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Event Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Date</div>
                    <div className="text-sm text-muted-foreground">{formatDate(event.event_date)}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Registration Deadline</div>
                    <div className="text-sm text-muted-foreground">{formatDateTime(event.registration_deadline)}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Venue</div>
                    <div className="text-sm text-muted-foreground">{event.venue}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">Availability</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                      <span>{event.seats_remaining} of {event.total_seats} seats</span>
                      {fillPercentage > 80 && event.seats_remaining > 0 && (
                        <Badge variant="destructive" className="h-5 text-[10px] uppercase">Filling Fast</Badge>
                      )}
                    </div>
                    <div className="relative flex h-2 w-full items-center overflow-hidden rounded-full bg-muted">
                      <div 
                        className={cn("h-full transition-all", progressColor)}
                        style={{ width: `${fillPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />
              
              {registration ? (
                <div className="space-y-4 pt-2">
                  <div className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 p-3 rounded-md text-sm font-medium text-center border border-green-200 dark:border-green-900">
                    You are registered for this event!
                  </div>
                  {registration.qr_code && (
                    <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 rounded-lg border">
                      <QRCodeSVG value={registration.qr_code} size={150} />
                      <div className="mt-3 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono break-all text-center">
                        {registration.qr_code}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Show this QR code at the venue for check-in
                      </p>
                    </div>
                  )}
                  <Link href="/dashboard" className="block w-full">
                    <Button variant="outline" className="w-full">Manage Registration</Button>
                  </Link>
                </div>
              ) : (
                <RegisterButton 
                  eventId={event.id}
                  deadline={event.registration_deadline}
                  seatsRemaining={event.seats_remaining}
                  className="w-full h-12 text-md"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
