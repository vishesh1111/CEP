'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2, Ban, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { removeUserRegistration, banUserFromEvent } from '@/lib/actions/admin-registrations';

interface RegistrationActionsProps {
  registrationId: string;
  eventId: string;
  userId: string;
  userName: string;
  eventTitle: string;
}

export function RegistrationActions({
  registrationId,
  eventId,
  userId,
  userName,
  eventTitle,
}: RegistrationActionsProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isBanning, setIsBanning] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      const result = await removeUserRegistration(registrationId, eventId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Registration removed successfully');
        setRemoveDialogOpen(false);
      }
    } catch (error) {
      toast.error('Failed to remove registration');
    } finally {
      setIsRemoving(false);
    }
  };

  const handleBan = async () => {
    setIsBanning(true);
    try {
      const result = await banUserFromEvent(userId, eventId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${userName} has been banned from this event`);
        setBanDialogOpen(false);
      }
    } catch (error) {
      toast.error('Failed to ban user');
    } finally {
      setIsBanning(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Remove Registration */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogTrigger
          className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 text-destructive hover:text-destructive cursor-pointer"
          disabled={isRemoving}
        >
          {isRemoving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          <span>Remove</span>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Registration?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{userName}'s</strong> registration for{' '}
              <strong>{eventTitle}</strong>. The seat will become available again.
              <br />
              <br />
              The user will be able to register again if they want.
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
                'Remove Registration'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban from Event */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogTrigger
          className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-orange-200 bg-background hover:bg-orange-50 h-9 px-3 text-orange-600 hover:text-orange-700 cursor-pointer"
          disabled={isBanning}
        >
          {isBanning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Ban className="h-4 w-4" />
          )}
          <span>Ban</span>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban User from Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Remove <strong>{userName}'s</strong> current registration (if any)</li>
                <li>Prevent them from registering for <strong>{eventTitle}</strong> in the future</li>
                <li>Show them a message that they've been banned</li>
              </ul>
              <br />
              <strong className="text-orange-600">This is a serious action.</strong> Use it only for users who violate event rules.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={handleBan}
              disabled={isBanning}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              {isBanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Banning...
                </>
              ) : (
                'Ban from Event'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
