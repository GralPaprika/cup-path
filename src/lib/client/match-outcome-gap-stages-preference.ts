import type { PathStage } from "@/lib/types";
import {
  parsePathStages,
  PATH_STAGES,
  serializePathStages,
} from "@/lib/domain/match/match-stages";

const STORAGE_KEY = "cuppath:match-outcome-gap-stages";

export function readMatchOutcomeGapStagesPreference(): Set<PathStage> | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  return parsePathStages(raw);
}

export function writeMatchOutcomeGapStagesPreference(
  stages: Set<PathStage>,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, serializePathStages(stages));
}

export function defaultMatchOutcomeGapStages(
  availableStages: Set<PathStage>,
): Set<PathStage> {
  if (availableStages.size === 0) {
    return new Set<PathStage>(["group"]);
  }
  return new Set(
    PATH_STAGES.filter((stage) => availableStages.has(stage)),
  );
}

export function readInitialMatchOutcomeGapStages(
  availableStages: Set<PathStage>,
): Set<PathStage> {
  const stored = readMatchOutcomeGapStagesPreference();
  if (!stored) return defaultMatchOutcomeGapStages(availableStages);

  const filtered = new Set(
    [...stored].filter((stage) => availableStages.has(stage)),
  );
  return filtered.size > 0
    ? filtered
    : defaultMatchOutcomeGapStages(availableStages);
}
