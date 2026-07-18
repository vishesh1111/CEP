'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, X, RefreshCw, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { revokeAdminInvitation, resendAdminInvitation } from '@/lib/actions/admin-invitations';
import { formatDate, formatRelativeDate } from '@/lib/utils';

interface Invitation {
  id: string;
  email: string;
  status: string;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
  invited_by_user: {
    name: string;
    email: string;
  } | null;
}

interface InvitationsTableProps {
  invitations: Invitation[];
}

export function InvitationsTable({ invitations }: InvitationsTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleRevoke = async (id: string) => {
    setProcessingId(id);
    try {
      const result = await revokeAdminInvitation(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message || 'Invitation revoked');
      }
    } catch (error) {
      toast.error('Failed to revoke invitation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleResend = async (email: string) => {
    setProcessingId(email);
    try {
      const result = await resendAdminInvitation(email);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Invitation resent successfully');
      }
    } catch (error) {
      toast.error('Failed to resend invitation');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (status === 'accepted') {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Accepted
        </Badge>
      );
    }
    
    if (status === 'expired' || isExpired) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Expired
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  };

  if (invitations.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg border-dashed border-2">
        <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="font-medium text-lg mb-1">No invitations yet</h3>
        <p className="text-sm text-muted-foreground">
          Invite your first admin using the form above.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b">
          <tr className="text-left">
            <th className="pb-3 px-2 text-sm font-medium text-muted-foreground">Email</th>
            <th className="pb-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
            <th className="pb-3 px-2 text-sm font-medium text-muted-foreground">Invited By</th>
            <th className="pb-3 px-2 text-sm font-medium text-muted-foreground">Expires</th>
            <th className="pb-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {invitations.map((invitation) => {
            const isExpired = new Date(invitation.expires_at) < new Date();
            const isPending = invitation.status === 'pending' && !isExpired;
            
            return (
              <tr key={invitation.id} className="hover:bg-muted/30">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{invitation.email}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  {getStatusBadge(invitation.status, invitation.expires_at)}
                </td>
                <td className="py-3 px-2 text-sm text-muted-foreground">
                  {invitation.invited_by_user?.name || 'Unknown'}
                </td>
                <td className="py-3 px-2 text-sm text-muted-foreground">
                  {isPending ? (
                    <span title={formatDate(invitation.expires_at)}>
                      {formatRelativeDate(invitation.expires_at)}
                    </span>
                  ) : invitation.status === 'accepted' ? (
                    <span className="text-green-600">
                      Accepted {formatRelativeDate(invitation.accepted_at!)}
                    </span>
                  ) : (
                    <span className="text-gray-500">Expired</span>
                  )}
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResend(invitation.email)}
                          disabled={processingId === invitation.email}
                          title="Resend invitation"
                        >
                          <RefreshCw className={`h-4 w-4 ${processingId === invitation.email ? 'animate-spin' : ''}`} />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={processingId === invitation.id}
                              className="text-destructive hover:text-destructive"
                              title="Revoke invitation"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke Invitation?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will revoke the admin invitation for <strong>{invitation.email}</strong>. 
                                They will no longer be able to register as an admin using this invitation.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRevoke(invitation.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Revoke
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                    
                    {!isPending && <span className="text-xs text-muted-foreground">—</span>}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
