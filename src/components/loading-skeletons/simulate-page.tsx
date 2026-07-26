import { Skeleton } from "@/components/ui/skeleton";

function GroupCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
      <Skeleton className="mb-2 h-3 w-16 bg-white/10" />
      <div className="space-y-1.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full rounded-lg bg-white/10" />
        ))}
      </div>
    </div>
  );
}

/** Content blocks only — use when the page header/picker are already rendered. */
export function SimulateContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="glass-panel flex gap-1 p-1.5">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-24 rounded-md bg-white/10" />
        ))}
      </div>

      <div className="glass-panel space-y-4 p-5 sm:p-6">
        <Skeleton className="h-6 w-56 bg-white/10" />
        <Skeleton className="h-4 w-72 max-w-full bg-white/10" />
        <Skeleton className="h-24 w-full rounded-xl bg-white/10" />
        <Skeleton className="h-48 w-full rounded-xl bg-white/10" />
      </div>

      <div className="glass-panel space-y-4 p-5 sm:p-6">
        <Skeleton className="h-6 w-48 bg-white/10" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <GroupCardSkeleton key={index} />
          ))}
        </div>
      </div>

      <div className="glass-panel space-y-4 p-5 sm:p-6">
        <Skeleton className="h-6 w-44 bg-white/10" />
        <Skeleton className="h-4 w-80 max-w-full bg-white/10" />
        <Skeleton className="h-64 w-full rounded-xl bg-white/10" />
      </div>
    </div>
  );
}

export function SimulatePageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 bg-white/10 sm:w-80" />
          <Skeleton className="h-5 w-full max-w-2xl bg-white/10" />
        </div>
        <Skeleton className="h-11 w-48 rounded-xl bg-white/10" />
      </div>

      <SimulateContentSkeleton />
    </div>
  );
}
