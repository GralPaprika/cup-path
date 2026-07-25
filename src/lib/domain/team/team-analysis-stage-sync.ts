import type { PathStage } from "@/lib/types";
import {
  clampPathStages,
  isStageWithinReach,
  stagesThrough,
} from "@/lib/domain/match/match-stages";

export function stagesNeedClamp(
  stages: Set<PathStage>,
  maxStage: PathStage,
): boolean {
  return [...stages].some((stage) => !isStageWithinReach(stage, maxStage));
}

export type TeamAnalysisStageSync =
  | { action: "expand"; stages: Set<PathStage> }
  | { action: "clamp"; stages: Set<PathStage> }
  | { action: "commit" };

/**
 * Decide how path stages should react to an analysis response.
 * - expand: team just changed (no known reach yet) → stagesThrough
 * - clamp: persisted/selected stages exceed reach → clamp and refetch
 * - commit: stages are valid → keep and accept the response
 */
export function resolveTeamAnalysisStageSync(
  stages: Set<PathStage>,
  maxStageReached: PathStage | undefined,
  responseMaxStage: PathStage,
): TeamAnalysisStageSync {
  if (maxStageReached === undefined) {
    return {
      action: "expand",
      stages: stagesThrough(responseMaxStage),
    };
  }

  if (stagesNeedClamp(stages, responseMaxStage)) {
    return {
      action: "clamp",
      stages: clampPathStages(stages, responseMaxStage),
    };
  }

  return { action: "commit" };
}
