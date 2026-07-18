'use client';

import { CheckCircle, Calendar, Users, Bell } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about" className="w-full py-24 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20">
              Our Story
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Why CampusEvents?
          </h2>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Problem Statement */}
          <div className="relative">
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-red-500/50 via-amber-500/50 to-transparent rounded-full" />
            <div className="pl-8 space-y-4">
              <h3 className="text-xl md:text-2xl font-semibold text-foreground/90">
                The Problem We Solve
              </h3>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-4xl">
                If you've ever <span className="font-medium text-foreground">missed a workshop because it was buried in a WhatsApp group</span>, 
                or shown up to a "fest" only to find it was <span className="font-medium text-foreground">cancelled last week</span>, 
                you already know the problem.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-4xl">
                Campus events are scattered across group chats, notice boards, and half-updated spreadsheets — and by the time 
                information reaches you, <span className="font-medium text-foreground">half the seats are already gone</span>.
              </p>
            </div>
          </div>

          {/* Solution Statement */}
          <div className="relative">
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 via-blue-500/50 to-transparent rounded-full" />
            <div className="pl-8 space-y-4">
              <h3 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                CampusEvents Fixes That
              </h3>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-4xl">
                <span className="font-semibold text-foreground">One place</span> to discover what's happening. 
                <span className="font-semibold text-foreground"> Register in seconds</span>, and know exactly where you stand — 
                confirmed, waitlisted, or checked in.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
            {/* Feature 1 */}
            <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50">
              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-xl bg-blue-500/10 p-3 ring-1 ring-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">Real-Time Updates</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    No more stale information. See live seat availability, instant announcements, and calendar sync — all in one place.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50">
              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-xl bg-green-500/10 p-3 ring-1 ring-green-500/20 group-hover:bg-green-500/20 transition-colors">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">Smart Registration</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Register instantly with atomic seat locking. Full event? Join the waitlist and get auto-promoted when spots open.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50">
              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-xl bg-purple-500/10 p-3 ring-1 ring-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">QR Check-In</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Skip the paper lists. Get your unique QR code, show it at the venue, and you're in. Fast, secure, contactless.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50">
              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-xl bg-amber-500/10 p-3 ring-1 ring-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                  <Bell className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">Never Miss Out</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Email confirmations, event reminders, and calendar integration. Know what's happening before everyone else does.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Closing Statement */}
          <div className="text-center pt-8">
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Built for students, by students. Because campus life is busy enough — 
              <span className="font-semibold text-foreground"> managing events shouldn't be</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
