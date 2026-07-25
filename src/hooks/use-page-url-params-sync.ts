"use client";

import { useUrlParamsSync } from "@/hooks/use-url-params-sync";
import { mergePageParams } from "@/lib/client/url-params";

type ExtraParams = URLSearchParams | Record<string, string>;

/** Preserve unrelated query state while syncing page-owned URL parameters. */
export function usePageUrlParamsSync(
  pathname: string,
  buildExtraParams?: () => ExtraParams,
  deps: unknown[] = [],
  managedKeys: readonly string[] = [],
  enabled = true,
) {
  useUrlParamsSync(
    pathname,
    () =>
      mergePageParams(
        window.location.search,
        managedKeys,
        buildExtraParams?.(),
      ),
    deps,
    enabled,
  );
}
