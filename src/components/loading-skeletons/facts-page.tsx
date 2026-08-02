import { Skeleton } from "@/components/ui/skeleton";
import { KNOCKOUT_FACTS_ROUNDS } from "@/lib/domain/knockout/knockout-facts-round-config";
import {
  CollapsibleSectionSkeleton,
  ParticipantPoolSectionSkeleton,
} from "@/components/loading-skeletons/shared";

function IntroSectionSkeleton() {
  return (
    <div className="glass-panel min-w-0 max-w-full overflow-hidden p-3 sm:p-5 md:p-6">
      <Skeleton className="h-6 w-40 bg-white/10" />
      <div className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3">
        <Skeleton className="h-4 w-full bg-white/10" />
        <Skeleton className="h-4 w-[92%] bg-white/10" />
        <Skeleton className="h-4 w-full bg-white/10" />
        <Skeleton className="h-4 w-[80%] bg-white/10" />
      </div>

      <ul className="mt-3 min-w-0 w-full divide-y divide-white/6 rounded-xl border border-white/8 md:hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <li key={index} className="min-w-0 space-y-3 px-2 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Skeleton className="h-6 w-28 rounded-full bg-white/10" />
              <Skeleton className="h-3 w-24 bg-white/10" />
            </div>
            <Skeleton className="h-3 w-full max-w-xs bg-white/10" />
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 6 }).map((__, flagIndex) => (
                <Skeleton
                  key={flagIndex}
                  className="size-5 rounded-full bg-white/10"
                />
              ))}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 hidden overflow-hidden rounded-xl border border-white/8 md:block">
        <div className="grid grid-cols-3 gap-3 border-b border-white/8 bg-white/[0.02] px-4 py-2.5">
          <Skeleton className="h-4 w-16 bg-white/10" />
          <Skeleton className="h-4 w-20 bg-white/10" />
          <Skeleton className="h-4 w-16 bg-white/10" />
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-3 items-center gap-3 border-b border-white/6 px-4 py-3 last:border-b-0"
          >
            <Skeleton className="h-6 w-28 rounded-full bg-white/10" />
            <Skeleton className="h-4 w-24 bg-white/10" />
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 5 }).map((__, flagIndex) => (
                <Skeleton
                  key={flagIndex}
                  className="size-5 rounded-full bg-white/10"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KnockoutRoundSkeleton() {
  return (
    <div className="glass-panel space-y-4 p-3 sm:space-y-6 sm:p-5 md:p-6">
      <div>
        <Skeleton className="h-6 w-40 bg-white/10" />
        <Skeleton className="mt-1 h-4 w-72 max-w-full bg-white/10" />
      </div>
      <ParticipantPoolSectionSkeleton embedded />
      <CollapsibleSectionSkeleton embedded />
    </div>
  );
}

export function FactsPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-8">
      <header className="mb-4 sm:mb-6">
        <Skeleton className="h-8 w-64 bg-white/10 sm:h-9" />
        <Skeleton className="mt-1 h-4 w-full max-w-3xl bg-white/10 sm:h-5" />
      </header>

      <div className="space-y-4 sm:space-y-6">
        <div className="sticky top-0 z-20 -mx-3 hidden border-b border-white/10 bg-wc-navy/95 px-3 py-2.5 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:block">
          <div className="flex w-full flex-wrap items-center gap-x-8 gap-y-2">
            {Array.from({ length: 2 }).map((_, groupIndex) => (
              <div
                key={groupIndex}
                className="flex flex-wrap items-center gap-x-3 gap-y-1.5"
              >
                <Skeleton className="h-2.5 w-16 bg-white/10" />
                {Array.from({ length: groupIndex === 0 ? 3 : 4 }).map(
                  (__, itemIndex) => (
                    <Skeleton
                      key={itemIndex}
                      className="h-7 w-24 rounded-lg bg-white/10"
                    />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>

        <IntroSectionSkeleton />

        <div className="glass-panel min-w-0 overflow-hidden">
          <div className="border-b border-white/8 bg-white/[0.03] px-3 py-3 sm:px-5 sm:py-4 md:px-6">
            <Skeleton className="h-6 w-56 bg-white/10" />
            <Skeleton className="mt-1 h-4 w-80 max-w-full bg-white/10" />
          </div>
          <div className="space-y-4 p-3 sm:space-y-5 sm:p-5 md:p-6">
            <div className="grid grid-cols-1 gap-2 md:gap-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 rounded-lg bg-white/10" />
              ))}
            </div>
            <Skeleton className="h-52 w-full rounded-xl bg-white/10" />
          </div>
        </div>

        <div className="glass-panel space-y-4 p-3 sm:space-y-6 sm:p-5 md:p-6">
          <div>
            <Skeleton className="h-6 w-48 bg-white/10" />
            <Skeleton className="mt-1 h-4 w-72 max-w-full bg-white/10" />
          </div>
          <ParticipantPoolSectionSkeleton embedded />
          <CollapsibleSectionSkeleton embedded />
        </div>

        {KNOCKOUT_FACTS_ROUNDS.map((round) => (
          <KnockoutRoundSkeleton key={round.id} />
        ))}
      </div>
    </div>
  );
}
