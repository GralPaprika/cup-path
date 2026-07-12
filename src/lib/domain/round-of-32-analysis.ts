import type { RankingEntry, Round32Analysis, TeamPathSummary } from "@/lib/types";
import { buildKnockoutStageAnalysis } from "@/lib/domain/knockout-stage-analysis";

export function buildRound32Analysis(
  _summaries: TeamPathSummary[],
  rankings: Map<string, RankingEntry>,
): Round32Analysis | null {
  return buildKnockoutStageAnalysis("Round of 32", rankings);
}
