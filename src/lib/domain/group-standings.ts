import type { GroupStanding, OpenFootballMatch } from "@/lib/types";
import { resolveTeam } from "@/lib/data/team-registry";
import { getMatchWinner, isMatchPlayed } from "@/lib/data/worldcup-loader";

function initStanding(teamId: string): GroupStanding {
  return {
    teamId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    points: 0,
    position: 0,
  };
}

function compareStandings(a: GroupStanding, b: GroupStanding): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.gd !== a.gd) return b.gd - a.gd;
  if (b.gf !== a.gf) return b.gf - a.gf;
  return a.teamId.localeCompare(b.teamId);
}

export function computeGroupStandings(
  matches: OpenFootballMatch[],
): GroupStanding[] {
  const standings = new Map<string, GroupStanding>();

  for (const match of matches) {
    const home = resolveTeam(match.team1);
    const away = resolveTeam(match.team2);
    if (!home || !away) continue;

    if (!standings.has(home.id)) standings.set(home.id, initStanding(home.id));
    if (!standings.has(away.id)) standings.set(away.id, initStanding(away.id));

    if (!isMatchPlayed(match) || !match.score?.ft) continue;

    const [homeGoals, awayGoals] = match.score.ft;
    const homeStanding = standings.get(home.id)!;
    const awayStanding = standings.get(away.id)!;

    homeStanding.played += 1;
    awayStanding.played += 1;
    homeStanding.gf += homeGoals;
    homeStanding.ga += awayGoals;
    awayStanding.gf += awayGoals;
    awayStanding.ga += homeGoals;

    if (homeGoals > awayGoals) {
      homeStanding.won += 1;
      awayStanding.lost += 1;
      homeStanding.points += 3;
    } else if (homeGoals < awayGoals) {
      awayStanding.won += 1;
      homeStanding.lost += 1;
      awayStanding.points += 3;
    } else {
      homeStanding.drawn += 1;
      awayStanding.drawn += 1;
      homeStanding.points += 1;
      awayStanding.points += 1;
    }
  }

  const sorted = [...standings.values()]
    .map((standing) => ({
      ...standing,
      gd: standing.gf - standing.ga,
    }))
    .sort(compareStandings)
    .map((standing, index) => ({ ...standing, position: index + 1 }));

  return sorted;
}

function compareThirdPlace(a: GroupStanding, b: GroupStanding): number {
  return compareStandings(a, b);
}

export function getAdvancingTeamIds(
  allGroupMatches: OpenFootballMatch[],
  groupNames: string[],
): Set<string> {
  const advancing = new Set<string>();
  const thirdPlaceTeams: GroupStanding[] = [];

  for (const groupName of groupNames) {
    const groupMatches = allGroupMatches.filter((m) => m.group === groupName);
    const standings = computeGroupStandings(groupMatches);
    const groupComplete = standings.every((s) => s.played === 3);

    if (!groupComplete) {
      for (const standing of standings.slice(0, 2)) {
        advancing.add(standing.teamId);
      }
      continue;
    }

    for (const standing of standings.slice(0, 2)) {
      advancing.add(standing.teamId);
    }

    if (standings[2]) {
      thirdPlaceTeams.push(standings[2]);
    }
  }

  const allGroupsComplete = groupNames.every((groupName) => {
    const groupMatches = allGroupMatches.filter((m) => m.group === groupName);
    const standings = computeGroupStandings(groupMatches);
    return standings.every((s) => s.played === 3);
  });

  if (allGroupsComplete) {
    const bestThird = [...thirdPlaceTeams]
      .sort(compareThirdPlace)
      .slice(0, 8);
    for (const standing of bestThird) {
      advancing.add(standing.teamId);
    }
  }

  return advancing;
}

export function isTeamEliminatedFromGroup(
  teamId: string,
  allGroupMatches: OpenFootballMatch[],
  groupNames: string[],
): boolean {
  const groupName = allGroupMatches.find((match) => {
    const home = resolveTeam(match.team1);
    const away = resolveTeam(match.team2);
    return home?.id === teamId || away?.id === teamId;
  })?.group;

  if (!groupName) return false;

  const groupMatches = allGroupMatches.filter((m) => m.group === groupName);
  const standings = computeGroupStandings(groupMatches);
  const teamStanding = standings.find((s) => s.teamId === teamId);
  if (!teamStanding) return false;

  const groupComplete = standings.every((s) => s.played === 3);
  if (!groupComplete) return false;

  const advancing = getAdvancingTeamIds(allGroupMatches, groupNames);
  return !advancing.has(teamId);
}
