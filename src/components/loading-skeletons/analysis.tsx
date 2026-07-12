import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

function StatBlockSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("glass-panel-subtle px-4 py-3", className)}>
      <Skeleton className="h-2.5 w-20 bg-white/10" />
      <Skeleton className="mt-1.5 h-6 w-16 bg-white/10" />
    </div>
  );
}

export function SummaryCardSkeleton() {
  return (
    <div className="glass-panel">
      <div className="border-b border-white/8 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-4">
          <Skeleton className="size-9 rounded-full bg-white/10" />
          <Skeleton className="h-7 w-44 bg-white/10" />
          <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
          <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
        </div>
        <Skeleton className="mt-2 h-4 w-48 bg-white/10" />
      </div>
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(17.5rem,1fr)_auto_minmax(14rem,1fr)] lg:items-center lg:gap-8">
        <div className="grid min-w-[17.5rem] grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)] gap-3 sm:min-w-[19rem]">
          <StatBlockSkeleton />
          <StatBlockSkeleton />
          <StatBlockSkeleton />
          <StatBlockSkeleton />
          <StatBlockSkeleton className="col-span-2" />
        </div>
        <div className="order-first flex min-w-0 flex-col items-center justify-center lg:order-none lg:min-w-[320px]">
          <Skeleton className="aspect-[300/168] w-full max-w-[300px] bg-white/10" />
        </div>
        <div className="glass-panel-subtle flex min-h-[9.5rem] flex-col justify-center px-6 py-5 sm:px-7 sm:py-6">
          <Skeleton className="h-2.5 w-24 bg-white/10" />
          <div className="mt-3 flex items-center gap-2">
            <Skeleton className="size-7 rounded-full bg-white/10" />
            <Skeleton className="h-6 w-28 bg-white/10" />
          </div>
        </div>
      </div>
      <div className="border-t border-white/8 px-5 py-4 sm:px-6">
        <Skeleton className="h-3 w-64 max-w-full bg-white/10" />
      </div>
    </div>
  );
}

const PATH_TABLE_COLS = 7;

export function PathTableSkeleton({ rows = 7 }: { rows?: number }) {
  return (
    <div className="glass-panel overflow-hidden">
      <div className="border-b border-white/8 px-5 py-4">
        <Skeleton className="h-6 w-40 bg-white/10" />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/8 hover:bg-transparent">
              {Array.from({ length: PATH_TABLE_COLS }).map((_, index) => (
                <TableHead key={index}>
                  <Skeleton
                    className={cn(
                      "h-4 bg-white/10",
                      index < 2 ? "w-16" : "ml-auto w-12",
                    )}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, row) => (
              <TableRow key={row} className="border-white/6 hover:bg-transparent">
                <TableCell>
                  <Skeleton className="h-4 w-24 bg-white/10" />
                  <Skeleton className="mt-1 h-3 w-16 bg-white/10" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-6 rounded-full bg-white/10" />
                    <Skeleton className="h-4 w-16 bg-white/10" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto h-4 w-12 bg-white/10" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto h-4 w-12 bg-white/10" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto h-4 w-10 bg-white/10" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto h-4 w-10 bg-white/10" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto h-6 w-16 rounded-full bg-white/10" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
