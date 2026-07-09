import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function StatBlockSkeleton({ highlight = false }: { highlight?: boolean }) {
  return (
    <div
      className={
        highlight
          ? "rounded-xl bg-hermes-900/10 p-4"
          : "rounded-xl border bg-muted/40 p-4"
      }
    >
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-8 w-24" />
    </div>
  );
}

export function SummaryCardSkeleton() {
  return (
    <Card className="overflow-hidden border-hermes-100/60 shadow-lg shadow-hermes-900/5">
      <CardHeader className="border-b bg-gradient-to-r from-hermes-50 to-white pb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-4">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <StatBlockSkeleton key={index} />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <div className="grid gap-3 sm:grid-cols-2">
            <StatBlockSkeleton highlight />
            <StatBlockSkeleton />
            <StatBlockSkeleton />
            <StatBlockSkeleton />
            <div className="rounded-xl border border-dashed border-hermes-200 bg-hermes-50/50 p-4 sm:col-span-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="mt-3 h-6 w-40" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PathTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card className="border-hermes-100/60 shadow-sm">
      <CardHeader className="border-b bg-hermes-50/50">
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <div className="grid grid-cols-6 gap-3 border-b pb-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="grid grid-cols-6 items-center gap-3 py-1">
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="ml-auto h-4 w-12" />
            <Skeleton className="ml-auto h-4 w-8" />
            <Skeleton className="ml-auto h-4 w-8" />
            <Skeleton className="ml-auto h-6 w-14 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ComparisonTableSkeleton({
  rows = 12,
  showDelta = false,
}: {
  rows?: number;
  showDelta?: boolean;
}) {
  return (
    <Card className="border-hermes-100/60 shadow-sm">
      <CardHeader className="border-b bg-hermes-50/50">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3 rounded-xl border p-4">
          <div
            className={`grid gap-3 border-b pb-3 ${showDelta ? "grid-cols-6" : "grid-cols-5"}`}
          >
            {Array.from({ length: showDelta ? 6 : 5 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, row) => (
            <div
              key={row}
              className={`grid items-center gap-3 ${showDelta ? "grid-cols-6" : "grid-cols-5"}`}
            >
              <Skeleton className="h-4 w-6" />
              <div className="flex items-center gap-2">
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="ml-auto h-4 w-12" />
              <Skeleton className="ml-auto h-4 w-8" />
              <Skeleton className="h-6 w-16 rounded-full" />
              {showDelta && <Skeleton className="ml-auto h-4 w-10" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
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
    return (
      <div className="space-y-4 px-4 py-2 sm:px-6">
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        <div className="space-y-3 rounded-xl border p-4">
          <div
            className={`grid gap-3 border-b pb-3 ${showDelta ? "grid-cols-6" : "grid-cols-5"}`}
          >
            {Array.from({ length: showDelta ? 6 : 5 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
          {Array.from({ length: 10 }).map((_, row) => (
            <div
              key={row}
              className={`grid items-center gap-3 ${showDelta ? "grid-cols-6" : "grid-cols-5"}`}
            >
              <Skeleton className="h-4 w-6" />
              <div className="flex items-center gap-2">
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="ml-auto h-4 w-12" />
              <Skeleton className="ml-auto h-4 w-8" />
              <Skeleton className="h-6 w-16 rounded-full" />
              {showDelta && <Skeleton className="ml-auto h-4 w-10" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <ComparisonTableSkeleton rows={48} showDelta={showDelta} />;
}

export function PageShellSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8">
      <section className="rounded-2xl border border-hermes-100/60 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
        <Skeleton className="h-10 w-80 max-w-full" />
        <Skeleton className="mt-3 h-5 w-96 max-w-full" />
      </section>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
        <div className="space-y-6 rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur">
          <Skeleton className="h-4 w-24" />
          <div className="grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <SummaryCardSkeleton />
      </div>
    </div>
  );
}
