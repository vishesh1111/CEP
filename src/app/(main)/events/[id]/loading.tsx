export default function EventDetailLoading() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl min-h-screen animate-fade-in-up">
      {/* Back button skeleton */}
      <div className="h-5 w-32 bg-muted rounded-md mb-6 animate-pulse" />

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden mb-8">
        {/* Banner skeleton */}
        <div className="relative h-[250px] md:h-[400px] w-full bg-muted animate-pulse" />

        <div className="p-6 md:p-8 md:flex gap-8">
          {/* Left column */}
          <div className="md:w-2/3 space-y-4">
            <div className="h-10 w-3/4 bg-muted rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
            </div>
          </div>

          {/* Right column */}
          <div className="md:w-1/3 mt-8 md:mt-0 space-y-4">
            <div className="bg-muted/30 p-5 rounded-lg border space-y-4">
              <div className="h-6 w-32 bg-muted rounded animate-pulse border-b pb-2" />
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-36 bg-muted rounded animate-pulse" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                </div>
              </div>
              <div className="h-px bg-muted my-4" />
              <div className="h-12 w-full bg-muted rounded-md animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
