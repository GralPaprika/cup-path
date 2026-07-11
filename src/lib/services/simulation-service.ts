import type { RankingMode, SimulationResult, SimulationScenario } from "@/lib/types";
import { buildRankingsMap, getRankingsSnapshot } from "@/lib/data/rankings-store";
import { ensureWorldCupData } from "@/lib/data/worldcup-store";
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
import {
  buildAllTeamSummaries,
  buildTeamPathSummary,
  getPathDifficultyRank,
} from "@/lib/domain/difficulty";
import { computePathDiff } from "@/lib/domain/path-diff";
import { getFurthestStage, PATH_STAGES } from "@/lib/domain/match-stages";
import { getTeamsAtStage } from "@/lib/domain/team-stages";
import {
  buildBestThirdRanking,
  buildGroupFinishCards,
  getBaselineGroupFinishes,
  normalizeGroupFinishes,
} from "@/lib/domain/group-finishes";
import {
  hasStrongestWinnerTargets,
} from "@/lib/domain/strongest-path-winners";

function mergeGroupFinishes(
  scenario: SimulationScenario,
): SimulationScenario {
  const baseline = getBaselineGroupFinishes();
  if (!scenario.groupFinishes || Object.keys(scenario.groupFinishes).length === 0) {
    return scenario;
  }
  return {
    ...scenario,
    groupFinishes: normalizeGroupFinishes({
      ...baseline,
      ...scenario.groupFinishes,
    }),
  };
}

function resolveSimulatedBracketState(scenario: SimulationScenario) {
  const actualBracket = resolveBracket(getActualScenario());
  const preliminaryBracket = resolveBracket(scenario);
  const changedMatchNums = findChangedMatchNums(actualBracket, preliminaryBracket);
  const suppressPlayedResultsMatchNums =
    getDownstreamMatchNums(changedMatchNums);
  const simulatedBracket = resolveBracket(scenario, {
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

export async function getSimulationStrongestWinnersContext(
  scenario: SimulationScenario,
  mode: RankingMode,
) {
  await ensureWorldCupData();
  const snapshot = await getRankingsSnapshot(mode);
  const rankings = buildRankingsMap(snapshot);
  const effectiveScenario = mergeGroupFinishes(scenario);
  const { actualBracket, suppressPlayedResultsMatchNums } =
    resolveSimulatedBracketState(effectiveScenario);

  const actualWinnersByMatchNum: Record<number, string | null> = {};
  for (const match of actualBracket) {
    actualWinnersByMatchNum[match.num] = match.winnerTeamId;
  }

  const teamRankings: Record<string, { rank: number; points: number }> = {};
  for (const entry of rankings.values()) {
    teamRankings[entry.teamId] = {
      rank: entry.rank,
      points: entry.points,
    };
  }

  return {
    effectiveScenario,
    actualWinnersByMatchNum,
    teamRankings,
    suppressPlayedResultsMatchNums,
  };
}

export async function getSimulationAnalysis(
  teamId: string,
  mode: RankingMode,
  scenario: SimulationScenario,
  comparisonTeamId?: string | null,
): Promise<SimulationResult | null> {
  await ensureWorldCupData();
  const snapshot = await getRankingsSnapshot(mode);
  const rankings = buildRankingsMap(snapshot);

  const actualSummary = buildTeamPathSummary(teamId, rankings);
  if (!actualSummary) return null;
  const comparisonActualSummary = comparisonTeamId
    ? buildTeamPathSummary(comparisonTeamId, rankings)
    : null;

  const effectiveScenario = mergeGroupFinishes(scenario);
  const {
    actualBracket,
    simulatedBracket,
    changedMatchNums,
    pendingWinnerMatchNums,
    suppressPlayedResultsMatchNums,
    affectedMatchNums,
  } = resolveSimulatedBracketState(effectiveScenario);

  const actualWinnersByMatchNum: Record<number, string | null> = {};
  for (const match of actualBracket) {
    actualWinnersByMatchNum[match.num] = match.winnerTeamId;
  }

  const simulatedSummary = buildProjectedTeamPathSummary(
    teamId,
    effectiveScenario,
    rankings,
    { suppressPlayedResultsMatchNums },
  );
  if (!simulatedSummary) return null;

  const baselineGroupFinishes = getBaselineGroupFinishes();
  const activeFinishes =
    effectiveScenario.groupFinishes ?? baselineGroupFinishes;

  const teamRankings: Record<string, { rank: number; points: number }> = {};
  for (const entry of rankings.values()) {
    teamRankings[entry.teamId] = {
      rank: entry.rank,
      points: entry.points,
    };
  }

  const canPickAllStrongestWinners = hasStrongestWinnerTargets(
    effectiveScenario,
    actualWinnersByMatchNum,
    teamRankings,
    suppressPlayedResultsMatchNums,
    scenario.knockoutWinners,
    "all",
  );

  const canPickSimulatedStrongestWinners = hasStrongestWinnerTargets(
    effectiveScenario,
    actualWinnersByMatchNum,
    teamRankings,
    suppressPlayedResultsMatchNums,
    scenario.knockoutWinners,
    "simulated",
  );

  const allSummaries = buildAllTeamSummaries(rankings);
  const pathRankStages = new Set(PATH_STAGES);
  const pathRankCohortStage = getFurthestStage(pathRankStages);
  const cohortTeamIds = getTeamsAtStage(pathRankCohortStage);
  const pathRanks = {
    actual: getPathDifficultyRank(
      allSummaries,
      teamId,
      actualSummary,
      pathRankStages,
      cohortTeamIds,
    ),
    simulated: getPathDifficultyRank(
      allSummaries,
      teamId,
      simulatedSummary,
      pathRankStages,
      cohortTeamIds,
    ),
    comparison: comparisonActualSummary
      ? getPathDifficultyRank(
          allSummaries,
          comparisonActualSummary.team.id,
          comparisonActualSummary,
          pathRankStages,
          cohortTeamIds,
        )
      : null,
  };

  return {
    teamId: teamId.toUpperCase(),
    actualSummary,
    simulatedSummary,
    comparisonActualSummary,
    actualAvgPointsContext: buildAvgPointsContext(
      actualSummary.avgOpponentPoints,
      rankings.values(),
      { excludeTeamId: teamId },
    ),
    simulatedAvgPointsContext: buildAvgPointsContext(
      simulatedSummary.avgOpponentPoints,
      rankings.values(),
      { excludeTeamId: teamId },
    ),
    comparisonAvgPointsContext: comparisonActualSummary
      ? buildAvgPointsContext(
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
    pathRanks,
    pathRankCohortStage,
    pathDiff: computePathDiff(
      actualSummary.matches,
      simulatedSummary.matches,
    ),
    baselineGroupFinishes,
    groupCards: buildGroupFinishCards(activeFinishes),
    bestThirdRanking: buildBestThirdRanking(activeFinishes),
    teamRankings,
    focusTeamMatchNums: getFocusTeamMatchNums(simulatedBracket, teamId),
  };
}
