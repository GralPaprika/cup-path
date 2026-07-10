import { Skeleton } from "@/components/ui/skeleton";

function StatBlockSkeleton() {
  return (
    <div className="glass-panel-subtle px-4 py-3">
      <Skeleton className="h-3 w-20 bg-white/10" />
      <Skeleton className="mt-3 h-7 w-16 bg-white/10" />
    </div>
  );
}

export function SummaryCardSkeleton() {
  return (
    <div className="glass-panel overflow-hidden">
      <div className="border-b border-white/8 px-5 py-5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full bg-white/10" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48 bg-white/10" />
            <Skeleton className="h-4 w-28 bg-white/10" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:p-6">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <StatBlockSkeleton key={index} />
          ))}
        </div>
        <div className="flex flex-col items-center gap-2 px-4">
          <Skeleton className="h-[140px] w-[240px] rounded-full bg-white/10" />
          <Skeleton className="h-4 w-32 bg-white/10" />
        </div>
        <div className="glass-panel-subtle px-5 py-4">
          <Skeleton className="h-3 w-28 bg-white/10" />
          <Skeleton className="mt-3 h-8 w-40 bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export function PathTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-panel overflow-hidden">
      <div className="border-b border-white/8 px-5 py-4">
        <Skeleton className="h-6 w-40 bg-white/10" />
      </div>
      <div className="space-y-3 p-4">
        <div className="grid grid-cols-5 gap-3 border-b border-white/8 pb-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full bg-white/10" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="grid grid-cols-5 items-center gap-3 py-1">
            <div className="space-y-1">
              <Skeleton className="h-4 w-20 bg-white/10" />
              <Skeleton className="h-3 w-16 bg-white/10" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="size-6 rounded-full bg-white/10" />
              <Skeleton className="h-4 w-16 bg-white/10" />
            </div>
            <Skeleton className="ml-auto h-4 w-12 bg-white/10" />
            <Skeleton className="ml-auto h-4 w-8 bg-white/10" />
            <Skeleton className="ml-auto h-6 w-14 rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

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

export function PageShellSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-72 bg-white/10" />
        <Skeleton className="h-5 w-96 max-w-full bg-white/10" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="glass-panel space-y-6 p-5">
          <Skeleton className="h-4 w-24 bg-white/10" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-lg bg-white/10" />
            ))}
          </div>
          <Skeleton className="h-12 w-full rounded-xl bg-white/10" />
        </div>
        <SummaryCardSkeleton />
      </div>
    </div>
  );
}
