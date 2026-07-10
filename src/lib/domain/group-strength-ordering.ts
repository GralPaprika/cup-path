import type { GroupComparisonCard } from "@/lib/types";
import {
  computeCohortOrderingCorrelation,
  type CohortOrderingCorrelation,
} from "@/lib/domain/rank-correlation";

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

  const rankedByPoints = [...eligible].sort(
    (a, b) => (b.avgFifaPoints as number) - (a.avgFifaPoints as number),
  );
  const rankedByRank = [...eligible].sort(
    (a, b) => (a.avgFifaRank as number) - (b.avgFifaRank as number),
  );

  const rankByPoints: Record<string, number> = {};
  const rankByAvgRank: Record<string, number> = {};

  rankedByPoints.forEach((group, index) => {
    rankByPoints[group.groupLetter] = index + 1;
  });
  rankedByRank.forEach((group, index) => {
    rankByAvgRank[group.groupLetter] = index + 1;
  });

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
