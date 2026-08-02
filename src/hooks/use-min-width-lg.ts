"use client";

import { useEffect, useState } from "react";

const LG_QUERY = "(min-width: 1024px)";

/**
 * Matches Tailwind `lg`. Defaults to `true` so desktop chart geometry is used
 * until the client measures — avoids flashing a narrow layout on desktop.
 */
export function useMinWidthLg(): boolean {
  const [matches, setMatches] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia(LG_QUERY);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return matches;
}
