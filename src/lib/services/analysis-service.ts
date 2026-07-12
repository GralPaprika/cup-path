import type {
  AvgPointsContext,
  ComparisonEntry,
  GroupComparisonCard,
  GroupPointsBenchmarks,
  GroupStrengthOrdering,
  PathStage,
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
  computeGroupPointsBenchmarks,
  computeGroupStrengthOrdering,
} from "@/lib/domain/group-strength-ordering";
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
import {
  getCompareMaxStageReached,
  getTeamCountsByStage,
  getTeamMaxStageReached,
  getTeamsAtStage,
} from "@/lib/domain/team-stages";
import { loadTournamentRuntime } from "@/lib/services/tournament-runtime";

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
  const { ctx, rankings } = await loadTournamentRuntime(mode);
  const summary = buildTeamPathSummary(ctx, teamId, rankings);

  if (!summary) return null;

  const allSummaries = buildAllTeamSummaries(ctx, rankings);
  const cohortStage = getFurthestStage(stages);
  const cohortTeamIds = getTeamsAtStage(ctx, cohortStage);
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
      ctx,
      filteredSummary.avgOpponentPoints,
      rankings.values(),
      { excludeTeamId: teamId },
    ),
    hardestPathRank: rank,
    hardestPathRankByAvgRank: rankByAvgRank,
    cohortSize,
    cohortStage,
    maxStageReached: getTeamMaxStageReached(ctx, teamId),
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
  teamCounts: Record<PathStage, number>;
}

export interface GroupsAnalysisResult {
  groups: GroupComparisonCard[];
  strengthOrdering: GroupStrengthOrdering;
  pointsBenchmarks: GroupPointsBenchmarks | null;
}

export async function getComparisonAnalysis(
  mode: RankingMode,
  selectedTeamId?: string,
  stages: Set<PathStage> = new Set(DEFAULT_PATH_STAGES),
  teamRound: PathStage = "group",
  compareTeamId?: string,
): Promise<ComparisonAnalysisResult> {
  const { ctx, rankings } = await loadTournamentRuntime(mode);
  const allSummaries = buildAllTeamSummaries(ctx, rankings);

  const cohortStage = getFurthestStage(stages);
  const cohortTeamIds = getTeamsAtStage(ctx, cohortStage);

  let filteredSummaries = allSummaries;
  if (teamRound !== "group") {
    const teamIds = getTeamsAtStage(ctx, teamRound);
    filteredSummaries = allSummaries.filter((summary) =>
      teamIds.has(summary.team.id),
    );
  }

  const comparison = buildComparison(
    ctx,
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
    maxStageReached: getCompareMaxStageReached(
      ctx,
      selectedTeamId,
      compareTeamId,
    ),
    teamCounts: getTeamCountsByStage(ctx),
  };
}

export async function getGroupsAnalysis(
  mode: RankingMode,
): Promise<GroupsAnalysisResult> {
  const { ctx, rankings } = await loadTournamentRuntime(mode);
  const allSummaries = buildAllTeamSummaries(ctx, rankings);
  const comparison = buildComparison(
    ctx,
    allSummaries,
    undefined,
    new Set(DEFAULT_PATH_STAGES),
    getTeamsAtStage(ctx, "group"),
    rankings,
  );
  const groups = buildGroupComparisonCards(ctx, comparison, rankings, "group");

  return {
    groups,
    strengthOrdering: computeGroupStrengthOrdering(groups),
    pointsBenchmarks: computeGroupPointsBenchmarks(groups),
  };
}
