'use client';

import { useState } from 'react';
import { CheckCircle, RotateCcw, Clock, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { markEventCompleted, reopenEvent } from '@/lib/actions/event-completion';

interface EventCompletionButtonProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  completed: boolean;
  completedAt?: string;
  totalRegistrations: number;
  checkedInCount: number;
}

export function EventCompletionButton({
  eventId,
  eventTitle,
  eventDate,
  completed,
  completedAt,
  totalRegistrations,
  checkedInCount,
}: EventCompletionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const isEventPast = new Date(eventDate) < new Date();
  const attendanceRate = totalRegistrations > 0 ? 
    Math.round((checkedInCount / totalRegistrations) * 100) : 0;

  const handleMarkCompleted = async () => {
    setLoading(true);
    try {
      const result = await markEventCompleted(eventId);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Event marked as completed! Students can now access certificates and submit feedback.');
        setOpen(false);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReopen = async () => {
    setLoading(true);
    try {
      const result = await reopenEvent(eventId);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Event reopened. Certificate/feedback access removed until marked complete again.');
        setOpen(false);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {completed ? (
        <DialogTrigger render={<Button variant="outline" size="sm" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100" />}>
          <CheckCircle className="w-4 h-4 mr-1" />
          Completed
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button variant="outline" size="sm" className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100" />}>
          <Clock className="w-4 h-4 mr-1" />
          Mark Complete
        </DialogTrigger>
      )}
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {completed ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                Event Completed
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 text-orange-600" />
                Mark Event Complete?
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {completed ? (
              `This event was marked as completed ${completedAt ? new Date(completedAt).toLocaleDateString() : 'recently'}.`
            ) : (
              'Mark this event as completed to enable certificate downloads and feedback submission for students.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Summary */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm">{eventTitle}</h4>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{new Date(eventDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{totalRegistrations} registered</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-sm text-muted-foreground">Check-in Rate:</span>
              <Badge variant={attendanceRate >= 70 ? 'default' : attendanceRate >= 40 ? 'secondary' : 'outline'}>
                {checkedInCount}/{totalRegistrations} ({attendanceRate}%)
              </Badge>
            </div>
          </div>

          {/* Impact Notice */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                {completed ? 'Students can currently:' : 'After completion, students will be able to:'}
              </p>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-xs ml-4">
                <li>• Download attendance certificates (if checked in)</li>
                <li>• Submit feedback and rate the event</li>
                <li>• View the event in their "Past Events" section</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {completed ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReopen}
                  disabled={loading}
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reopen Event
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleMarkCompleted}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark Complete
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}