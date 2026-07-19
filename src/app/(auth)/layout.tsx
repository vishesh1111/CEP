import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HeatmapShader } from '@/components/ui/heatmap-shader';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative pt-20 lg:pt-0">

      
      {/* Left pane - Content */}
      <div className="flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {children}
        </div>
      </div>

      {/* Right pane - Decorative with Heatmap */}
      <div className="hidden lg:flex relative bg-slate-50 dark:bg-black flex-col items-center justify-center p-12 overflow-hidden border-l border-border/50">
        {/* Animated Heatmap Shader */}
        <div className="absolute inset-0 z-0">
          <HeatmapShader />
        </div>
        
        {/* Content */}
        <div className="relative z-20 text-center space-y-4 max-w-lg px-8">
          <h2 className="text-5xl font-bold text-slate-900 dark:text-white font-heading tracking-tight drop-shadow-md dark:drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
            Join the Campus Community
          </h2>
          <p className="text-slate-700 dark:text-white text-base leading-relaxed drop-shadow-sm dark:drop-shadow-[0_2px_15px_rgba(0,0,0,0.5)]">
            Discover amazing events, connect with peers, and make the most out of your college experience.
          </p>
        </div>
      </div>
    </div>
  );
}
