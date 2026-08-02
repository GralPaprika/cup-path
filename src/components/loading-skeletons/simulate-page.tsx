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

function ImpactCardSkeleton() {
  return (
    <div className="glass-panel-subtle flex flex-col gap-3 p-4">
      <Skeleton className="h-4 w-28 bg-white/10" />
      <div className="flex items-center gap-2">
        <Skeleton className="size-6 rounded-full bg-white/10" />
        <Skeleton className="h-5 w-32 bg-white/10" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-12 rounded-lg bg-white/10" />
        <Skeleton className="h-12 rounded-lg bg-white/10" />
      </div>
      <Skeleton className="h-24 w-full rounded-xl bg-white/10" />
    </div>
  );
}

/** Content blocks only — use when the page header is already rendered. */
export function SimulateContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="glass-panel space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-11 w-44 rounded-xl bg-white/10" />
          <Skeleton className="h-11 w-44 rounded-xl bg-white/10" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ImpactCardSkeleton />
          <ImpactCardSkeleton />
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="flex items-center justify-between gap-3 bg-white/[0.03] px-5 py-4">
          <div>
            <Skeleton className="h-6 w-48 bg-white/10" />
            <Skeleton className="mt-1 h-4 w-72 max-w-full bg-white/10" />
          </div>
          <Skeleton className="size-5 shrink-0 rounded bg-white/10" />
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <GroupCardSkeleton key={index} />
          ))}
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="flex items-center justify-between gap-3 bg-white/[0.03] px-5 py-4">
          <div>
            <Skeleton className="h-6 w-44 bg-white/10" />
            <Skeleton className="mt-1 h-4 w-64 max-w-full bg-white/10" />
          </div>
          <Skeleton className="size-5 shrink-0 rounded bg-white/10" />
        </div>
        <div className="px-5 py-4 sm:px-6">
          <Skeleton className="h-32 w-full rounded-xl bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export function SimulatePageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="space-y-2">
        <Skeleton className="h-8 w-64 bg-white/10 sm:h-9 sm:w-80" />
        <Skeleton className="h-4 w-full max-w-2xl bg-white/10 sm:h-5" />
      </header>

      <SimulateContentSkeleton />
    </div>
  );
}
