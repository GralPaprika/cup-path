"use client";

import { useEffect, useState } from "react";
import {
  MIN_WIDTH_LG_QUERY,
  MIN_WIDTH_MD_QUERY,
} from "@/lib/client/breakpoints";

/**
 * Subscribe to a CSS media query. Defaults to `true` so desktop/tablet
 * geometry is used until the client measures — avoids flashing a phone layout
 * on larger screens.
 */
export function useMinWidth(query: string): boolean {
  const [matches, setMatches] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Matches Tailwind `md` ({@link MIN_WIDTH_MD_QUERY}). */
export function useMinWidthMd(): boolean {
  return useMinWidth(MIN_WIDTH_MD_QUERY);
}

/** Matches Tailwind `lg` ({@link MIN_WIDTH_LG_QUERY}). */
export function useMinWidthLg(): boolean {
  return useMinWidth(MIN_WIDTH_LG_QUERY);
}
