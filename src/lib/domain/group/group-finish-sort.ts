import type { GroupFinishMap, GroupFinishTuple } from "@/lib/domain/group/group-finish-swap";

export type TeamRankingLookup = Record<
  string,
  { rank: number; points: number }
>;

export function sortGroupFinishesByFifaPoints(
  finishes: GroupFinishMap,
  rankings: TeamRankingLookup,
): GroupFinishMap {
  const result: GroupFinishMap = {};

  for (const [letter, ids] of Object.entries(finishes)) {
    const sorted = [...ids].sort((teamA, teamB) => {
      const pointsA = rankings[teamA]?.points ?? -1;
      const pointsB = rankings[teamB]?.points ?? -1;
      if (pointsB !== pointsA) return pointsB - pointsA;
      return teamA.localeCompare(teamB);
    });

    result[letter] = sorted as GroupFinishTuple;
  }

  return result;
}
