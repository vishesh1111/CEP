import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

      {/* Right pane - Decorative */}
      <div className="hidden lg:flex relative bg-zinc-900 flex-col items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent z-10" />
        <div className="absolute w-[500px] h-[500px] bg-primary/30 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        
        <div className="relative z-20 text-center space-y-6 max-w-lg">
          <h2 className="text-4xl font-bold text-white font-heading">Join the Campus Community</h2>
          <p className="text-zinc-400 text-lg">
            Discover amazing events, connect with peers, and make the most out of your college experience.
          </p>
        </div>
      </div>
    </div>
  );
}
