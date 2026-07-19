'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, Mail, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { inviteAdmin } from '@/lib/actions/admin-invitations';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormValues = z.infer<typeof formSchema>;

export function InviteAdminForm() {
  const [isPending, setIsPending] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [promotedEmail, setPromotedEmail] = useState<string | null>(null);
  const [tableMissing, setTableMissing] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: FormValues) {
    setIsPending(true);
    setInvitationLink(null);
    setPromotedEmail(null);
    setTableMissing(false);
    
    try {
      const result = await inviteAdmin(data.email);
      
      if (result.error) {
        toast.error(result.error);
      } else if ((result as any).promoted) {
        toast.success(result.message || 'User promoted to admin!');
        setPromotedEmail(data.email);
        form.reset();
      } else {
        toast.success(result.message || 'Invitation created!');
        form.reset();
        
        if ((result as any).noTable) {
          setTableMissing(true);
        }
        
        // Generate invitation link
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/register?email=${encodeURIComponent(data.email)}&invited=true`;
        setInvitationLink(link);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsPending(false);
    }
  }

  const copyToClipboard = () => {
    if (invitationLink) {
      navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="admin@example.com" 
                      type="email" 
                      disabled={isPending} 
                      {...field} 
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isPending}>
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                      <span className="ml-2">Invite</span>
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  Enter the email address of the person you want to invite as an admin.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {promotedEmail && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                User Promoted to Admin!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>{promotedEmail}</strong> now has admin access. They'll see the Admin panel on their next login.
              </p>
            </div>
          </div>
        </div>
      )}

      {tableMissing && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="h-5 w-5 text-amber-600 mt-0.5 shrink-0 text-lg leading-none">⚠️</div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                admin_invitations table not found in Supabase
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Run <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-xs">supabase/admin-invitations.sql</code> in the Supabase SQL Editor to enable invitation tracking.
                Until then, invited users will sign up as <strong>students</strong> — you can promote them using this form after they register.
              </p>
            </div>
          </div>
        </div>
      )}

      {invitationLink && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Invitation Created!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Share this registration link with the invited user:
              </p>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border rounded-md p-2">
                <code className="flex-1 text-xs break-all text-gray-700 dark:text-gray-300">
                  {invitationLink}
                </code>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {!tableMissing && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  💡 The invitation expires in 7 days. When they register with this email, they'll automatically become an admin.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
