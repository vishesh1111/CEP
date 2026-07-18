'use client';

import { useState } from 'react';
import { CheckCircle, Loader2, Clock, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { isDeadlinePassed } from '@/lib/utils';
import { registerForEvent } from '@/lib/actions/registration';
import { joinWaitlist, leaveWaitlist } from '@/lib/actions/waitlist';
import { Registration } from '@/types/database';

interface RegisterButtonProps {
  eventId: string;
  deadline: string;
  seatsRemaining: number;
  existingRegistration?: Registration | null;
  isOnWaitlist?: boolean;
  waitlistPosition?: number | null;
  className?: string;
}

export function RegisterButton({ 
  eventId, 
  deadline, 
  seatsRemaining, 
  existingRegistration,
  isOnWaitlist = false,
  waitlistPosition = null,
  className 
}: RegisterButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const isPastDeadline = isDeadlinePassed(deadline);
  const isFull = seatsRemaining === 0;
  const isRegistered = existingRegistration?.status === 'confirmed';

  const handleRegister = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isRegistered || isPastDeadline || isFull || isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await registerForEvent(eventId);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Successfully registered for event!");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinWaitlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await joinWaitlist(eventId);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`You're on the waitlist! Position: #${result.position}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveWaitlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await leaveWaitlist(eventId);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("You've been removed from the waitlist.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // State 1: Already registered
  if (isRegistered) {
    return (
      <Button 
        variant="outline" 
        className={`bg-green-50 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-600 cursor-default dark:bg-green-950/30 dark:text-green-400 dark:border-green-900 ${className}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Registered
      </Button>
    );
  }

  // State 2: Past deadline
  if (isPastDeadline) {
    return (
      <Button variant="secondary" disabled className={className}>
        Registration Closed
      </Button>
    );
  }

  // State 3: Full + already on waitlist
  if (isFull && isOnWaitlist) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <Button 
          variant="outline"
          className="w-full bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 hover:text-amber-700 cursor-default dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <Clock className="w-4 h-4 mr-2" />
          On Waitlist {waitlistPosition ? `(#${waitlistPosition})` : ''}
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full text-muted-foreground hover:text-destructive"
          onClick={handleLeaveWaitlist}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <X className="w-3 h-3 mr-1" />}
          Leave Waitlist
        </Button>
      </div>
    );
  }

  // State 4: Full + not on waitlist
  if (isFull) {
    return (
      <Button 
        onClick={handleJoinWaitlist} 
        disabled={isLoading}
        className={`bg-amber-600 hover:bg-amber-700 text-white ${className}`}
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
        Join Waitlist
      </Button>
    );
  }

  // State 5: Seats available — normal register
  return (
    <Button 
      onClick={handleRegister} 
      disabled={isLoading}
      className={className}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Register Now
    </Button>
  );
}
