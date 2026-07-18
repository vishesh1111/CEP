'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Event, Registration, CATEGORY_COLORS } from '@/types/database';
import { cn, formatDate, isDeadlinePassed, getSeatsPercentage } from '@/lib/utils';
import { motion } from 'framer-motion';
import { RegisterButton } from './register-button';

interface EventCardProps {
  event: Event;
  userRegistration?: Registration;
  index?: number;
}

export function EventCard({ event, userRegistration, index = 0 }: EventCardProps) {
  const router = useRouter();
  
  const seatsPercentage = getSeatsPercentage(event.seats_remaining, event.total_seats);
  let seatsColor = 'text-green-600';
  if (seatsPercentage < 10 || event.seats_remaining === 0) seatsColor = 'text-red-600';
  else if (seatsPercentage < 50) seatsColor = 'text-amber-600';

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
        className="group overflow-hidden flex flex-col h-full cursor-pointer transition-shadow hover:shadow-xl border-border/50"
        onClick={() => router.push(`/events/${event.id}`)}
      >
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
              {event.seats_remaining} / {event.total_seats} seats left
            </span>
          </div>
        </div>
      </CardContent>
      
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
