import type {
  KnockoutFactsRoundId,
  KnockoutStageAnalysis,
  RankingEntry,
} from "@/lib/types";
import { buildKnockoutStageAnalysis } from "@/lib/domain/knockout-stage-analysis";
import { KNOCKOUT_FACTS_ROUNDS } from "@/lib/domain/knockout-facts-round-config";

export { KNOCKOUT_FACTS_ROUNDS } from "@/lib/domain/knockout-facts-round-config";

export function buildKnockoutFactsAnalyses(
  rankings: Map<string, RankingEntry>,
): Partial<Record<KnockoutFactsRoundId, KnockoutStageAnalysis>> {
  const analyses: Partial<Record<KnockoutFactsRoundId, KnockoutStageAnalysis>> =
    {};

  for (const round of KNOCKOUT_FACTS_ROUNDS) {
    const analysis = buildKnockoutStageAnalysis(round.roundName, rankings);
    if (analysis) {
      analyses[round.id] = analysis;
    }
  }

  return analyses;
}
