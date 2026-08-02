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
    <div className="glass-panel min-w-0 overflow-hidden">
      <div className="border-b border-white/8 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col items-center gap-5 md:flex-row md:justify-center md:gap-8 lg:gap-10">
          <div className="flex w-full max-w-[280px] shrink-0 flex-col items-center justify-center lg:max-w-[320px]">
            <Skeleton className="aspect-[300/168] w-full max-w-[240px] bg-white/10 sm:max-w-[300px]" />
            <Skeleton className="mt-2 h-3 w-28 bg-white/10" />
          </div>
          <div className="flex min-w-0 max-w-xl flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="size-9 rounded-full bg-white/10" />
              <Skeleton className="h-7 w-44 max-w-full bg-white/10" />
              <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
              <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
              <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
            </div>
            <Skeleton className="h-4 w-40 bg-white/10" />
            <Skeleton className="h-14 w-full max-w-sm rounded-2xl bg-white/10" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4 sm:p-6 md:grid-cols-4">
        <StatBlockSkeleton />
        <StatBlockSkeleton />
        <StatBlockSkeleton />
        <StatBlockSkeleton />
      </div>
      <div className="border-t border-white/8 px-4 py-4 sm:px-6">
        <Skeleton className="h-3 w-64 max-w-full bg-white/10" />
      </div>
    </div>
  );
}

const PATH_TABLE_COLS = 7;

export function PathTableSkeleton({ rows = 7 }: { rows?: number }) {
  return (
    <div className="glass-panel min-w-0 overflow-hidden">
      <div className="border-b border-white/8 px-4 py-4 sm:px-5">
        <Skeleton className="h-6 w-40 bg-white/10" />
      </div>

      <ul className="divide-y divide-white/6 md:hidden">
        {Array.from({ length: rows }).map((_, row) => (
          <li key={row} className="space-y-2 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <Skeleton className="h-4 w-24 bg-white/10" />
                <Skeleton className="h-3 w-16 bg-white/10" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="size-6 rounded-full bg-white/10" />
              <Skeleton className="h-4 w-28 bg-white/10" />
            </div>
            <Skeleton className="ml-auto h-4 w-14 bg-white/10" />
          </li>
        ))}
      </ul>

      <div className="hidden min-w-0 overflow-x-auto md:block">
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
