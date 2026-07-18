'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { submitFeedback, getFeedbackByUser } from '@/lib/actions/feedback';
import { cn } from '@/lib/utils';

interface FeedbackDialogProps {
  eventId: string;
  eventTitle: string;
  trigger?: React.ReactNode;
}

export function FeedbackDialog({ eventId, eventTitle, trigger }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState<any>(null);

  // Load existing feedback when dialog opens
  useEffect(() => {
    if (open) {
      loadExistingFeedback();
    }
  }, [open]);

  const loadExistingFeedback = async () => {
    const result = await getFeedbackByUser(eventId);
    if (result.data) {
      setExistingFeedback(result.data);
      setRating((result.data as any).rating);
      setComment((result.data as any).comment || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);
    const result = await submitFeedback({
      eventId,
      rating,
      comment: comment.trim(),
    });

    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(existingFeedback ? 'Feedback updated!' : 'Feedback submitted!');
      setOpen(false);
      // Reset form
      setRating(0);
      setComment('');
      setExistingFeedback(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 w-full">
        {trigger || (
          <>
            <MessageSquare className="w-4 h-4 mr-2" />
            <span>{existingFeedback ? 'Edit Feedback' : 'Leave Feedback'}</span>
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingFeedback ? 'Edit Your Feedback' : 'Leave Feedback'}
          </DialogTitle>
          <DialogDescription>
            How was your experience at {eventTitle}?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      'h-8 w-8 transition-colors',
                      (hoverRating >= star || rating >= star)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} star{rating !== 1 && 's'}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Comment <span className="text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id="comment"
              placeholder="Share your thoughts about the event..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || rating === 0}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
