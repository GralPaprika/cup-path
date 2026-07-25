type ExtraParams = URLSearchParams | Record<string, string>;

export function mergePageParams(
  currentSearch: string,
  managedKeys: readonly string[],
  extra?: ExtraParams,
): URLSearchParams {
  const params = new URLSearchParams(currentSearch);
  params.delete("mode");
  for (const key of managedKeys) params.delete(key);

  if (!extra) return params;
  if (extra instanceof URLSearchParams) {
    extra.forEach((value, key) => {
      params.set(key, value);
    });
    return params;
  }

  for (const [key, value] of Object.entries(extra)) {
    if (value) params.set(key, value);
  }
  return params;
}

export function buildPageUrl(
  pathname: string,
  params: URLSearchParams,
  hash: string,
): string {
  const query = params.toString();
  return (query ? `${pathname}?${query}` : pathname) + hash;
}
