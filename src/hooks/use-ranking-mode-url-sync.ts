"use client";

import { useRankingMode } from "@/components/layout/ranking-mode-provider";
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

export function useRankingModeUrlSync(
  pathname: string,
  buildExtraParams?: () => ExtraParams,
  deps: unknown[] = [],
) {
  const { mode } = useRankingMode();

  useUrlParamsSync(
    pathname,
    () => {
      const params = new URLSearchParams({ mode });
      if (buildExtraParams) {
        mergeExtraParams(params, buildExtraParams());
      }
      return params;
    },
    [mode, ...deps],
  );
}
