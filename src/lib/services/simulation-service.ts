import type { RankingMode, SimulationResult, SimulationScenario } from "@/lib/types";
import {
  computePendingWinnerMatchNums,
  findChangedMatchNums,
  getActualScenario,
  getDownstreamMatchNums,
  getFocusTeamMatchNums,
  resolveBracket,
} from "@/lib/domain/bracket-resolver";
import { buildAvgPointsContext } from "@/lib/domain/points-anchor";
import { buildProjectedTeamPathSummary } from "@/lib/domain/projected-path-builder";
import { buildTeamPathSummary } from "@/lib/domain/difficulty";
import { computePathDiff } from "@/lib/domain/path-diff";
import {
  buildBestThirdRanking,
  buildGroupFinishCards,
  getBaselineGroupFinishes,
  normalizeGroupFinishes,
} from "@/lib/domain/group-finishes";
import { hasStrongestWinnerTargets } from "@/lib/domain/strongest-path-winners";
import { getCompareMaxStageReached } from "@/lib/domain/team-stage-logic";
import { buildPathChartDataFromSummary } from "@/lib/domain/path-opponent-observations";
import { loadTournamentRuntime } from "@/lib/services/tournament-runtime";
import type { TournamentContext } from "@/lib/domain/tournament-context";

function mergeGroupFinishes(
  ctx: TournamentContext,
  scenario: SimulationScenario,
): SimulationScenario {
  const baseline = getBaselineGroupFinishes(ctx);
  if (!scenario.groupFinishes || Object.keys(scenario.groupFinishes).length === 0) {
    return scenario;
  }
  return {
    ...scenario,
    groupFinishes: normalizeGroupFinishes(ctx, {
      ...baseline,
      ...scenario.groupFinishes,
    }),
  };
}

function resolveSimulatedBracketState(
  ctx: TournamentContext,
  scenario: SimulationScenario,
) {
  const actualBracket = resolveBracket(ctx, getActualScenario());
  const preliminaryBracket = resolveBracket(ctx, scenario);
  const changedMatchNums = findChangedMatchNums(actualBracket, preliminaryBracket);
  const suppressPlayedResultsMatchNums =
    getDownstreamMatchNums(changedMatchNums);
  const simulatedBracket = resolveBracket(ctx, scenario, {
    suppressPlayedResultsMatchNums,
  });
  const pendingWinnerMatchNums = computePendingWinnerMatchNums(
    simulatedBracket,
    suppressPlayedResultsMatchNums,
    scenario.knockoutWinners,
  );

  return {
    actualBracket,
    simulatedBracket,
    changedMatchNums,
    pendingWinnerMatchNums,
    suppressPlayedResultsMatchNums,
    affectedMatchNums: [...suppressPlayedResultsMatchNums].sort((a, b) => a - b),
  };
}

function buildTeamRankingsMap(
  rankings: Map<string, import("@/lib/types").RankingEntry>,
): Record<string, { rank: number; points: number }> {
  const teamRankings: Record<string, { rank: number; points: number }> = {};
  for (const entry of rankings.values()) {
    teamRankings[entry.teamId] = {
      rank: entry.rank,
      points: entry.points,
    };
  }
  return teamRankings;
}

export async function getSimulationStrongestWinnersContext(
  scenario: SimulationScenario,
  mode: RankingMode,
) {
  const { ctx, rankings } = await loadTournamentRuntime(mode);
  const effectiveScenario = mergeGroupFinishes(ctx, scenario);
  const { actualBracket, suppressPlayedResultsMatchNums } =
    resolveSimulatedBracketState(ctx, effectiveScenario);

  const actualWinnersByMatchNum: Record<number, string | null> = {};
  for (const match of actualBracket) {
    actualWinnersByMatchNum[match.num] = match.winnerTeamId;
  }

  return {
    ctx,
    effectiveScenario,
    actualWinnersByMatchNum,
    teamRankings: buildTeamRankingsMap(rankings),
    suppressPlayedResultsMatchNums,
  };
}

export async function getSimulationAnalysis(
  teamId: string,
  mode: RankingMode,
  scenario: SimulationScenario,
  comparisonTeamId?: string | null,
): Promise<SimulationResult | null> {
  const { ctx, rankings } = await loadTournamentRuntime(mode);

  const actualSummary = buildTeamPathSummary(ctx, teamId, rankings);
  if (!actualSummary) return null;
  const comparisonActualSummary = comparisonTeamId
    ? buildTeamPathSummary(ctx, comparisonTeamId, rankings)
    : null;

  const effectiveScenario = mergeGroupFinishes(ctx, scenario);
  const {
    actualBracket,
    simulatedBracket,
    changedMatchNums,
    pendingWinnerMatchNums,
    suppressPlayedResultsMatchNums,
    affectedMatchNums,
  } = resolveSimulatedBracketState(ctx, effectiveScenario);

  const actualWinnersByMatchNum: Record<number, string | null> = {};
  for (const match of actualBracket) {
    actualWinnersByMatchNum[match.num] = match.winnerTeamId;
  }

  const simulatedSummary = buildProjectedTeamPathSummary(
    ctx,
    teamId,
    effectiveScenario,
    rankings,
    { suppressPlayedResultsMatchNums },
  );
  if (!simulatedSummary) return null;

  const baselineGroupFinishes = getBaselineGroupFinishes(ctx);
  const activeFinishes =
    effectiveScenario.groupFinishes ?? baselineGroupFinishes;

  const teamRankings = buildTeamRankingsMap(rankings);

  const canPickAllStrongestWinners = hasStrongestWinnerTargets(
    ctx,
    effectiveScenario,
    actualWinnersByMatchNum,
    teamRankings,
    suppressPlayedResultsMatchNums,
    scenario.knockoutWinners,
    "all",
  );

  const canPickSimulatedStrongestWinners = hasStrongestWinnerTargets(
    ctx,
    effectiveScenario,
    actualWinnersByMatchNum,
    teamRankings,
    suppressPlayedResultsMatchNums,
    scenario.knockoutWinners,
    "simulated",
  );

  const comparisonChartMaxStage =
    comparisonTeamId && comparisonActualSummary
      ? (getCompareMaxStageReached(ctx, teamId, comparisonTeamId) ?? null)
      : null;
  const chartMaxStage =
    comparisonTeamId && comparisonChartMaxStage ? comparisonChartMaxStage : null;

  return {
    teamId: teamId.toUpperCase(),
    actualSummary,
    simulatedSummary,
    comparisonActualSummary,
    actualAvgPointsContext: buildAvgPointsContext(
      ctx,
      actualSummary.avgOpponentPoints,
      rankings.values(),
      { excludeTeamId: teamId },
    ),
    simulatedAvgPointsContext: buildAvgPointsContext(
      ctx,
      simulatedSummary.avgOpponentPoints,
      rankings.values(),
      { excludeTeamId: teamId },
    ),
    comparisonAvgPointsContext: comparisonActualSummary
      ? buildAvgPointsContext(
          ctx,
          comparisonActualSummary.avgOpponentPoints,
          rankings.values(),
          { excludeTeamId: comparisonTeamId ?? undefined },
        )
      : null,
    bracket: simulatedBracket,
    changedMatchNums,
    pendingWinnerMatchNums,
    affectedMatchNums,
    actualWinnersByMatchNum,
    canPickAllStrongestWinners,
    canPickSimulatedStrongestWinners,
    pathDiff: computePathDiff(
      actualSummary.matches,
      simulatedSummary.matches,
    ),
    baselineGroupFinishes,
    groupCards: buildGroupFinishCards(ctx, activeFinishes),
    bestThirdRanking: buildBestThirdRanking(ctx, activeFinishes),
    teamRankings,
    focusTeamMatchNums: getFocusTeamMatchNums(simulatedBracket, teamId),
    comparisonChartMaxStage,
    actualPathChart: buildPathChartDataFromSummary(actualSummary, chartMaxStage),
    simulatedPathChart: buildPathChartDataFromSummary(
      simulatedSummary,
      chartMaxStage,
    ),
    comparisonPathChart: comparisonActualSummary
      ? buildPathChartDataFromSummary(comparisonActualSummary, chartMaxStage)
      : null,
  };
}
