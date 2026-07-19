'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof formSchema>;

// Inner component that uses useSearchParams (requires Suspense boundary)
function ResetPasswordForm() {
  const [isPending, setIsPending] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(true);
  const [isValidToken, setIsValidToken] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  // On mount: exchange the token_hash from the URL for a session
  React.useEffect(() => {
    async function verifyToken() {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const code = searchParams.get('code');

      const supabase = createClient();

      // Path 1: token_hash flow (preferred — set via Supabase email template)
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        });
        if (error) {
          console.error('Token verification failed:', error.message);
          setIsValidToken(false);
          setIsVerifying(false);
          return;
        }
        setIsValidToken(true);
        setIsVerifying(false);
        return;
      }

      // Path 2: PKCE code flow — may fail if verifier not in localStorage
      // (happens when link opened in different browser/tab from where reset was requested)
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          setIsValidToken(true);
          setIsVerifying(false);
          return;
        }
        // PKCE failed — fall through to session check below
        console.warn('PKCE exchange failed (expected if different browser):', error.message);
      }

      // Final check: see if a recovery session already exists (e.g. set by middleware/callback)
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();
      if (user && !sessionError) {
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
      }
      setIsVerifying(false);
    }

    verifyToken();
  }, [searchParams]);

  async function onSubmit(data: FormValues) {
    setIsPending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: data.password });

      if (error) {
        toast.error(error.message);
        setIsPending(false);
      } else {
        toast.success('Password updated! Redirecting to login…');
        await supabase.auth.signOut();
        setTimeout(() => router.push('/login'), 1500);
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
      setIsPending(false);
    }
  }

  // Loading state while verifying token
  if (isVerifying) {
    return (
      <Card className="w-full border-none shadow-none lg:border-solid lg:shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Verifying reset link…</p>
        </CardContent>
      </Card>
    );
  }

  // Invalid / expired token
  if (!isValidToken) {
    return (
      <Card className="w-full border-none shadow-none lg:border-solid lg:shadow-sm">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold font-heading">Link expired or invalid</CardTitle>
          <CardDescription>
            This password reset link has expired or already been used.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Link href="/forgot-password">
            <Button className="w-full">Request a new reset link</Button>
          </Link>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Valid token — show the password form
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
    >
      <Card className="w-full border-none shadow-none lg:border-solid lg:shadow-sm">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold font-heading">Set new password</CardTitle>
          <CardDescription>
            Must be at least 8 characters with an uppercase letter and a number.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="••••••••"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm new password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="••••••••"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full mt-2" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update password
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Wrap in Suspense because useSearchParams requires it
export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <Card className="w-full border-none shadow-none lg:border-solid lg:shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Loading…</p>
          </CardContent>
        </Card>
      }
    >
      <ResetPasswordForm />
    </React.Suspense>
  );
}
