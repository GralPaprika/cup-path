import { Skeleton } from "@/components/ui/skeleton";
import { KNOCKOUT_FACTS_ROUNDS } from "@/lib/domain/knockout/knockout-facts-round-config";
import {
  AT_GLANCE_MATCH_TILES,
  AtGlanceRowSkeleton,
  CollapsibleSectionSkeleton,
  ParticipantPoolSectionSkeleton,
} from "@/components/loading-skeletons/shared";

function KnockoutRoundSkeleton({ glanceRows = 1 }: { glanceRows?: number }) {
  return (
    <div className="space-y-6">
      <ParticipantPoolSectionSkeleton />
      <CollapsibleSectionSkeleton>
        <div className="space-y-4">
          <Skeleton className="h-2.5 w-24 bg-white/10" />
          {Array.from({ length: glanceRows }).map((_, index) => (
            <AtGlanceRowSkeleton
              key={index}
              tileVariants={AT_GLANCE_MATCH_TILES}
            />
          ))}
        </div>
      </CollapsibleSectionSkeleton>
    </div>
  );
}

export function FactsPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <Skeleton className="h-8 w-64 bg-white/10 sm:h-9" />
        <Skeleton className="mt-1 h-4 w-full max-w-3xl bg-white/10 sm:h-5" />
      </header>

      <div className="space-y-6">
        <ParticipantPoolSectionSkeleton />

        <CollapsibleSectionSkeleton>
          <div className="space-y-4">
            <Skeleton className="h-2.5 w-24 bg-white/10" />
            <AtGlanceRowSkeleton tileVariants={AT_GLANCE_MATCH_TILES} />
            <AtGlanceRowSkeleton tileVariants={AT_GLANCE_MATCH_TILES} />
          </div>
        </CollapsibleSectionSkeleton>

        {KNOCKOUT_FACTS_ROUNDS.map((round) => (
          <KnockoutRoundSkeleton key={round.id} />
        ))}

        <section className="space-y-4">
          <Skeleton className="h-6 w-40 bg-white/10" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((__, cardIndex) => (
              <div
                key={cardIndex}
                className="rounded-xl border border-white/8 bg-white/[0.03] p-4"
              >
                <Skeleton className="h-2.5 w-32 bg-white/10" />
                <Skeleton className="mt-2 h-7 w-24 bg-white/10" />
                <Skeleton className="mt-2 h-4 w-40 bg-white/10" />
                <Skeleton className="mt-3 h-3 w-full bg-white/10" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
