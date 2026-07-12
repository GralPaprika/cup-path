import type { BestThirdRankingEntry, GroupFinishCard, GroupStanding } from "@/lib/types";
import type { TournamentContext } from "@/lib/domain/tournament-context";
import { computeGroupStandings } from "@/lib/domain/group-standings";
import { getGroupNames } from "@/lib/domain/path-builder";

import type { GroupFinishMap } from "@/lib/domain/group-finish-swap";
import { normalizeGroupFinish } from "@/lib/domain/group-finish-swap";

export type { GroupFinishCard };

function compareStandings(a: GroupStanding, b: GroupStanding): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.gd !== a.gd) return b.gd - a.gd;
  if (b.gf !== a.gf) return b.gf - a.gf;
  return a.teamId.localeCompare(b.teamId);
}

export function getBaselineGroupFinishes(ctx: TournamentContext): GroupFinishMap {
  const groupMatches = ctx.matches.filter((match) => match.group);
  const finishes: GroupFinishMap = {};

  for (const groupName of getGroupNames()) {
    const letter = groupName.replace("Group ", "");
    const standings = computeGroupStandings(
      ctx,
      groupMatches.filter((match) => match.group === groupName),
    );
    finishes[letter] = [
      standings[0]?.teamId ?? "",
      standings[1]?.teamId ?? "",
      standings[2]?.teamId ?? "",
      standings[3]?.teamId ?? "",
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
  ctx: TournamentContext,
  finishes: GroupFinishMap,
): Map<string, GroupStanding[]> {
  const groupMatches = ctx.matches.filter((match) => match.group);
  const base = new Map<string, GroupStanding[]>();

  for (const groupName of getGroupNames()) {
    const letter = groupName.replace("Group ", "");
    base.set(
      letter,
      computeGroupStandings(
        ctx,
        groupMatches.filter((match) => match.group === groupName),
      ),
    );
  }

  const result = new Map<string, GroupStanding[]>();

  for (const [letter, ids] of Object.entries(finishes)) {
    const rows: GroupStanding[] = [];
    for (let index = 0; index < 4; index++) {
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
  ctx: TournamentContext,
  finishes: GroupFinishMap,
): Set<string> {
  const standingsByGroup = buildStandingsByGroupFromFinishes(ctx, finishes);
  const thirdPlaceTeams: GroupStanding[] = [];

  for (const [, standings] of standingsByGroup) {
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

export function buildBestThirdRanking(
  ctx: TournamentContext,
  finishes: GroupFinishMap,
): BestThirdRankingEntry[] {
  const standingsByGroup = buildStandingsByGroupFromFinishes(ctx, finishes);
  const thirdPlaceTeams: Array<{ groupLetter: string; standing: GroupStanding }> =
    [];

  for (const [groupLetter, standings] of standingsByGroup) {
    const third = standings.find((entry) => entry.position === 3);
    if (third) {
      thirdPlaceTeams.push({ groupLetter, standing: third });
    }
  }

  const sorted = [...thirdPlaceTeams].sort((a, b) =>
    compareStandings(a.standing, b.standing),
  );

  return sorted.map((entry, index) => ({
    rank: index + 1,
    groupLetter: entry.groupLetter,
    teamId: entry.standing.teamId,
    points: entry.standing.points,
    gd: entry.standing.gd,
    gf: entry.standing.gf,
    ga: entry.standing.ga,
    played: entry.standing.played,
    qualifies: index < 8,
  }));
}

export function buildGroupFinishCards(
  ctx: TournamentContext,
  finishes: GroupFinishMap,
): GroupFinishCard[] {
  const qualifyingThirds = getQualifyingThirdGroups(ctx, finishes);

  return Object.entries(finishes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([groupLetter, ids]) => ({
      groupLetter,
      positions: ids.map((teamId, index) => ({
        position: (index + 1) as 1 | 2 | 3 | 4,
        teamId,
      })),
      thirdQualifies: qualifyingThirds.has(groupLetter),
    }));
}

export function normalizeGroupFinishes(
  ctx: TournamentContext,
  finishes: Record<string, [string, string, string] | [string, string, string, string]>,
): GroupFinishMap {
  const baseline = getBaselineGroupFinishes(ctx);
  const normalized: GroupFinishMap = { ...baseline };

  for (const [letter, ids] of Object.entries(finishes)) {
    normalized[letter] = normalizeGroupFinish(ids, baseline[letter]?.[3] ?? "");
  }

  return normalized;
}

export type { GroupFinishMap } from "@/lib/domain/group-finish-swap";
export { swapGroupPositions } from "@/lib/domain/group-finish-swap";
