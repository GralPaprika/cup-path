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
import { buildRankingsMap, getRankingsSnapshot } from "@/lib/data/rankings-store";
import { ensureWorldCupData } from "@/lib/data/worldcup-store";

export async function getTournamentFacts(
  mode: RankingMode,
): Promise<TournamentFacts> {
  await ensureWorldCupData();
  const snapshot = await getRankingsSnapshot(mode);
  const rankings = buildRankingsMap(snapshot);
  const summaries = buildAllTeamSummaries(rankings);
  const teamCounts = getTeamCountsByStage();

  const allComparison = buildComparison(
    summaries,
    undefined,
    new Set(DEFAULT_PATH_STAGES),
    new Set(summaries.map((entry) => entry.team.id)),
    rankings,
  );
  const groupCards = buildGroupComparisonCards(allComparison, rankings);

  const base = buildTournamentFacts(summaries, rankings, teamCounts, groupCards);

  return {
    ...base,
    groupExpectedAnalysis: buildGroupExpectedAnalysis(rankings),
    groupStageDifficulty: buildGroupStageDifficultyStrip(allComparison),
    knockoutAnalyses: buildKnockoutFactsAnalyses(rankings),
  };
}
