"use client";

import { useEffect } from "react";

export function useUrlParamsSync(
  pathname: string,
  buildParams: () => URLSearchParams,
  deps: unknown[],
) {
  useEffect(() => {
    const params = buildParams();
    const nextUrl = `${pathname}?${params.toString()}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (currentUrl !== nextUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls sync via deps
  }, deps);
}
