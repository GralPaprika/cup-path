"use client";

import { useEffect, useMemo, useState } from "react";

export const FACTS_TABLE_PAGE_SIZE = 10;

export function usePaginatedRows<T>(
  rows: T[],
  pageSize: number = FACTS_TABLE_PAGE_SIZE,
  resetToken?: unknown,
) {
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [rows, resetToken]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageStart = safePage * pageSize;

  const visibleRows = useMemo(
    () => rows.slice(pageStart, pageStart + pageSize),
    [rows, pageStart, pageSize],
  );

  return {
    visibleRows,
    pageStart,
    safePage,
    totalPages,
    showPagination: rows.length > pageSize,
    prevPage: () => setPage((current) => Math.max(0, current - 1)),
    nextPage: () =>
      setPage((current) => Math.min(totalPages - 1, current + 1)),
  };
}
