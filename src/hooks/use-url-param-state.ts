"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { buildPageUrl, mergePageParams } from "@/lib/client/url-params";

export function useUrlParamState(
  pathname: string,
  key: string,
  fallback = "",
): readonly [string, (value: string) => void] {
  const searchParams = useSearchParams();
  const value = searchParams.get(key)?.toUpperCase() || fallback;

  const setValue = useCallback(
    (nextValue: string) => {
      const params = mergePageParams(window.location.search, [key], {
        [key]: nextValue,
      });
      const nextUrl = buildPageUrl(pathname, params, window.location.hash);
      const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (nextUrl !== currentUrl) {
        window.history.replaceState(null, "", nextUrl);
      }
    },
    [key, pathname],
  );

  return [value, setValue] as const;
}
