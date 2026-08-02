import { Skeleton } from "@/components/ui/skeleton";

export function ComparisonTableSkeleton({
  rows = 12,
  showDelta = false,
}: {
  rows?: number;
  showDelta?: boolean;
}) {
  const cols = showDelta ? 8 : 7;
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-64 max-w-full bg-white/10" />
        <Skeleton className="h-9 w-48 max-w-full bg-white/10" />
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[640px] space-y-3">
          <div
            className="grid gap-3 border-b border-white/8 pb-3"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {Array.from({ length: cols }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full bg-white/10" />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, row) => (
            <div
              key={row}
              className="grid items-center gap-3"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              <Skeleton className="h-4 w-6 bg-white/10" />
              <div className="flex items-center gap-2">
                <Skeleton className="size-5 shrink-0 rounded-full bg-white/10" />
                <Skeleton className="h-4 w-24 bg-white/10" />
              </div>
              <Skeleton className="h-4 w-8 bg-white/10" />
              <Skeleton className="h-4 w-16 bg-white/10" />
              <Skeleton className="ml-auto h-4 w-12 bg-white/10" />
              <Skeleton className="ml-auto h-4 w-8 bg-white/10" />
              <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
              {showDelta ? (
                <Skeleton className="ml-auto h-4 w-10 bg-white/10" />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use ComparisonTableSkeleton */
export const ComparisonChartSkeleton = ComparisonTableSkeleton;

export function CompareLoadingSkeleton({
  showDelta = false,
  embedded = false,
}: {
  showDelta?: boolean;
  embedded?: boolean;
}) {
  if (embedded) {
    return <ComparisonTableSkeleton rows={12} showDelta={showDelta} />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 space-y-2">
        <Skeleton className="h-8 w-56 bg-white/10 sm:h-9 sm:w-64" />
        <Skeleton className="h-4 w-full max-w-2xl bg-white/10 sm:h-5" />
      </header>

      <div className="glass-panel mb-6 space-y-6 p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 bg-white/10" />
            <Skeleton className="h-11 w-full rounded-xl bg-white/10" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-40 bg-white/10" />
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-8 w-20 rounded-full bg-white/10"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-5 sm:p-6">
        <ComparisonTableSkeleton rows={48} showDelta={showDelta} />
      </div>
    </div>
  );
}
