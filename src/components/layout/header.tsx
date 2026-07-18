'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, Calendar, Menu, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { createClient } from '@/lib/supabase/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { User as AuthUser } from '@supabase/supabase-js';

export function Header() {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [role, setRole] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState<string>('');
  const router = useRouter();
  const pathname = usePathname();
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setUserName(session.user.user_metadata?.name || 'User');
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (data) {
          const profile = data as { role: string };
          setRole(profile.role);
        }
      }
    }
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setUserName(session.user.user_metadata?.name || 'User');
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (data) {
          const profile = data as { role: string };
          setRole(profile.role);
        }
      } else {
        setUser(null);
        setRole(null);
        setUserName('');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/', label: 'Discover' },
    { href: '/events', label: 'Events' },
    { href: '/events/calendar', label: 'Calendar' },
    { href: '#', label: 'Organizers' },
    { href: '#', label: 'About' },
    ...(user ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
    ...(role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center p-4 pt-4 md:pt-6 pointer-events-none">
      <header className="w-full max-w-5xl border border-border/40 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-lg rounded-full pointer-events-auto transition-all duration-300">
        <div className="container flex h-14 items-center justify-between mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="font-bold inline-block text-[22px] tracking-tight text-blue-700 dark:text-blue-500">CampusEvents</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  'text-[15px] font-medium transition-all relative py-1',
                  pathname === link.href ? 'text-blue-700 dark:text-blue-500' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute left-0 right-0 -bottom-[3px] h-[2px] bg-blue-700 dark:bg-blue-500 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="relative h-8 w-8 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <Avatar className="h-8 w-8 border border-border/50">
                      <AvatarImage src="" alt={userName} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-primary text-xs font-medium">
                        {userName[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 rounded-xl" align="end">
                    <div className="px-2 py-1.5 text-sm font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile')} className="rounded-md cursor-pointer">
                      <User className="mr-2 h-4 w-4" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/dashboard')} className="rounded-md cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive rounded-md cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/login" className="text-[15px] font-medium text-blue-700 dark:text-blue-500 hover:underline px-2">
                    Sign In
                  </Link>
                  <Link href="/register" className={cn(buttonVariants(), "rounded-full px-6 bg-blue-700 hover:bg-blue-800 text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5")}>
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger className="md:hidden p-2 rounded-full hover:bg-muted/50 transition-colors">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </SheetTrigger>
            <SheetContent side="right">
              <Link href="/" className="flex items-center space-x-2 mb-8 mt-4">
                <span className="font-bold inline-block text-[22px] tracking-tight text-blue-700 dark:text-blue-500">CampusEvents</span>
              </Link>
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm font-medium hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
                {!user && (
                  <div className="flex flex-col gap-2 mt-4">
                    <Link href="/login" className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-center text-blue-700 border-blue-700 dark:text-blue-500 dark:border-blue-500')}>
                      Sign In
                    </Link>
                    <Link href="/register" className={cn(buttonVariants(), 'w-full justify-center bg-blue-700 hover:bg-blue-800 text-white')}>
                      Get Started
                    </Link>
                  </div>
                )}
                {user && (
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                    <Link href="/profile" className="text-sm font-medium hover:text-primary py-2">Profile</Link>
                    <button onClick={handleLogout} className="text-sm font-medium text-left hover:text-primary py-2 text-destructive">
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
    </div>
  );
}
