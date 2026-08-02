"use client";

import { useEffect, useState } from "react";

const MD_QUERY = "(min-width: 768px)";

/**
 * Matches Tailwind `md`. Defaults to `true` so tablet/desktop geometry is used
 * until the client measures — avoids flashing a phone layout on larger screens.
 */
export function useMinWidthMd(): boolean {
  const [matches, setMatches] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia(MD_QUERY);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return matches;
}
