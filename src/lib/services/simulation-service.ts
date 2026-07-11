import type { RankingMode, SimulationResult, SimulationScenario } from "@/lib/types";
import { buildRankingsMap, getRankingsSnapshot } from "@/lib/data/rankings-store";
import { ensureWorldCupData } from "@/lib/data/worldcup-store";
import {
  findChangedMatchNums,
  getActualScenario,
  getFocusTeamMatchNums,
  resolveBracket,
} from "@/lib/domain/bracket-resolver";
import { buildAvgPointsContext } from "@/lib/domain/points-anchor";
import { buildProjectedTeamPathSummary } from "@/lib/domain/projected-path-builder";
import { buildTeamPathSummary } from "@/lib/domain/difficulty";
import { computePathDiff } from "@/lib/domain/path-diff";
import {
  buildGroupFinishCards,
  getBaselineGroupFinishes,
} from "@/lib/domain/group-finishes";

function mergeGroupFinishes(
  scenario: SimulationScenario,
): SimulationScenario {
  const baseline = getBaselineGroupFinishes();
  if (!scenario.groupFinishes || Object.keys(scenario.groupFinishes).length === 0) {
    return scenario;
  }
  return {
    ...scenario,
    groupFinishes: { ...baseline, ...scenario.groupFinishes },
  };
}

export async function getSimulationAnalysis(
  teamId: string,
  mode: RankingMode,
  scenario: SimulationScenario,
): Promise<SimulationResult | null> {
  await ensureWorldCupData();
  const snapshot = await getRankingsSnapshot(mode);
  const rankings = buildRankingsMap(snapshot);

  const actualSummary = buildTeamPathSummary(teamId, rankings);
  if (!actualSummary) return null;

  const effectiveScenario = mergeGroupFinishes(scenario);
  const simulatedSummary = buildProjectedTeamPathSummary(
    teamId,
    effectiveScenario,
    rankings,
  );
  if (!simulatedSummary) return null;

  const actualBracket = resolveBracket(getActualScenario());
  const simulatedBracket = resolveBracket(effectiveScenario);

  const baselineGroupFinishes = getBaselineGroupFinishes();
  const activeFinishes =
    effectiveScenario.groupFinishes ?? baselineGroupFinishes;

  return {
    teamId: teamId.toUpperCase(),
    actualSummary,
    simulatedSummary,
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
    bracket: simulatedBracket,
    changedMatchNums: findChangedMatchNums(actualBracket, simulatedBracket),
    pathDiff: computePathDiff(
      actualSummary.matches,
      simulatedSummary.matches,
    ),
    baselineGroupFinishes,
    groupCards: buildGroupFinishCards(activeFinishes),
    focusTeamMatchNums: getFocusTeamMatchNums(simulatedBracket, teamId),
  };
}
