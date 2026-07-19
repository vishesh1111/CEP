'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Event, Registration, CATEGORY_COLORS } from '@/types/database';
import { cn, formatDate, isDeadlinePassed, getSeatsPercentage } from '@/lib/utils';
import { motion } from 'framer-motion';
import { RegisterButton } from './register-button';
import { ShareButton } from './share-button';

interface EventCardProps {
  event: Event;
  userRegistration?: Registration;
  waitlistCount?: number;
  index?: number;
}

export function EventCard({ event, userRegistration, waitlistCount = 0, index = 0 }: EventCardProps) {
  // getSeatsPercentage returns FILL percentage (how much is taken)
  const fillPercentage = getSeatsPercentage(event.seats_remaining, event.total_seats);
  
  // Color logic: >90% filled = red, >50% filled = amber, else green
  let seatsColor = 'text-green-600';
  let progressColor = 'bg-green-600';
  
  if (fillPercentage > 90 || event.seats_remaining === 0) {
    seatsColor = 'text-red-600';
    progressColor = 'bg-red-600';
  } else if (fillPercentage > 50) {
    seatsColor = 'text-amber-600';
    progressColor = 'bg-amber-600';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.5), type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card 
        className="group overflow-hidden flex flex-col h-full cursor-pointer transition-all hover:shadow-xl border-border/50 active:scale-[0.98]"
      >
      <Link href={`/events/${event.id}`} prefetch={true} className="block">
        <div className="relative h-48 w-full bg-muted">
          {event.banner_url ? (
            <Image src={event.banner_url} alt={event.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <span className="text-muted-foreground font-medium">No Image</span>
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge className={cn("capitalize shadow-sm", CATEGORY_COLORS[event.category])}>
              {event.category}
            </Badge>
            {userRegistration?.status === 'confirmed' && (
              <Badge variant="default" className="bg-green-600 hover:bg-green-700 shadow-sm">
                Registered ✓
              </Badge>
            )}
          </div>
          <div className="absolute top-3 left-3" onClick={(e) => e.stopPropagation()}>
            <ShareButton eventId={event.id} eventTitle={event.title} variant="ghost" size="icon" />
          </div>
        </div>
      
        <CardContent className="p-5 flex-grow">
          <h3 className="font-semibold text-lg line-clamp-1 mb-2">{event.title}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {event.description}
          </p>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>{formatDate(event.event_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 shrink-0" />
              <span className={cn("font-medium", seatsColor)}>
                {event.seats_remaining === 0 ? 'Event Full' : `${event.total_seats - event.seats_remaining} / ${event.total_seats} registered`}
              </span>
            </div>
            <div className="mt-2">
              <div className="relative flex h-1.5 w-full items-center overflow-hidden rounded-full bg-muted">
                <div 
                  className={cn("h-full transition-all", progressColor)}
                  style={{ width: `${fillPercentage}%` }}
                />
              </div>
              {event.seats_remaining === 0 && waitlistCount > 0 && (
                <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                  {waitlistCount} {waitlistCount === 1 ? 'person' : 'people'} waiting
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
      
      <CardFooter className="p-5 pt-0 mt-auto" onClick={(e) => e.stopPropagation()}>
        <RegisterButton 
          eventId={event.id}
          deadline={event.registration_deadline}
          seatsRemaining={event.seats_remaining}
          existingRegistration={userRegistration}
          className="w-full"
        />
      </CardFooter>
      </Card>
    </motion.div>
  );
}
