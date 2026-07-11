import type { GroupComparisonCard } from "@/lib/types";
import {
  computeCohortOrderingCorrelation,
  type CohortOrderingCorrelation,
} from "@/lib/domain/rank-correlation";
import { buildCompetitionRankMap } from "@/lib/domain/path-ranking";

export interface GroupStrengthOrdering {
  correlation: CohortOrderingCorrelation;
  rankByPoints: Record<string, number>;
  rankByAvgRank: Record<string, number>;
  groupCount: number;
}

export function computeGroupStrengthOrdering(
  groups: GroupComparisonCard[],
): GroupStrengthOrdering {
  const eligible = groups.filter(
    (group) => group.avgFifaPoints !== null && group.avgFifaRank !== null,
  );

  const pointsValues = eligible.map((group) => group.avgFifaPoints as number);
  const rankValues = eligible.map((group) => group.avgFifaRank as number);

  const rankByPoints = Object.fromEntries(
    buildCompetitionRankMap(
      eligible.map((group) => ({
        teamId: group.groupLetter,
        value: group.avgFifaPoints as number,
      })),
      true,
    ),
  );
  const rankByAvgRank = Object.fromEntries(
    buildCompetitionRankMap(
      eligible.map((group) => ({
        teamId: group.groupLetter,
        value: group.avgFifaRank as number,
      })),
      false,
    ),
  );

  return {
    correlation: computeCohortOrderingCorrelation(pointsValues, rankValues),
    rankByPoints,
    rankByAvgRank,
    groupCount: eligible.length,
  };
}

export function getGroupStrengthRank(
  ordering: GroupStrengthOrdering,
  groupLetter: string,
): { byPoints: number | null; byAvgRank: number | null } {
  return {
    byPoints: ordering.rankByPoints[groupLetter] ?? null,
    byAvgRank: ordering.rankByAvgRank[groupLetter] ?? null,
  };
}
