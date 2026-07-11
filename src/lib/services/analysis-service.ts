import type {
  ComparisonEntry,
  GroupComparisonCard,
  PathStage,
  AvgPointsContext,
  RankingMode,
  TeamPathSummary,
} from "@/lib/types";
import { buildAvgPointsContext } from "@/lib/domain/points-anchor";
import {
  applyStageFilterToSummary,
  buildAllTeamSummaries,
  buildComparison,
  buildTeamPathSummary,
  getHardestPathRank,
} from "@/lib/domain/difficulty";
import { buildGroupComparisonCards } from "@/lib/domain/group-comparison";
import {
  collectCohortDifficultyValues,
  computePathOpponentStats,
  type PathOpponentStats,
} from "@/lib/domain/path-opponent-stats";
import {
  computeCohortOrderingCorrelation,
  type CohortOrderingCorrelation,
} from "@/lib/domain/rank-correlation";
import { DEFAULT_PATH_STAGES, getFurthestStage } from "@/lib/domain/match-stages";
import { getTeamMaxStageReached, getTeamsAtStage } from "@/lib/domain/team-stages";
import { buildRankingsMap, getRankingsSnapshot } from "@/lib/data/rankings-store";
import { ensureWorldCupData } from "@/lib/data/worldcup-store";

export interface TeamAnalysisAdvanced {
  pathStats: PathOpponentStats;
  cohortCorrelation: CohortOrderingCorrelation;
}

export interface TeamAnalysisResult {
  summary: TeamPathSummary;
  avgPointsContext: AvgPointsContext | null;
  hardestPathRank: number | null;
  hardestPathRankByAvgRank: number | null;
  cohortSize: number;
  cohortStage: PathStage;
  maxStageReached: PathStage;
  advanced: TeamAnalysisAdvanced;
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
  const { rank, rankByAvgRank, cohortSize } = getHardestPathRank(
    allSummaries,
    teamId,
    stages,
    cohortTeamIds,
  );

  const filteredSummary = applyStageFilterToSummary(summary, stages);
  const cohortSummaries = allSummaries.filter((entry) =>
    cohortTeamIds.has(entry.team.id),
  );
  const { pointsValues, rankValues } = collectCohortDifficultyValues(
    cohortSummaries,
    stages,
  );

  return {
    summary: filteredSummary,
    avgPointsContext: buildAvgPointsContext(
      filteredSummary.avgOpponentPoints,
      rankings.values(),
      { excludeTeamId: teamId },
    ),
    hardestPathRank: rank,
    hardestPathRankByAvgRank: rankByAvgRank,
    cohortSize,
    cohortStage,
    maxStageReached: getTeamMaxStageReached(teamId),
    advanced: {
      pathStats: computePathOpponentStats(summary.matches, stages),
      cohortCorrelation: computeCohortOrderingCorrelation(
        pointsValues,
        rankValues,
      ),
    },
  };
}

export interface ComparisonAnalysisResult {
  comparison: ComparisonEntry[];
  cohortStage: PathStage;
  cohortSize: number;
  maxStageReached?: PathStage;
}

export interface GroupsAnalysisResult {
  groups: GroupComparisonCard[];
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
  const allSummaries = buildAllTeamSummaries(rankings);

  const cohortStage = getFurthestStage(stages);
  const cohortTeamIds = getTeamsAtStage(cohortStage);

  let filteredSummaries = allSummaries;
  if (teamRound !== "group") {
    const teamIds = getTeamsAtStage(teamRound);
    filteredSummaries = allSummaries.filter((summary) =>
      teamIds.has(summary.team.id),
    );
  }

  const comparison = buildComparison(
    filteredSummaries,
    selectedTeamId,
    stages,
    cohortTeamIds,
    rankings,
  );

  return {
    comparison,
    cohortStage,
    cohortSize: filteredSummaries.filter((summary) =>
      cohortTeamIds.has(summary.team.id),
    ).length,
    maxStageReached: selectedTeamId
      ? getTeamMaxStageReached(selectedTeamId)
      : undefined,
  };
}

export async function getGroupsAnalysis(
  mode: RankingMode,
): Promise<GroupsAnalysisResult> {
  await ensureWorldCupData();
  const snapshot = await getRankingsSnapshot(mode);
  const rankings = buildRankingsMap(snapshot);
  const allSummaries = buildAllTeamSummaries(rankings);
  const comparison = buildComparison(
    allSummaries,
    undefined,
    new Set(DEFAULT_PATH_STAGES),
    getTeamsAtStage("group"),
    rankings,
  );
  const groups = buildGroupComparisonCards(comparison, rankings, "group");

  return { groups };
}
