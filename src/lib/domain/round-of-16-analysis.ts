import type { RankingEntry, Round16Analysis, TeamPathSummary } from "@/lib/types";
import { buildKnockoutStageAnalysis } from "@/lib/domain/knockout-stage-analysis";

export function buildRound16Analysis(
  _summaries: TeamPathSummary[],
  rankings: Map<string, RankingEntry>,
): Round16Analysis | null {
  return buildKnockoutStageAnalysis("Round of 16", rankings);
}
