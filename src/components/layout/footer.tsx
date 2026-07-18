'use client';

import Link from 'next/link';
import { CalendarDays, Mail, Heart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg">CampusEvents</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your one-stop portal for all college events, workshops, fests, and activities.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Quick Links</h4>
            <div className="flex flex-col space-y-2">
              <Link href="/events" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Browse Events
              </Link>
              <Link href="/events/calendar" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Calendar View
              </Link>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Contact</h4>
            <div className="flex flex-col space-y-2">
              <a href="mailto:events@campus.edu" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                events@campus.edu
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> for Campus
          </p>
          <p>&copy; {new Date().getFullYear()} CampusEvents. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
