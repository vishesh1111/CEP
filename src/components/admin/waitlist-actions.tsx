'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { UserCheck, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { promoteFromWaitlist, removeFromWaitlist } from '@/lib/actions/admin-waitlist';

interface WaitlistActionsProps {
  waitlistId: string;
  eventId: string;
  userName: string;
  position: number;
  seatsRemaining: number;
}

export function WaitlistActions({
  waitlistId,
  eventId,
  userName,
  position,
  seatsRemaining,
}: WaitlistActionsProps) {
  const [isPromoting, setIsPromoting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  const canPromote = seatsRemaining > 0;

  const handlePromote = async () => {
    setIsPromoting(true);
    try {
      const result = await promoteFromWaitlist(waitlistId, eventId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message || 'User promoted to confirmed registration');
      }
    } catch (error) {
      toast.error('Failed to promote user');
    } finally {
      setIsPromoting(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      const result = await removeFromWaitlist(waitlistId, eventId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('User removed from waitlist');
        setRemoveDialogOpen(false);
      }
    } catch (error) {
      toast.error('Failed to remove from waitlist');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Promote to Confirmed */}
      {!canPromote ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium h-9 px-3 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 opacity-50 cursor-not-allowed">
                <UserCheck className="h-4 w-4" />
                <span>Promote</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>No seats available</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handlePromote}
          disabled={isPromoting}
          className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/50 hover:text-green-800 dark:hover:text-green-300"
        >
          {isPromoting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
          ) : (
            <UserCheck className="h-4 w-4 mr-1.5" />
          )}
          Promote
        </Button>
      )}

      {/* Remove from Waitlist */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRemoveDialogOpen(true)}
          disabled={isRemoving}
          className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/50 hover:text-red-800 dark:hover:text-red-300"
        >
          {isRemoving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
          ) : (
            <X className="h-4 w-4 mr-1.5" />
          )}
          Remove
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Waitlist?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{userName}</strong> from the waitlist (position #{position}).
              <br />
              <br />
              They will no longer be automatically registered if a spot opens up.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={handleRemove}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Removing...
                </>
              ) : (
                'Remove from Waitlist'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
