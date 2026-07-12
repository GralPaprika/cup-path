import type { RankingMode, TournamentFacts } from "@/lib/types";
import {
  buildAllTeamSummaries,
  buildComparison,
} from "@/lib/domain/difficulty";
import { buildGroupComparisonCards } from "@/lib/domain/group-comparison";
import { DEFAULT_PATH_STAGES } from "@/lib/domain/match-stages";
import { buildTournamentFacts } from "@/lib/domain/tournament-facts";
import { buildGroupExpectedAnalysis } from "@/lib/domain/group-expected-finishes";
import { buildGroupStageDifficultyStrip } from "@/lib/domain/group-stage-difficulty";
import { buildKnockoutFactsAnalyses } from "@/lib/domain/knockout-facts-rounds";
import { getTeamCountsByStage } from "@/lib/domain/team-stages";
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

  return {
    ...base,
    groupExpectedAnalysis: buildGroupExpectedAnalysis(ctx, rankings),
    groupStageDifficulty: buildGroupStageDifficultyStrip(ctx, allComparison),
    knockoutAnalyses: buildKnockoutFactsAnalyses(ctx, rankings),
  };
}
