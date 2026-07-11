import type { GroupFinishCard, GroupStanding } from "@/lib/types";
import { getAllMatches } from "@/lib/data/worldcup-loader";
import { computeGroupStandings } from "@/lib/domain/group-standings";
import { getGroupNames } from "@/lib/domain/path-builder";

import type { GroupFinishMap } from "@/lib/domain/group-finish-swap";

export type { GroupFinishCard };

function compareStandings(a: GroupStanding, b: GroupStanding): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.gd !== a.gd) return b.gd - a.gd;
  if (b.gf !== a.gf) return b.gf - a.gf;
  return a.teamId.localeCompare(b.teamId);
}

export function getBaselineGroupFinishes(): GroupFinishMap {
  const groupMatches = getAllMatches().filter((match) => match.group);
  const finishes: GroupFinishMap = {};

  for (const groupName of getGroupNames()) {
    const letter = groupName.replace("Group ", "");
    const standings = computeGroupStandings(
      groupMatches.filter((match) => match.group === groupName),
    );
    finishes[letter] = [
      standings[0]?.teamId ?? "",
      standings[1]?.teamId ?? "",
      standings[2]?.teamId ?? "",
    ];
  }

  return finishes;
}

function lookupStanding(
  teamId: string,
  standingsByGroup: Map<string, GroupStanding[]>,
): GroupStanding | null {
  for (const standings of standingsByGroup.values()) {
    const found = standings.find((entry) => entry.teamId === teamId);
    if (found) return found;
  }
  return null;
}

export function buildStandingsByGroupFromFinishes(
  finishes: GroupFinishMap,
): Map<string, GroupStanding[]> {
  const groupMatches = getAllMatches().filter((match) => match.group);
  const base = new Map<string, GroupStanding[]>();

  for (const groupName of getGroupNames()) {
    const letter = groupName.replace("Group ", "");
    base.set(
      letter,
      computeGroupStandings(
        groupMatches.filter((match) => match.group === groupName),
      ),
    );
  }

  const result = new Map<string, GroupStanding[]>();

  for (const [letter, ids] of Object.entries(finishes)) {
    const rows: GroupStanding[] = [];
    for (let index = 0; index < 3; index++) {
      const teamId = ids[index];
      if (!teamId) continue;
      const stats = lookupStanding(teamId, base);
      if (stats) {
        rows.push({ ...stats, position: index + 1 });
      }
    }
    result.set(letter, rows);
  }

  return result;
}

export function getQualifyingThirdGroups(
  finishes: GroupFinishMap,
): Set<string> {
  const standingsByGroup = buildStandingsByGroupFromFinishes(finishes);
  const thirdPlaceTeams: GroupStanding[] = [];

  for (const [letter, standings] of standingsByGroup) {
    const third = standings.find((entry) => entry.position === 3);
    if (third) {
      thirdPlaceTeams.push({ ...third, teamId: third.teamId });
    }
  }

  const bestThird = [...thirdPlaceTeams]
    .sort(compareStandings)
    .slice(0, 8);

  return new Set(
    bestThird
      .map((standing) => {
        for (const [letter, rows] of standingsByGroup) {
          if (rows.some((entry) => entry.teamId === standing.teamId)) {
            return letter;
          }
        }
        return null;
      })
      .filter((letter): letter is string => Boolean(letter)),
  );
}

export function buildGroupFinishCards(
  finishes: GroupFinishMap,
): GroupFinishCard[] {
  const qualifyingThirds = getQualifyingThirdGroups(finishes);

  return Object.entries(finishes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([groupLetter, ids]) => ({
      groupLetter,
      positions: ids.map((teamId, index) => ({
        position: (index + 1) as 1 | 2 | 3,
        teamId,
      })),
      thirdQualifies: qualifyingThirds.has(groupLetter),
    }));
}

export type { GroupFinishMap } from "@/lib/domain/group-finish-swap";
export { swapGroupPositions } from "@/lib/domain/group-finish-swap";
