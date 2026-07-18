'use client';

import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { isDeadlinePassed } from '@/lib/utils';
import { registerForEvent } from '@/lib/actions/registration';
import { Registration } from '@/types/database';

interface RegisterButtonProps {
  eventId: string;
  deadline: string;
  seatsRemaining: number;
  existingRegistration?: Registration | null;
  className?: string;
}

export function RegisterButton({ 
  eventId, 
  deadline, 
  seatsRemaining, 
  existingRegistration,
  className 
}: RegisterButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const isPastDeadline = isDeadlinePassed(deadline);
  const isFull = seatsRemaining === 0;
  const isRegistered = existingRegistration?.status === 'confirmed';

  const handleRegister = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a link
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

  if (isRegistered) {
    return (
      <Button 
        variant="outline" 
        className={`bg-green-50 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-600 cursor-default ${className}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Registered
      </Button>
    );
  }

  if (isFull) {
    return (
      <Button variant="secondary" disabled className={className}>
        Event Full
      </Button>
    );
  }

  if (isPastDeadline) {
    return (
      <Button variant="secondary" disabled className={className}>
        Registration Closed
      </Button>
    );
  }

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
