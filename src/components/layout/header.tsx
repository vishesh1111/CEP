'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, Menu, User, LogOut, LayoutDashboard } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { createClient } from '@/lib/supabase/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { User as AuthUser } from '@supabase/supabase-js';
import { motion } from 'framer-motion';

export function Header() {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [role, setRole] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState<string>('');
  const [hoveredPath, setHoveredPath] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const supabase = React.useMemo(() => createClient(), []);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    let isMounted = true;

    async function fetchUserAndRole(authUser: AuthUser) {
      if (!isMounted) return;
      setUser(authUser);
      setUserName(authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User');
      try {
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', authUser.id)
          .single();
        if (data && isMounted) {
          setRole((data as { role: string }).role);
        }
      } catch {
        // Role fetch failed, that's okay
      }
      if (isMounted) setIsLoading(false);
    }

    async function initAuth() {
      try {
        // First check session from storage
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserAndRole(session.user);
          return;
        }
        
        // Fallback to getUser if no session
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          await fetchUserAndRole(authUser);
        } else {
          if (isMounted) setIsLoading(false);
        }
      } catch {
        // Auth check failed
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchUserAndRole(session.user);
      } else {
        if (isMounted) {
          setUser(null);
          setRole(null);
          setUserName('');
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
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
    { href: '/about', label: 'About' },
    ...(user ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
    ...(role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <div className="fixed top-0 inset-x-0 z-[100] pointer-events-none">
      <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60 pointer-events-auto transition-all duration-300">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="font-bold inline-block text-[22px] tracking-tight bg-gradient-to-br from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                CampusEvents
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" onMouseLeave={() => setHoveredPath(null)}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const isHovered = hoveredPath === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  onMouseEnter={() => setHoveredPath(link.href)}
                  className={cn(
                    'relative px-4 py-2 text-[14px] font-medium transition-colors duration-200 rounded-full',
                    (isActive || isHovered) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className="relative z-10">{link.label}</span>
                  {((isHovered) || (!hoveredPath && isActive)) && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-muted/80 dark:bg-muted/50 rounded-full z-0"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />

            <div className="hidden md:flex items-center gap-3">
              {isLoading ? (
                <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="relative h-9 w-9 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-transform hover:scale-105 duration-200 border-2 border-transparent hover:border-blue-500/20">
                    <Avatar className="h-full w-full border border-border/50">
                      <AvatarImage src="" alt={userName} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs font-medium">
                        {userName[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 rounded-xl border border-border/50 shadow-xl backdrop-blur-xl bg-background/90 supports-[backdrop-filter]:bg-background/80" align="end">
                    <div className="px-3 py-2.5 text-sm font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">{userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile')} className="rounded-md cursor-pointer focus:bg-primary/10 transition-colors py-2">
                      <User className="mr-2 h-4 w-4" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/dashboard')} className="rounded-md cursor-pointer focus:bg-primary/10 transition-colors py-2">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive rounded-md cursor-pointer focus:bg-destructive/10 transition-colors py-2">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/login" className="text-[14px] font-medium text-foreground/80 hover:text-foreground transition-colors px-3 py-2 rounded-full hover:bg-muted/50">
                    Sign In
                  </Link>
                  <Link 
                    href="/register" 
                    className={cn(
                      buttonVariants(), 
                      "rounded-full px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 border-0 transition-all hover:scale-105 duration-300"
                    )}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger className="md:hidden p-2.5 rounded-full hover:bg-muted/80 transition-colors border border-transparent hover:border-border/50">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </SheetTrigger>
            <SheetContent side="right" className="border-l border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center space-x-2 mb-8 mt-4 group">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="font-bold inline-block text-[22px] tracking-tight bg-gradient-to-br from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">CampusEvents</span>
              </Link>
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "text-sm font-medium px-4 py-3 rounded-xl transition-colors",
                      pathname === link.href 
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" 
                        : "hover:bg-muted/50 text-foreground/80 hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {isLoading ? (
                  <div className="flex flex-col gap-3 mt-6">
                    <div className="w-full h-12 bg-muted animate-pulse rounded-xl" />
                    <div className="w-full h-12 bg-muted animate-pulse rounded-xl" />
                  </div>
                ) : user ? (
                  <div className="flex flex-col gap-2 mt-6 pt-6 border-t border-border/50">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Avatar className="h-10 w-10 border border-border/50">
                        <AvatarImage src="" alt={userName} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-sm font-medium">
                          {userName[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{userName}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                    <Link href="/profile" onClick={() => setMobileOpen(false)} className="text-sm font-medium px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors flex items-center gap-2">
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm font-medium px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="text-sm font-medium text-left px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors flex items-center gap-2">
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 mt-6">
                    <Link href="/login" onClick={() => setMobileOpen(false)} className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-center rounded-xl py-6')}>
                      Sign In
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)} className={cn(buttonVariants(), 'w-full justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-6 shadow-md')}>
                      Get Started
                    </Link>
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
