import { Suspense } from 'react';
import { LandingHero, LandingFeatures, LandingCTA } from '@/components/home/landing-sections';
import { BrowseByCategory } from '@/components/home/browse-by-category';

// Loading skeleton for the category section
function CategorySkeleton() {
  return (
    <section className="w-full py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center mb-14">
          <div className="h-8 w-24 rounded-full bg-muted animate-pulse" />
          <div className="h-10 w-72 rounded-lg bg-muted animate-pulse" />
          <div className="h-5 w-96 max-w-full rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-card/80">
              <div className="w-12 h-12 rounded-xl bg-muted animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                <div className="h-3 w-16 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col">
      <LandingHero />

      {/* Browse by Category — server-fetched, with loading skeleton */}
      <Suspense fallback={<CategorySkeleton />}>
        <BrowseByCategory />
      </Suspense>

      {/* CTA Banner */}
      <LandingCTA />
    </div>
  );
}
