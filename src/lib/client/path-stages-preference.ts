import type { PathStage } from "@/lib/types";
import { parsePathStages } from "@/lib/domain/match/match-stages";
import { serializePathStages } from "@/components/path/path-stage-filters";

export type PathStagesPageId = "team-analysis" | "compare";

function storageKey(pageId: PathStagesPageId): string {
  return `cuppath:path-stages:${pageId}`;
}

export function readPathStagesPreference(
  pageId: PathStagesPageId,
): Set<PathStage> | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(storageKey(pageId));
  if (!raw) return null;

  return parsePathStages(raw);
}

export function writePathStagesPreference(
  pageId: PathStagesPageId,
  stages: Set<PathStage>,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(pageId), serializePathStages(stages));
}

export function readInitialPathStages(pageId: PathStagesPageId): Set<PathStage> {
  return readPathStagesPreference(pageId) ?? parsePathStages(null);
}
