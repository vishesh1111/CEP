export default function EventsLoading() {
  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded-lg w-48 animate-pulse" />
          <div className="h-4 bg-muted rounded w-64 animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 bg-muted rounded-lg w-32 animate-pulse" />
          <div className="h-10 bg-muted rounded-lg w-32 animate-pulse" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 bg-muted rounded-full w-24 animate-pulse shrink-0" />
        ))}
      </div>

      {/* Events Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card rounded-xl border overflow-hidden animate-pulse">
            <div className="h-48 bg-muted" />
            <div className="p-5 space-y-3">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="flex gap-2 pt-2">
                <div className="h-5 bg-muted rounded-full w-20" />
                <div className="h-5 bg-muted rounded-full w-16" />
              </div>
              <div className="h-10 bg-muted rounded-lg w-full mt-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
