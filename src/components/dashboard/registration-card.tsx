'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, QrCode, Trash2, Loader2, AlertCircle, Download, MessageSquare } from 'lucide-react';
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
import { cancelRegistration } from '@/lib/actions/registration';
import { FeedbackDialog } from '@/components/feedback/feedback-dialog';
import { RegistrationWithEvent } from '@/types/database';
import { formatDate } from '@/lib/utils';

interface RegistrationCardProps {
  registration: RegistrationWithEvent;
  isPast: boolean;
}

export function RegistrationCard({ registration, isPast }: RegistrationCardProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);
  const cancelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const event = registration.events;

  const handleCancel = async () => {
    console.log('🚀 handleCancel called'); // Debug log
    
    // Test: Simple toast first to verify sonner is working
    toast('Test: Cancel button clicked!', { duration: 2000 });
    
    setIsCancelling(true);
    
    // Show undo toast with 5-second countdown
    const toastId = toast.loading('Registration will be cancelled in 5 seconds...', {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          console.log('🔄 Undo clicked'); // Debug log
          // Clear the timeout and restore
          if (cancelTimeoutRef.current) {
            clearTimeout(cancelTimeoutRef.current);
            cancelTimeoutRef.current = null;
          }
          setIsCancelling(false);
          toast.success('Registration restored');
        },
      },
    });

    console.log('📋 Toast ID:', toastId); // Debug log

    // Set timeout to actually cancel after 5 seconds
    cancelTimeoutRef.current = setTimeout(async () => {
      console.log('⏰ Timeout expired, cancelling...'); // Debug log
      try {
        const result = await cancelRegistration(registration.id);
        toast.dismiss(toastId);
        if (result.error) {
          toast.error(result.error);
          setIsCancelling(false);
        } else {
          toast.success('Registration cancelled successfully');
          // Keep isCancelling true as the card will be removed by revalidation
        }
      } catch (error) {
        console.error('❌ Cancel error:', error); // Debug log
        toast.dismiss(toastId);
        toast.error('An error occurred while cancelling');
        setIsCancelling(false);
      }
    }, 5000);
  };

  const handleDownloadCertificate = async () => {
    setDownloadingCert(true);
    try {
      const response = await fetch(`/api/certificate/${registration.id}`);
      
      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to download certificate');
        setDownloadingCert(false);
        return;
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Certificate downloaded!');
    } catch (error) {
      toast.error('Failed to download certificate');
    } finally {
      setDownloadingCert(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-sm transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col h-full">
          {/* Event Banner */}
          {event.banner_url && (
            <div className="relative h-32 w-full bg-muted">
              <Image 
                src={event.banner_url} 
                alt={event.title} 
                fill 
                className="object-cover" 
              />
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row flex-grow">
            <div className="p-5 flex-grow space-y-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/events/${event.id}`} className="hover:underline">
                    <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
                  </Link>
                  {registration.checked_in && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 whitespace-nowrap">
                      {isPast ? 'Completed' : 'Checked In'}
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
                      <div className="mt-3 px-3 py-2 bg-gray-100 rounded text-xs font-mono text-black break-all">
                        {registration.qr_code}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">Scan QR code or enter code above manually</p>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2 sm:mr-0 lg:mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2 sm:mr-0 lg:mr-2" />
                )}
                <span className="sm:hidden lg:inline">
                  {isCancelling ? 'Cancelling...' : 'Cancel'}
                </span>
              </Button>
            </div>
            )}
            
            {isPast && (
              <div className="bg-muted/30 border-t sm:border-t-0 sm:border-l p-4 flex sm:flex-col items-center justify-end sm:justify-center gap-2 sm:w-40 shrink-0">
                {/* Certificate Download - only if checked in */}
                {registration.checked_in ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleDownloadCertificate}
                    disabled={downloadingCert}
                  >
                    {downloadingCert ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    <span>Certificate</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full opacity-50 cursor-not-allowed"
                    disabled
                    title="Available after event check-in"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <span>Certificate</span>
                  </Button>
                )}

                {/* Feedback Button */}
                <FeedbackDialog
                  eventId={event.id}
                  eventTitle={event.title}
                  trigger={
                    <div className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2 inline-block" />
                      <span>Feedback</span>
                    </div>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
