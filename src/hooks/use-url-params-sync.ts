"use client";

import { useEffect } from "react";
import { buildPageUrl } from "@/lib/client/url-params";

export function useUrlParamsSync(
  pathname: string,
  buildParams: () => URLSearchParams,
  deps: unknown[],
) {
  useEffect(() => {
    const params = buildParams();
    const nextUrl = buildPageUrl(pathname, params, window.location.hash);
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (currentUrl !== nextUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls sync via deps
  }, deps);
}
