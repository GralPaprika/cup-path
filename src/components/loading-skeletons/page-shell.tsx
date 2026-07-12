import { Skeleton } from "@/components/ui/skeleton";
import { SummaryCardSkeleton } from "@/components/loading-skeletons/analysis";

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
