"use client";

import { useUrlParamsSync } from "@/hooks/use-url-params-sync";

type ExtraParams = URLSearchParams | Record<string, string>;

function mergeExtraParams(
  params: URLSearchParams,
  extra: ExtraParams,
): URLSearchParams {
  if (extra instanceof URLSearchParams) {
    extra.forEach((value, key) => {
      params.set(key, value);
    });
    return params;
  }

  for (const [key, value] of Object.entries(extra)) {
    if (value) {
      params.set(key, value);
    }
  }

  return params;
}

/** Sync non-mode page state into the URL. Ranking mode lives in a cookie. */
export function useRankingModeUrlSync(
  pathname: string,
  buildExtraParams?: () => ExtraParams,
  deps: unknown[] = [],
) {
  useUrlParamsSync(
    pathname,
    () => {
      const params = new URLSearchParams();
      if (buildExtraParams) {
        mergeExtraParams(params, buildExtraParams());
      }
      return params;
    },
    deps,
  );
}
