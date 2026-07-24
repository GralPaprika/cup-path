"use client";

import { useEffect } from "react";

export function useUrlParamsSync(
  pathname: string,
  buildParams: () => URLSearchParams,
  deps: unknown[],
) {
  useEffect(() => {
    const params = buildParams();
    const query = params.toString();
    const hash = window.location.hash;
    const nextUrl = (query ? `${pathname}?${query}` : pathname) + hash;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (currentUrl !== nextUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls sync via deps
  }, deps);
}
