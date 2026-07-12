import type { MatchDifficulty, PathStage } from "@/lib/types";
import { getMatchStage } from "@/lib/domain/match/match-stages";
import {
  computeNumericStats,
  type NumericStats,
} from "@/lib/domain/group/group-stats";
import { computeFilteredAverages } from "@/lib/domain/core/difficulty";
import {
  buildOpponentPointsObservations,
  type OpponentPointsObservation,
} from "@/lib/domain/path/path-opponent-observations";

export type { OpponentPointsObservation } from "@/lib/domain/path/path-opponent-observations";

export interface PathOpponentStats {
  opponentPointsStats: NumericStats;
  opponentRankStats: NumericStats;
  opponentPointsObservations: OpponentPointsObservation[];
}

function filterMatchesByStages(
  matches: MatchDifficulty[],
  stages: Set<PathStage>,
): MatchDifficulty[] {
  return matches.filter((match) => {
    const stage = getMatchStage(match.round);
    return stage !== null && stages.has(stage);
  });
}

export function computePathOpponentStats(
  matches: MatchDifficulty[],
  stages: Set<PathStage>,
): PathOpponentStats {
  const filtered = filterMatchesByStages(matches, stages);

  const opponentPoints = filtered
    .map((match) => match.opponentPoints)
    .filter((value): value is number => value !== null);

  const opponentRanks = filtered
    .map((match) => match.opponentRank)
    .filter((value): value is number => value !== null);
  const opponentPointsObservations = buildOpponentPointsObservations(filtered);

  return {
    opponentPointsStats: computeNumericStats(opponentPoints),
    opponentRankStats: computeNumericStats(opponentRanks),
    opponentPointsObservations,
  };
}

export function collectCohortDifficultyValues(
  summaries: Array<{ matches: MatchDifficulty[] }>,
  stages: Set<PathStage>,
): { pointsValues: number[]; rankValues: number[] } {
  const pointsValues: number[] = [];
  const rankValues: number[] = [];

  for (const summary of summaries) {
    const { avgOpponentPoints, avgOpponentRank } = computeFilteredAverages(
      summary.matches,
      stages,
    );

    if (avgOpponentPoints !== null && avgOpponentRank !== null) {
      pointsValues.push(avgOpponentPoints);
      rankValues.push(avgOpponentRank);
    }
  }

  return { pointsValues, rankValues };
}
