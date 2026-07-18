'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Users, Bell, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
};

export function AnimatedAbout() {
  return (
    <div className="container mx-auto pt-32 pb-20 px-4 md:px-6 max-w-6xl overflow-hidden">
      {/* Header */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-center mb-20 space-y-6 relative"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.04] dark:bg-primary/[0.08] rounded-full blur-[100px] -z-10" />
        
        <motion.div variants={itemVariants} className="inline-block">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary ring-1 ring-inset ring-primary/20 shadow-sm transition-all hover:scale-105">
            Our Story
          </span>
        </motion.div>
        
        <motion.h1 
          variants={itemVariants} 
          className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70"
        >
          Why CampusEvents?
        </motion.h1>
        
        <motion.p 
          variants={itemVariants} 
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium"
        >
          Built for students who are tired of missing out on campus life.
        </motion.p>
      </motion.div>

      <div className="space-y-24">
        {/* Problem Statement */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="relative grid md:grid-cols-12 gap-8 items-center"
        >
          <div className="md:col-span-5 relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-red-500/10 to-amber-500/10 rounded-3xl blur-2xl -z-10" />
            <motion.div variants={itemVariants} className="h-full w-1 bg-gradient-to-b from-red-500 to-amber-500 rounded-full absolute left-0 top-0 hidden md:block" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground/90 md:pl-8">
              The Problem We Solve
            </h2>
          </div>
          
          <div className="md:col-span-7 space-y-6 md:pl-8 border-l-4 border-red-500/20 md:border-none pl-4">
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              If you've ever <span className="font-semibold text-foreground">missed a workshop because it was buried in a WhatsApp group</span>, 
              or shown up to a "fest" only to find it was <span className="font-semibold text-foreground">cancelled last week</span>, 
              you already know the problem.
            </motion.p>
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Campus events are scattered across group chats, notice boards, and half-updated spreadsheets — and by the time 
              information reaches you, <span className="font-semibold text-foreground">half the seats are already gone</span>.
            </motion.p>
          </div>
        </motion.div>

        {/* Solution Statement */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="relative grid md:grid-cols-12 gap-8 items-center"
        >
          <div className="md:col-span-5 relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-3xl blur-2xl -z-10" />
            <motion.div variants={itemVariants} className="h-full w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full absolute left-0 top-0 hidden md:block" />
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent md:pl-8">
              CampusEvents Fixes That
            </h2>
          </div>
          
          <div className="md:col-span-7 space-y-6 md:pl-8 border-l-4 border-blue-500/20 md:border-none pl-4">
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              <span className="font-bold text-foreground">One place</span> to discover what's happening. 
              <span className="font-bold text-foreground"> Register in seconds</span>, and know exactly where you stand — 
              confirmed, waitlisted, or checked in.
            </motion.p>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12"
        >
          {[
            {
              icon: Calendar,
              title: "Real-Time Updates",
              desc: "No more stale information. See live seat availability, instant announcements, and calendar sync — all in one place.",
              color: "blue",
            },
            {
              icon: CheckCircle,
              title: "Smart Registration",
              desc: "Register instantly with atomic seat locking. Full event? Join the waitlist and get auto-promoted when spots open.",
              color: "green",
            },
            {
              icon: Users,
              title: "QR Check-In",
              desc: "Skip the paper lists. Get your unique QR code, show it at the venue, and you're in. Fast, secure, contactless.",
              color: "purple",
            },
            {
              icon: Bell,
              title: "Never Miss Out",
              desc: "Email confirmations, event reminders, and calendar integration. Know what's happening before everyone else does.",
              color: "amber",
            }
          ].map((feature, idx) => {
            const Icon = feature.icon;
            // Map colors to tailwind classes dynamically but safely
            const colorMap = {
              blue: "text-blue-600 dark:text-blue-400 bg-blue-500/10 ring-blue-500/20 group-hover:bg-blue-500/20 border-blue-500/10",
              green: "text-green-600 dark:text-green-400 bg-green-500/10 ring-green-500/20 group-hover:bg-green-500/20 border-green-500/10",
              purple: "text-purple-600 dark:text-purple-400 bg-purple-500/10 ring-purple-500/20 group-hover:bg-purple-500/20 border-purple-500/10",
              amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10 ring-amber-500/20 group-hover:bg-amber-500/20 border-amber-500/10",
            };
            const classes = colorMap[feature.color as keyof typeof colorMap];

            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={cn(
                  "glow-card group relative overflow-hidden rounded-3xl border bg-card/80 backdrop-blur-sm p-8 transition-all hover:shadow-xl dark:hover:shadow-primary/5",
                  `hover:border-${feature.color}-500/30`
                )}
              >
                <div className="flex flex-col gap-5">
                  <div className={cn("shrink-0 rounded-2xl w-fit p-4 ring-1 transition-colors duration-300", classes.split(' ').slice(2, 6).join(' '))}>
                    <Icon className={cn("h-7 w-7", classes.split(' ').slice(0, 2).join(' '))} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-bold text-xl tracking-tight">{feature.title}</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Closing Statement */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="text-center pt-16 pb-8"
        >
          <div className="max-w-3xl mx-auto space-y-8">
            <motion.p variants={itemVariants} className="text-xl md:text-2xl font-medium text-muted-foreground leading-relaxed">
              Built for students, by students. Because campus life is busy enough — 
              <span className="font-bold text-foreground"> managing events shouldn't be</span>.
            </motion.p>
            
            <motion.div variants={itemVariants} className="pt-6">
              <Link 
                href="/events" 
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-full px-8 h-14 text-lg font-semibold shadow-[0_8px_30px_rgb(79,70,229,0.2)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-1 gap-2"
                )}
              >
                Explore Events
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
