"use client";

import { useCallback, useEffect, useState } from "react";
import type { PathStage } from "@/lib/types";
import { parsePathStages } from "@/lib/domain/match/match-stages";
import {
  readInitialPathStages,
  writePathStagesPreference,
  type PathStagesPageId,
} from "@/lib/client/path-stages-preference";

type StagesUpdater = Set<PathStage> | ((prev: Set<PathStage>) => Set<PathStage>);

export function usePersistedPathStages(
  pageId: PathStagesPageId,
): [Set<PathStage>, (next: StagesUpdater) => void, boolean] {
  const [stages, setStagesState] = useState<Set<PathStage>>(() =>
    parsePathStages(null),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStagesState(readInitialPathStages(pageId));
    setHydrated(true);
  }, [pageId]);

  const setStages = useCallback(
    (next: StagesUpdater) => {
      setStagesState((current) => {
        const resolved = typeof next === "function" ? next(current) : next;
        writePathStagesPreference(pageId, resolved);
        return resolved;
      });
    },
    [pageId],
  );

  return [stages, setStages, hydrated];
}
