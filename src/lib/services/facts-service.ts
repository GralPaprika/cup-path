import type { RankingMode, TournamentFacts } from "@/lib/types";
import {
  buildAllTeamSummaries,
  buildComparison,
} from "@/lib/domain/core/difficulty";
import { buildGroupComparisonCards } from "@/lib/domain/group/group-comparison";
import { DEFAULT_PATH_STAGES } from "@/lib/domain/match/match-stages";
import { buildTournamentFacts } from "@/lib/domain/tournament/tournament-facts";
import { buildGroupExpectedAnalysis } from "@/lib/domain/group/group-expected-finishes";
import { buildGroupStageDifficultyStrip } from "@/lib/domain/group/group-stage-difficulty";
import { buildKnockoutFactsAnalyses } from "@/lib/domain/knockout/knockout-facts-rounds";
import { computeEvenMatchesByTier } from "@/lib/domain/match/even-matches-by-tier";
import { buildMatchOutcomeGapDataset } from "@/lib/domain/match/match-outcome-gap";
import { getTeamCountsByStage } from "@/lib/domain/team/team-stages";
import { loadTournamentRuntime } from "@/lib/services/tournament-runtime";

export async function getTournamentFacts(
  mode: RankingMode,
): Promise<TournamentFacts> {
  const { ctx, rankings } = await loadTournamentRuntime(mode);
  const summaries = buildAllTeamSummaries(ctx, rankings);
  const teamCounts = getTeamCountsByStage(ctx);

  const allComparison = buildComparison(
    ctx,
    summaries,
    undefined,
    new Set(DEFAULT_PATH_STAGES),
    new Set(summaries.map((entry) => entry.team.id)),
    rankings,
  );
  const groupCards = buildGroupComparisonCards(ctx, allComparison, rankings);

  const base = buildTournamentFacts(
    ctx,
    summaries,
    rankings,
    teamCounts,
    groupCards,
  );

  const matchOutcomeGap = buildMatchOutcomeGapDataset(ctx, rankings);

  return {
    ...base,
    groupExpectedAnalysis: buildGroupExpectedAnalysis(ctx, rankings),
    groupStageDifficulty: buildGroupStageDifficultyStrip(
      ctx,
      allComparison,
      rankings,
    ),
    knockoutAnalyses: buildKnockoutFactsAnalyses(ctx, rankings),
    matchOutcomeGap,
    evenMatchesByTier: computeEvenMatchesByTier(matchOutcomeGap.matches),
  };
}
