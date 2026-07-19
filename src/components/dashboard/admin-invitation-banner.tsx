'use client';

import { useState } from 'react';
import { ShieldCheck, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { acceptAdminInvitation, declineAdminInvitation } from '@/lib/actions/admin-invitations';

interface AdminInvitationBannerProps {
  invitationId: string;
  inviterName: string;
}

export function AdminInvitationBanner({ invitationId, inviterName }: AdminInvitationBannerProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  async function handleAccept() {
    setIsAccepting(true);
    try {
      const result = await acceptAdminInvitation(invitationId);
      if (result?.error) {
        toast.error(result.error);
        setIsAccepting(false);
      }
      // On success, the server action redirects to /admin — no need to handle here
    } catch (err: any) {
      // next/navigation redirect throws — let it bubble up
      if (err?.message?.includes('NEXT_REDIRECT') || err?.digest?.includes('NEXT_REDIRECT')) {
        throw err;
      }
      toast.error('Something went wrong. Please try again.');
      setIsAccepting(false);
    }
  }

  async function handleDecline() {
    setIsDeclining(true);
    try {
      const result = await declineAdminInvitation(invitationId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Invitation declined.');
        setDismissed(true);
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsDeclining(false);
    }
  }

  return (
    <div className="relative mb-6 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 p-4 sm:p-5">
      {/* Glow ring */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-indigo-500/20 pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Icon + text */}
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 ring-1 ring-indigo-500/40">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              You've been invited to become an Admin
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="font-medium text-indigo-400">{inviterName}</span> has granted you administrator access to CampusEvents. Accept to unlock the full Admin dashboard.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-13 sm:ml-0 shrink-0">
          <Button
            size="sm"
            onClick={handleAccept}
            disabled={isAccepting || isDeclining}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            {isAccepting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            {isAccepting ? 'Activating...' : 'Accept & Become Admin'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDecline}
            disabled={isAccepting || isDeclining}
            className="text-muted-foreground hover:text-foreground gap-1"
          >
            {isDeclining ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
}
