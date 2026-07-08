import type { ComparisonEntry, RankingMode, TeamPathSummary } from "@/lib/types";
import {
  buildAllTeamSummaries,
  buildComparison,
  buildTeamPathSummary,
  getHardestPathRank,
} from "@/lib/domain/difficulty";
import { buildRankingsMap, getRankingsSnapshot } from "@/lib/data/rankings-store";

export interface TeamAnalysisResult {
  summary: TeamPathSummary;
  hardestPathRank: number | null;
  comparison: ComparisonEntry[];
}

export async function getTeamAnalysis(
  teamId: string,
  mode: RankingMode,
): Promise<TeamAnalysisResult | null> {
  const snapshot = await getRankingsSnapshot(mode);
  const rankings = buildRankingsMap(snapshot);
  const summary = buildTeamPathSummary(teamId, rankings);

  if (!summary) return null;

  const allSummaries = buildAllTeamSummaries(rankings);

  return {
    summary,
    hardestPathRank: getHardestPathRank(allSummaries, teamId),
    comparison: buildComparison(allSummaries, teamId),
  };
}

export async function getComparisonAnalysis(
  mode: RankingMode,
  selectedTeamId?: string,
): Promise<ComparisonEntry[]> {
  const snapshot = await getRankingsSnapshot(mode);
  const rankings = buildRankingsMap(snapshot);
  const summaries = buildAllTeamSummaries(rankings);
  return buildComparison(summaries, selectedTeamId);
}
