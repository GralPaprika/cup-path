"use client";

interface FactsTablePaginationProps {
  pageStart: number;
  pageSize: number;
  totalItems: number;
  safePage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  pageInfo: string;
  pageCount: string;
  prevLabel: string;
  nextLabel: string;
}

export function FactsTablePagination({
  pageStart,
  pageSize,
  totalItems,
  safePage,
  totalPages,
  onPrev,
  onNext,
  pageInfo,
  pageCount,
  prevLabel,
  nextLabel,
}: FactsTablePaginationProps) {
  if (totalItems <= pageSize) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
      <p>{pageInfo}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={safePage === 0}
          onClick={onPrev}
          className="rounded-md border border-white/10 px-2.5 py-1 font-medium text-white transition-colors enabled:hover:border-white/20 enabled:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {prevLabel}
        </button>
        <span className="font-mono tabular-nums">{pageCount}</span>
        <button
          type="button"
          disabled={safePage >= totalPages - 1}
          onClick={onNext}
          className="rounded-md border border-white/10 px-2.5 py-1 font-medium text-white transition-colors enabled:hover:border-white/20 enabled:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
