import type { MatchDifficulty, PathStage, TeamPathSummary } from "@/lib/types";
import { getMatchStage, isStageWithinReach } from "@/lib/domain/match-stages";

export interface OpponentPointsObservation {
  teamId: string;
  displayName: string;
  flagUrl: string;
  points: number;
}

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
