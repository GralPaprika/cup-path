import { Skeleton } from "@/components/ui/skeleton";
import { SummaryCardSkeleton } from "@/components/loading-skeletons/analysis";

export function PageShellSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-72 bg-white/10" />
        <Skeleton className="h-5 w-96 max-w-full bg-white/10" />
      </div>
      <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="glass-panel space-y-4 p-4 md:space-y-6 md:p-5">
          <Skeleton className="h-12 w-full rounded-xl bg-white/10" />
          <div className="flex flex-wrap gap-1.5 md:hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-16 rounded-lg bg-white/10" />
            ))}
          </div>
          <div className="hidden space-y-2 md:block">
            <Skeleton className="h-4 w-24 bg-white/10" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-lg bg-white/10" />
            ))}
          </div>
        </div>
        <div className="min-w-0">
          <SummaryCardSkeleton />
        </div>
      </div>
    </div>
  );
}
