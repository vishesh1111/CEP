'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, QrCode, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { cancelRegistration } from '@/lib/actions/registration';
import { RegistrationWithEvent } from '@/types/database';
import { formatDate } from '@/lib/utils';

interface RegistrationCardProps {
  registration: RegistrationWithEvent;
  isPast: boolean;
}

export function RegistrationCard({ registration, isPast }: RegistrationCardProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const event = registration.events;

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const result = await cancelRegistration(registration.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Registration cancelled successfully');
      }
    } catch (error) {
      toast.error('An error occurred while cancelling');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-sm transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row h-full">
          <div className="p-5 flex-grow space-y-3">
            <div>
              <div className="flex items-start justify-between gap-2">
                <Link href={`/events/${event.id}`} className="hover:underline">
                  <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
                </Link>
                {registration.checked_in && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 whitespace-nowrap">
                    Checked In
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Registered on {formatDate(registration.registered_at)}
              </div>
            </div>
            
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>{formatDate(event.event_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="line-clamp-1">{event.venue}</span>
              </div>
            </div>
          </div>
          
          {!isPast && (
            <div className="bg-muted/30 border-t sm:border-t-0 sm:border-l p-4 flex sm:flex-col items-center justify-end sm:justify-center gap-2 sm:w-32 shrink-0">
              {registration.qr_code && (
                <Dialog open={qrOpen} onOpenChange={setQrOpen}>
                  <DialogTrigger className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "w-full cursor-pointer")}>
                      <QrCode className="w-4 h-4 mr-2 sm:mr-0 lg:mr-2" />
                      <span className="sm:hidden lg:inline">QR Code</span>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Event Entry Pass</DialogTitle>
                      <DialogDescription>
                        Present this QR code at {event.venue} for check-in.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border my-4">
                      <QRCodeSVG value={registration.qr_code} size={200} />
                      <div className="mt-4 font-semibold text-center text-black">{event.title}</div>
                      <div className="text-sm text-gray-500 mt-1">{formatDate(event.event_date)}</div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              <AlertDialog>
                <AlertDialogTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), "w-full text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer")}>
                    <Trash2 className="w-4 h-4 mr-2 sm:mr-0 lg:mr-2" />
                    <span className="sm:hidden lg:inline">Cancel</span>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Registration?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel your registration for <span className="font-semibold text-foreground">{event.title}</span>? This action cannot be undone and your seat will be given to someone else.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Registration</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={(e) => {
                        e.preventDefault();
                        handleCancel();
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isCancelling}
                    >
                      {isCancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Yes, Cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
