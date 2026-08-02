import { Skeleton } from "@/components/ui/skeleton";
import {
  PathTableSkeleton,
  SummaryCardSkeleton,
} from "@/components/loading-skeletons/analysis";

export function PageShellSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 min-w-0 space-y-2">
        <Skeleton className="h-8 w-72 bg-white/10 sm:h-9" />
        <Skeleton className="h-4 w-96 max-w-full bg-white/10 sm:h-5" />
      </header>

      <div className="glass-panel mb-6 space-y-4 p-4 md:hidden">
        <Skeleton className="h-12 w-full rounded-xl bg-white/10" />
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-7 w-16 rounded-full bg-white/10"
            />
          ))}
        </div>
      </div>

      <div className="sticky top-0 z-20 -mx-4 mb-6 hidden border-b border-white/10 bg-wc-navy/95 px-4 py-2.5 backdrop-blur-xl sm:-mx-6 sm:px-6 md:block">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16 bg-white/10" />
            <Skeleton className="h-11 w-44 rounded-xl bg-white/10" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-end space-y-1.5">
            <Skeleton className="h-3 w-28 bg-white/10" />
            <div className="flex flex-wrap justify-end gap-1.5">
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

      <div className="min-w-0 space-y-6">
        <SummaryCardSkeleton />
        <PathTableSkeleton />
      </div>
    </div>
  );
}
