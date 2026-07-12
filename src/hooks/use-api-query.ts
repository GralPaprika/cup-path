"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseApiQueryOptions {
  enabled?: boolean;
  errorMessage?: string;
  method?: "GET" | "POST";
  body?: unknown;
  headers?: Record<string, string>;
}

export function useApiQuery<T>(
  url: string | null,
  deps: unknown[],
  options: UseApiQueryOptions = {},
) {
  const {
    enabled = true,
    errorMessage = "Failed to load",
    method = "GET",
    body,
    headers,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled || !url) {
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method,
        signal: controller.signal,
        headers:
          method === "POST"
            ? { "Content-Type": "application/json", ...headers }
            : headers,
        body: method === "POST" && body !== undefined ? JSON.stringify(body) : undefined,
      });
      if (!response.ok) throw new Error("Failed to load");
      const json = (await response.json()) as T;
      if (!controller.signal.aborted) {
        setData(json);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (!controller.signal.aborted) {
        setError(errorMessage);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls invalidation via deps
  }, [url, enabled, errorMessage, method, body, headers, ...deps]);

  useEffect(() => {
    void fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
