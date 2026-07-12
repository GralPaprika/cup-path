import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export type StatTileSkeletonVariant =
  | "simple"
  | "dual"
  | "withPreview"
  | "qualifier";

export const AT_GLANCE_MATCH_TILES: StatTileSkeletonVariant[] = [
  "dual",
  "withPreview",
  "withPreview",
  "withPreview",
];

function MatchPreviewSkeletonExtra() {
  return (
    <div className="mt-3 space-y-2 border-t border-white/8 pt-3">
      <Skeleton className="h-2.5 w-12 bg-white/10" />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Skeleton className="size-4 rounded-full bg-white/10" />
          <Skeleton className="h-3 w-8 bg-white/10" />
        </div>
        <Skeleton className="h-3 w-12 bg-white/10" />
      </div>
      <Skeleton className="mx-auto h-3 w-20 bg-white/10" />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Skeleton className="size-4 rounded-full bg-white/10" />
          <Skeleton className="h-3 w-8 bg-white/10" />
        </div>
        <Skeleton className="h-3 w-12 bg-white/10" />
      </div>
    </div>
  );
}

const STAT_TILE_SKELETON_EXTRAS: Record<
  StatTileSkeletonVariant,
  ReactNode | null
> = {
  simple: <Skeleton className="mt-1.5 h-3 w-32 bg-white/10" />,
  dual: (
    <>
      <Skeleton className="mt-3 h-2.5 w-20 bg-white/10" />
      <Skeleton className="mt-1 h-7 w-16 bg-white/10" />
      <Skeleton className="mt-2 h-3 w-28 bg-white/10" />
    </>
  ),
  qualifier: (
    <>
      <div className="mt-2 flex items-center gap-2">
        <Skeleton className="size-5 rounded-full bg-white/10" />
        <Skeleton className="h-4 w-16 bg-white/10" />
      </div>
      <Skeleton className="mt-2 h-4 w-36 bg-white/10" />
      <Skeleton className="mt-1 h-3 w-40 bg-white/10" />
    </>
  ),
  withPreview: <MatchPreviewSkeletonExtra />,
};

export function StatTileSkeleton({
  variant = "simple",
}: {
  variant?: StatTileSkeletonVariant;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <Skeleton className="h-2.5 w-24 bg-white/10" />
      <Skeleton className="mt-1 h-7 w-20 bg-white/10" />
      {STAT_TILE_SKELETON_EXTRAS[variant]}
    </div>
  );
}

export function ParticipantPoolSectionSkeleton() {
  return (
    <section className="glass-panel space-y-4 p-5 sm:p-6">
      <div>
        <Skeleton className="h-6 w-48 bg-white/10" />
        <Skeleton className="mt-1 h-4 w-72 max-w-full bg-white/10" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatTileSkeleton variant="simple" />
        <StatTileSkeleton />
        <StatTileSkeleton variant="qualifier" />
      </div>
    </section>
  );
}

export function CollapsibleSectionSkeleton({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="glass-panel overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-white/8 bg-white/[0.03] px-5 py-4">
        <div>
          <Skeleton className="h-6 w-56 bg-white/10" />
          <Skeleton className="mt-1 h-4 w-80 max-w-full bg-white/10" />
        </div>
        <Skeleton className="size-5 shrink-0 rounded bg-white/10" />
      </div>
      <div className="space-y-6 p-5 sm:p-6">{children}</div>
    </div>
  );
}

export function AtGlanceRowSkeleton({
  tileVariants,
}: {
  tileVariants: StatTileSkeletonVariant[];
}) {
  return (
    <div>
      <Skeleton className="mb-2 h-3.5 w-40 bg-white/10" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tileVariants.map((variant, index) => (
          <StatTileSkeleton key={index} variant={variant} />
        ))}
      </div>
    </div>
  );
}

export function QualificationLegendSkeleton() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-4 w-24 bg-white/10" />
      ))}
    </div>
  );
}

export function GroupCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
        <Skeleton className="h-5 w-20 bg-white/10" />
        <Skeleton className="h-5 w-24 bg-white/10" />
      </div>
      <div className="space-y-3 p-3">
        {Array.from({ length: 4 }).map((_, row) => (
          <div key={row} className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 bg-white/10" />
            <Skeleton className="size-5 rounded-full bg-white/10" />
            <Skeleton className="h-4 flex-1 bg-white/10" />
            <Skeleton className="h-4 w-8 bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GroupDetailPanelSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <Skeleton className="h-6 w-48 bg-white/10" />
      <Skeleton className="h-4 w-72 bg-white/10" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-full bg-white/10" />
        ))}
      </div>
      <Skeleton className="aspect-[2/1] w-full rounded-xl bg-white/10" />
    </div>
  );
}

export function GroupsAdvancedPanelSkeleton() {
  return (
    <div className="glass-panel overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-white/8 bg-white/[0.03] px-5 py-4">
        <div>
          <Skeleton className="h-6 w-56 bg-white/10" />
          <Skeleton className="mt-1 h-4 w-80 max-w-full bg-white/10" />
        </div>
        <Skeleton className="size-5 shrink-0 rounded bg-white/10" />
      </div>
      <div className="space-y-5 px-5 py-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="glass-panel-subtle rounded-xl px-4 py-3"
            >
              <Skeleton className="h-2.5 w-24 bg-white/10" />
              <Skeleton className="mt-1 h-7 w-28 bg-white/10" />
            </div>
          ))}
        </div>
        <div className="space-y-2 rounded-xl border border-white/8 p-3">
          <Skeleton className="h-4 w-full bg-white/10" />
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full bg-white/10" />
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="glass-panel-subtle rounded-xl px-4 py-3"
            >
              <Skeleton className="h-2.5 w-20 bg-white/10" />
              <Skeleton className="mt-1 h-7 w-16 bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
