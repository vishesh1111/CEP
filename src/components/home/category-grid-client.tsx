'use client';

import Link from 'next/link';
import {
  Cpu, Music, Wrench, Trophy, Presentation, Users,
  Briefcase, Code, PartyPopper, Heart, Calendar, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

// Category metadata with icons and accent colors
const CATEGORY_META: Record<string, {
  icon: LucideIcon;
  label: string;
  bg: string;       // light mode bg
  darkBg: string;   // dark mode bg
  iconColor: string; // icon text color
}> = {
  technology: {
    icon: Cpu,
    label: 'Technology',
    bg: 'bg-cyan-500/10',
    darkBg: 'dark:bg-cyan-400/10',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  cultural: {
    icon: Music,
    label: 'Cultural',
    bg: 'bg-purple-500/10',
    darkBg: 'dark:bg-purple-400/10',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  workshop: {
    icon: Wrench,
    label: 'Workshop',
    bg: 'bg-amber-500/10',
    darkBg: 'dark:bg-amber-400/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  sports: {
    icon: Trophy,
    label: 'Sports',
    bg: 'bg-orange-500/10',
    darkBg: 'dark:bg-orange-400/10',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  seminar: {
    icon: Presentation,
    label: 'Seminar',
    bg: 'bg-indigo-500/10',
    darkBg: 'dark:bg-indigo-400/10',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  social: {
    icon: Users,
    label: 'Social',
    bg: 'bg-teal-500/10',
    darkBg: 'dark:bg-teal-400/10',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  career: {
    icon: Briefcase,
    label: 'Career',
    bg: 'bg-slate-500/10',
    darkBg: 'dark:bg-slate-400/10',
    iconColor: 'text-slate-600 dark:text-slate-400',
  },
  hackathon: {
    icon: Code,
    label: 'Hackathon',
    bg: 'bg-green-500/10',
    darkBg: 'dark:bg-green-400/10',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  fest: {
    icon: PartyPopper,
    label: 'Fest',
    bg: 'bg-fuchsia-500/10',
    darkBg: 'dark:bg-fuchsia-400/10',
    iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
  },
  volunteering: {
    icon: Heart,
    label: 'Volunteering',
    bg: 'bg-rose-500/10',
    darkBg: 'dark:bg-rose-400/10',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  general: {
    icon: Calendar,
    label: 'General',
    bg: 'bg-gray-500/10',
    darkBg: 'dark:bg-gray-400/10',
    iconColor: 'text-gray-600 dark:text-gray-400',
  },
};

interface CategoryGridProps {
  categories: { category: string; count: number }[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="w-full py-20 bg-background relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 md:px-6 relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium">
            <Zap className="h-3.5 w-3.5" />
            Explore
          </div>
          <h2 className="text-3xl font-bold tracking-tighter md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70">
            Browse by Category
          </h2>
          <p className="max-w-[550px] text-muted-foreground md:text-lg">
            Find events that match your interests — from tech workshops to cultural fests.
          </p>
        </motion.div>

        {/* Category grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {categories.map(({ category, count }) => {
            const meta = CATEGORY_META[category] || CATEGORY_META.general;
            const Icon = meta.icon;

            return (
              <motion.div
                key={category}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } },
                }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                <Link
                  href={`/events?category=${category}`}
                  className={cn(
                    'group flex items-center gap-4 p-5 rounded-2xl border border-border/50',
                    'bg-card/80 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg',
                    'transition-all duration-300 cursor-pointer'
                  )}
                >
                  {/* Icon box */}
                  <div
                    className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-xl shrink-0',
                      'transition-transform duration-300 group-hover:scale-110',
                      meta.bg,
                      meta.darkBg
                    )}
                  >
                    <Icon className={cn('w-6 h-6', meta.iconColor)} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[15px] group-hover:text-primary transition-colors">
                      {meta.label}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {count} {count === 1 ? 'event' : 'events'}
                    </div>
                  </div>

                  {/* Arrow hint */}
                  <div className="text-muted-foreground/40 group-hover:text-primary/60 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
