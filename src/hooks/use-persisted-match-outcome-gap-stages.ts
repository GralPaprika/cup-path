"use client";

import { useCallback, useEffect, useState } from "react";
import type { PathStage } from "@/lib/types";
import {
  defaultMatchOutcomeGapStages,
  readInitialMatchOutcomeGapStages,
  writeMatchOutcomeGapStagesPreference,
} from "@/lib/client/match-outcome-gap-stages-preference";
import {
  parsePathStages,
  serializePathStages,
} from "@/lib/domain/match/match-stages";

type StagesUpdater = Set<PathStage> | ((prev: Set<PathStage>) => Set<PathStage>);

export function usePersistedMatchOutcomeGapStages(
  availableStages: Set<PathStage>,
): [Set<PathStage>, (next: StagesUpdater) => void, boolean] {
  const availableStagesKey = serializePathStages(availableStages);

  const [stages, setStagesState] = useState<Set<PathStage>>(() =>
    defaultMatchOutcomeGapStages(availableStages),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStagesState(readInitialMatchOutcomeGapStages(availableStages));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once from localStorage
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const available = parsePathStages(availableStagesKey);
    setStagesState((current) => {
      const filtered = new Set(
        [...current].filter((stage) => available.has(stage)),
      );
      return filtered.size > 0
        ? filtered
        : defaultMatchOutcomeGapStages(available);
    });
  }, [availableStagesKey, hydrated]);

  const setStages = useCallback((next: StagesUpdater) => {
    setStagesState((current) => {
      const resolved = typeof next === "function" ? next(current) : next;
      writeMatchOutcomeGapStagesPreference(resolved);
      return resolved;
    });
  }, []);

  return [stages, setStages, hydrated];
}
