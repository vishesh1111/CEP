'use client';

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { CalendarDays, Users, Sparkles, ArrowRight, Zap, Trophy, GraduationCap, QrCode, Bell, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ShaderBackground } from '@/components/ui/shader-background';
import { AnimatedCounter } from '@/components/ui/animated-counter';

export function LandingHero() {
  return (
    <>
      <ShaderBackground />
      {/* Hero Section */}
      <section className="relative w-full py-28 md:py-36 lg:py-48 overflow-hidden">

        {/* Mesh overlay blobs */}
        <div className="absolute top-[10%] left-[15%] w-[600px] h-[600px] bg-indigo-400/20 dark:bg-white/[0.07] rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[5%] right-[10%] w-[500px] h-[500px] bg-sky-300/30 dark:bg-pink-400/[0.1] rounded-full blur-[100px] float" />
        <div className="absolute top-[50%] left-[60%] w-[300px] h-[300px] bg-purple-300/20 dark:bg-indigo-300/[0.08] rounded-full blur-[80px] float" style={{ animationDelay: '2s' }} />

        {/* Noise texture */}
        <div className="absolute inset-0 noise-overlay pointer-events-none opacity-50 dark:opacity-100" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute inset-0 opacity-0 dark:opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
            className="flex flex-col items-center text-center space-y-8"
          >
            {/* Badge */}
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-200/50 bg-white/60 dark:border-white/20 dark:bg-white/[0.08] px-5 py-2 text-sm text-indigo-900 dark:text-white/90 backdrop-blur-md shadow-sm dark:shadow-lg shadow-black/5"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 dark:bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 dark:bg-green-400" />
              </span>
              <span className="font-medium">Live on Campus — Join 5,000+ Students</span>
            </motion.div>

            {/* Heading */}
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}
              className="space-y-5"
            >
              <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl text-slate-900 dark:text-white drop-shadow-sm dark:drop-shadow-lg">
                Discover{' '}
                <span className="relative">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-600 to-indigo-600 dark:from-white dark:via-purple-200 dark:to-pink-200">
                    Campus Events
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 8C50 2 100 2 150 6C200 10 250 4 298 8" stroke="url(#underline-grad)" strokeWidth="3" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="underline-grad" x1="0" y1="0" x2="300" y2="0">
                        <stop offset="0%" className="stop-indigo dark:stop-white" stopColor="currentColor" stopOpacity="0.6" />
                        <stop offset="50%" stopColor="#9333ea" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>
              <p className="mx-auto max-w-[650px] text-slate-600 dark:text-white/75 text-lg md:text-xl leading-relaxed font-light">
                Your one-stop platform for all college activities, workshops, and fests.
                Never miss what&apos;s happening around you.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link
                href="/events"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'w-full sm:w-auto font-semibold bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-white dark:text-indigo-700 dark:hover:bg-white/90 gap-2 h-14 px-8 text-base rounded-full shadow-[0_8px_30px_rgb(79,70,229,0.2)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-1'
                )}
              >
                Browse Events
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'w-full sm:w-auto font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 dark:bg-black/20 dark:hover:bg-black/30 dark:text-white dark:border-white/20 h-14 px-8 text-base rounded-full backdrop-blur-md shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 dark:hover:border-white/40'
                )}
              >
                Get Started Free
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}
              className="flex items-center gap-6 text-slate-700 dark:text-white/70 text-sm font-medium"
            >
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Secure Registration
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-white/30" />
              <span className="flex items-center gap-1.5">
                <QrCode className="h-3.5 w-3.5" />
                QR Check-in
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-white/30" />
              <span className="flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5" />
                Instant Alerts
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section — overlapping cards */}
      <section className="w-full -mt-16 relative z-20 pb-16">
        {/* Fade down to background color so it seamlessly transitions into the Features section */}
        <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-b from-transparent to-background pointer-events-none -z-10" />
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: CalendarDays, value: 150, suffix: '+', label: 'Total Events', color: 'from-indigo-500 to-violet-600' },
              { icon: Users, value: 5000, suffix: '+', label: 'Active Students', color: 'from-violet-500 to-purple-600' },
              { icon: Sparkles, value: 9, suffix: '', label: 'Categories', color: 'from-purple-500 to-pink-600' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={cn(
                  'glow-card group flex flex-col items-center space-y-3 p-8 bg-card/95 rounded-2xl shadow-xl border border-border/50 backdrop-blur-xl'
                )}
              >
                <div className={cn('p-3 rounded-xl bg-gradient-to-br shadow-lg', item.color)}>
                  <item.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold tracking-tight">
                  <AnimatedCounter to={item.value} suffix={item.suffix} duration={2500} />
                </h3>
                <p className="text-muted-foreground font-medium text-sm">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function LandingFeatures() {
  return (
    <section className="w-full py-24 bg-background relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 md:px-6 relative">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium">
            <Zap className="h-3.5 w-3.5" />
            Powerful Features
          </div>
          <h2 className="text-3xl font-bold tracking-tighter md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70">
            Everything You Need
          </h2>
          <p className="max-w-[600px] text-muted-foreground md:text-lg">
            From event discovery to QR check-in, we&apos;ve got your campus covered.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: CalendarDays,
              title: 'Event Discovery',
              description: 'Browse, search, and filter events by category. Never miss an opportunity to learn and connect.',
              gradient: 'from-blue-500/10 to-indigo-500/10',
              iconBg: 'bg-blue-500/10',
              iconColor: 'text-blue-600 dark:text-blue-400',
            },
            {
              icon: Trophy,
              title: 'Instant Registration',
              description: 'Register with a single click. Get QR codes for check-in. Cancel anytime before the event.',
              gradient: 'from-violet-500/10 to-purple-500/10',
              iconBg: 'bg-violet-500/10',
              iconColor: 'text-violet-600 dark:text-violet-400',
            },
            {
              icon: GraduationCap,
              title: 'Stay Updated',
              description: 'Get announcements for events you care about. Dashboard keeps you on track with everything.',
              gradient: 'from-pink-500/10 to-rose-500/10',
              iconBg: 'bg-pink-500/10',
              iconColor: 'text-pink-600 dark:text-pink-400',
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } } }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={cn(
                'glow-card group relative p-7 rounded-2xl border border-border/50 bg-gradient-to-br hover:border-primary/30 transition-all duration-500',
                feature.gradient
              )}
            >
              <div className={cn('p-3 rounded-xl w-fit mb-5 transition-transform duration-300 group-hover:scale-110', feature.iconBg)}>
                <feature.icon className={cn('h-6 w-6', feature.iconColor)} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl" />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex justify-center mt-14"
        >
          <Link
            href="/events"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'gap-2 h-12 px-8 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300'
            )}
          >
            View All Events
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export function LandingCTA() {
  return (
    <section className="w-full py-20 relative overflow-hidden">
      {/* Dark Mode Overlay */}
      <div className="absolute inset-0 hidden dark:block bg-black/40 pointer-events-none" />
      <div className="absolute inset-0 noise-overlay pointer-events-none opacity-50 dark:opacity-100" />
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-indigo-200/40 dark:bg-white/[0.05] rounded-full blur-[80px]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Ready to explore what&apos;s happening on campus?
          </h2>
          <p className="text-slate-600 dark:text-white/70 text-lg">
            Join thousands of students already using CampusEvents to discover, register, and never miss out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-white dark:text-indigo-700 dark:hover:bg-white/90 font-semibold h-14 px-8 rounded-full shadow-[0_8px_30px_rgb(79,70,229,0.2)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-1'
              )}
            >
              Create Free Account
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
            <Link
              href="/events"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 dark:bg-black/20 dark:hover:bg-black/30 dark:text-white dark:border-white/20 font-semibold h-14 px-8 rounded-full backdrop-blur-md shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 dark:hover:border-white/40'
              )}
            >
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
