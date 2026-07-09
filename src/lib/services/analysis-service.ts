import type { ComparisonEntry, PathStage, RankingMode, TeamPathSummary } from "@/lib/types";
import {
  applyStageFilterToSummary,
  buildAllTeamSummaries,
  buildComparison,
  buildTeamPathSummary,
  getHardestPathRank,
} from "@/lib/domain/difficulty";
import { DEFAULT_PATH_STAGES, getFurthestStage } from "@/lib/domain/match-stages";
import { getTeamMaxStageReached, getTeamsAtStage } from "@/lib/domain/team-stages";
import { buildRankingsMap, getRankingsSnapshot } from "@/lib/data/rankings-store";
import { ensureWorldCupData } from "@/lib/data/worldcup-store";

export interface TeamAnalysisResult {
  summary: TeamPathSummary;
  hardestPathRank: number | null;
  cohortSize: number;
  cohortStage: PathStage;
  maxStageReached: PathStage;
}

export async function getTeamAnalysis(
  teamId: string,
  mode: RankingMode,
  stages: Set<PathStage> = new Set(DEFAULT_PATH_STAGES),
): Promise<TeamAnalysisResult | null> {
  await ensureWorldCupData();
  const snapshot = await getRankingsSnapshot(mode);
  const rankings = buildRankingsMap(snapshot);
  const summary = buildTeamPathSummary(teamId, rankings);

  if (!summary) return null;

  const allSummaries = buildAllTeamSummaries(rankings);
  const cohortStage = getFurthestStage(stages);
  const cohortTeamIds = getTeamsAtStage(cohortStage);
  const { rank, cohortSize } = getHardestPathRank(
    allSummaries,
    teamId,
    stages,
    cohortTeamIds,
  );

  return {
    summary: applyStageFilterToSummary(summary, stages),
    hardestPathRank: rank,
    cohortSize,
    cohortStage,
    maxStageReached: getTeamMaxStageReached(teamId),
  };
}

export interface ComparisonAnalysisResult {
  comparison: ComparisonEntry[];
  cohortStage: PathStage;
  cohortSize: number;
  maxStageReached?: PathStage;
}

export async function getComparisonAnalysis(
  mode: RankingMode,
  selectedTeamId?: string,
  stages: Set<PathStage> = new Set(DEFAULT_PATH_STAGES),
  teamRound: PathStage = "group",
): Promise<ComparisonAnalysisResult> {
  await ensureWorldCupData();
  const snapshot = await getRankingsSnapshot(mode);
  const rankings = buildRankingsMap(snapshot);
  let summaries = buildAllTeamSummaries(rankings);

  const cohortStage = getFurthestStage(stages);
  const cohortTeamIds = getTeamsAtStage(cohortStage);

  if (teamRound !== "group") {
    const teamIds = getTeamsAtStage(teamRound);
    summaries = summaries.filter((summary) => teamIds.has(summary.team.id));
  }

  const comparison = buildComparison(
    summaries,
    selectedTeamId,
    stages,
    cohortTeamIds,
  );

  return {
    comparison,
    cohortStage,
    cohortSize: cohortTeamIds.size,
    maxStageReached: selectedTeamId
      ? getTeamMaxStageReached(selectedTeamId)
      : undefined,
  };
}
