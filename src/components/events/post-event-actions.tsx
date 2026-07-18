'use client';

import { useState } from 'react';
import { Download, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FeedbackDialog } from '@/components/feedback/feedback-dialog';

export function PostEventActions({ registration, event }: { registration: any, event: any }) {
  const [downloadingCert, setDownloadingCert] = useState(false);

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
    <div className="flex flex-col gap-3">
      {registration.checked_in ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleDownloadCertificate}
          disabled={downloadingCert}
        >
          {downloadingCert ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Download Certificate
        </Button>
      ) : (
        <Button
          variant="outline"
          className="w-full opacity-50 cursor-not-allowed"
          disabled
          title="Available after event check-in"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Certificate (requires check-in)
        </Button>
      )}

      <FeedbackDialog
        eventId={event.id}
        eventTitle={event.title}
        trigger={
          <Button variant="outline" className="w-full">
            <MessageSquare className="w-4 h-4 mr-2" />
            Give Feedback
          </Button>
        }
      />
    </div>
  );
}
