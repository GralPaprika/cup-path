import type {
  MatchDifficulty,
  OpponentPointsObservation,
  PathStage,
  TeamPathSummary,
} from "@/lib/types";
import { getMatchStage, isStageWithinReach, PATH_STAGES, stageIndex } from "@/lib/domain/match/match-stages";

export type { OpponentPointsObservation } from "@/lib/types";

export function buildOpponentPointsObservations(
  matches: MatchDifficulty[],
): OpponentPointsObservation[] {
  return matches.flatMap((match) =>
    match.opponentPoints === null
      ? []
      : [
          {
            teamId: match.opponent.id,
            displayName: match.opponent.displayName,
            flagUrl: match.opponent.flagUrl,
            points: match.opponentPoints,
          },
        ],
  );
}

export function filterMatchesThroughStage(
  matches: MatchDifficulty[],
  maxStage: PathStage,
): MatchDifficulty[] {
  return matches.filter((match) => {
    const stage = getMatchStage(match.round);
    return stage !== null && isStageWithinReach(stage, maxStage);
  });
}

export function computeAvgOpponentPointsFromMatches(
  matches: MatchDifficulty[],
): number | null {
  const points = matches
    .map((match) => match.opponentPoints)
    .filter((value): value is number => value !== null);
  if (points.length === 0) return null;
  return points.reduce((sum, value) => sum + value, 0) / points.length;
}

export function getMaxStageFromMatches(
  matches: MatchDifficulty[],
): PathStage | null {
  let highest = -1;

  for (const match of matches) {
    const stage = getMatchStage(match.round);
    if (!stage) continue;
    highest = Math.max(highest, stageIndex(stage));
  }

  return highest >= 0 ? PATH_STAGES[highest] : null;
}

export function getSharedMaxStage(
  ...stages: Array<PathStage | null | undefined>
): PathStage | null {
  const valid = stages.filter((stage): stage is PathStage => stage != null);
  if (valid.length === 0) return null;

  const minIdx = Math.min(...valid.map((stage) => stageIndex(stage)));
  return PATH_STAGES[minIdx];
}

export function buildPathChartDataFromSummary(
  summary: TeamPathSummary,
  maxStage?: PathStage | null,
) {
  const matches =
    maxStage === null || maxStage === undefined
      ? summary.matches
      : filterMatchesThroughStage(summary.matches, maxStage);

  return {
    opponents: buildOpponentPointsObservations(matches),
    avgOpponentPoints: computeAvgOpponentPointsFromMatches(matches),
  };
}
