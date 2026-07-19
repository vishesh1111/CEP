export default function DashboardLoading() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl animate-fade-in">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-9 bg-muted rounded-lg w-64 mb-2 animate-pulse" />
        <div className="h-5 bg-muted rounded w-96 animate-pulse" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border rounded-xl p-6 animate-pulse">
            <div className="h-10 bg-muted rounded w-16 mb-1" />
            <div className="h-4 bg-muted rounded w-32" />
          </div>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="h-11 bg-muted rounded-lg w-32 animate-pulse" />
          <div className="h-11 bg-muted rounded-lg w-40 animate-pulse" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="h-7 bg-muted rounded w-48 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-xl border p-4 animate-pulse">
                <div className="h-32 bg-muted rounded-lg mb-3" />
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-full mb-4" />
                <div className="flex gap-2">
                  <div className="h-9 bg-muted rounded w-24" />
                  <div className="h-9 bg-muted rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
