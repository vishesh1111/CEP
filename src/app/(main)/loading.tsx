export default function Loading() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8 animate-pulse">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-10 bg-muted rounded-lg w-1/3" />
        <div className="h-5 bg-muted rounded-lg w-1/2" />
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-xl p-6 space-y-4 bg-card">
            <div className="h-48 bg-muted rounded-lg" />
            <div className="space-y-2">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
