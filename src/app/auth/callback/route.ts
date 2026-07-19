import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as 'recovery' | 'signup' | 'email' | 'magiclink' | null;
  const next = searchParams.get('next') ?? '/dashboard';

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  // --- Path 1: PKCE code exchange (OAuth, magic link) ---
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const redirectUrl = new URL(next, origin);
      return NextResponse.redirect(redirectUrl.toString());
    }
    console.error('[auth/callback] exchangeCodeForSession error:', error.message);
  }

  // --- Path 2: token_hash verification (password reset emails) ---
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });
    if (!error) {
      const redirectUrl = new URL(next, origin);
      return NextResponse.redirect(redirectUrl.toString());
    }
    console.error('[auth/callback] verifyOtp error:', error.message);
  }

  // Something went wrong — redirect to login with error message
  const errorUrl = new URL('/login', origin);
  errorUrl.searchParams.set('error', 'invalid_reset_link');
  return NextResponse.redirect(errorUrl.toString());
}
