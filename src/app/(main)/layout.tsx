'use client';

import { PageTransition } from '@/components/ui/page-transition';
import { LoadingBar } from '@/components/ui/loading-bar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LoadingBar />
      <div className="pt-28">
        <PageTransition>
          {children}
        </PageTransition>
      </div>
    </>
  );
}
