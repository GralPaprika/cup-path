import { Skeleton } from "@/components/ui/skeleton";

export function ComparisonTableSkeleton({
  rows = 12,
  showDelta = false,
}: {
  rows?: number;
  showDelta?: boolean;
}) {
  const cols = showDelta ? 7 : 6;
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-64 bg-white/10" />
        <Skeleton className="h-9 w-48 bg-white/10" />
      </div>
      <div className="space-y-3">
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
              <Skeleton className="size-5 rounded-full bg-white/10" />
              <Skeleton className="h-4 w-24 bg-white/10" />
            </div>
            <Skeleton className="h-4 w-8 bg-white/10" />
            <Skeleton className="h-4 w-16 bg-white/10" />
            <Skeleton className="ml-auto h-4 w-12 bg-white/10" />
            <Skeleton className="ml-auto h-4 w-8 bg-white/10" />
            <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
            {showDelta && <Skeleton className="ml-auto h-4 w-10 bg-white/10" />}
          </div>
        ))}
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

  return <ComparisonTableSkeleton rows={48} showDelta={showDelta} />;
}
