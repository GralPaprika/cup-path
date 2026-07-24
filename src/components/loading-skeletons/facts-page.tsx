import { Skeleton } from "@/components/ui/skeleton";
import { KNOCKOUT_FACTS_ROUNDS } from "@/lib/domain/knockout/knockout-facts-round-config";
import {
  CollapsibleSectionSkeleton,
  ParticipantPoolSectionSkeleton,
} from "@/components/loading-skeletons/shared";

function KnockoutRoundSkeleton() {
  return (
    <div className="glass-panel space-y-6 p-5 sm:p-6">
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
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <Skeleton className="h-8 w-64 bg-white/10 sm:h-9" />
        <Skeleton className="mt-1 h-4 w-full max-w-3xl bg-white/10 sm:h-5" />
      </header>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="glass-panel h-fit space-y-6 p-5">
          {Array.from({ length: 2 }).map((_, groupIndex) => (
            <div key={groupIndex} className="space-y-3">
              <Skeleton className="h-2.5 w-20 bg-white/10" />
              {Array.from({ length: groupIndex === 0 ? 3 : 4 }).map(
                (__, itemIndex) => (
                  <Skeleton
                    key={itemIndex}
                    className="h-7 w-full rounded-lg bg-white/10"
                  />
                ),
              )}
            </div>
          ))}
        </aside>

        <div className="space-y-6">
          <div className="glass-panel space-y-4 p-5 sm:p-6">
            <Skeleton className="h-6 w-40 bg-white/10" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-white/10" />
              <Skeleton className="h-4 w-[92%] bg-white/10" />
              <Skeleton className="h-4 w-full bg-white/10" />
              <Skeleton className="h-4 w-[80%] bg-white/10" />
            </div>
            <Skeleton className="h-40 w-full rounded-xl bg-white/10" />
          </div>

          <div className="glass-panel overflow-hidden">
            <div className="border-b border-white/8 bg-white/[0.03] px-5 py-4">
              <Skeleton className="h-6 w-56 bg-white/10" />
              <Skeleton className="mt-1 h-4 w-80 max-w-full bg-white/10" />
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 rounded-lg bg-white/10" />
                ))}
              </div>
              <Skeleton className="h-52 w-full rounded-xl bg-white/10" />
            </div>
          </div>

          <div className="glass-panel space-y-6 p-5 sm:p-6">
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
    </div>
  );
}
