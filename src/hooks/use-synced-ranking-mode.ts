"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { parseRankingMode } from "@/lib/data/ranking-modes";
import type { RankingMode } from "@/lib/types";
import {
  resolveRankingMode,
  writeRankingModePreference,
} from "@/lib/client/ranking-mode-preference";

export function useSyncedRankingMode(
  searchParams: ReadonlyURLSearchParams,
): [RankingMode, (mode: RankingMode) => void] {
  const [mode, setModeState] = useState<RankingMode>(() =>
    resolveRankingMode(searchParams.get("mode")),
  );

  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode) {
      const resolved = parseRankingMode(urlMode);
      setModeState((current) => {
        if (current !== resolved) {
          writeRankingModePreference(resolved);
        }
        return resolved;
      });
    }
  }, [searchParams]);

  const setMode = useCallback((next: RankingMode) => {
    writeRankingModePreference(next);
    setModeState(next);
  }, []);

  return [mode, setMode];
}
