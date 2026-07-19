export default function AdminLoading() {
  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-9 bg-muted rounded-lg w-64 mb-2 animate-pulse" />
        <div className="h-5 bg-muted rounded w-96 animate-pulse" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-32 mb-2" />
            <div className="h-8 bg-muted rounded w-16" />
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card border rounded-xl p-6 animate-pulse">
            <div className="h-10 bg-muted rounded-lg w-10 mb-4" />
            <div className="h-6 bg-muted rounded w-3/4 mb-2" />
            <div className="h-4 bg-muted rounded w-full" />
          </div>
        ))}
      </div>

      {/* Recent Activity Skeleton */}
      <div className="bg-card border rounded-xl p-6 animate-pulse">
        <div className="h-7 bg-muted rounded w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
