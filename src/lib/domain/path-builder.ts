import type { MatchResult, OpenFootballMatch, Team } from "@/lib/types";
import { resolveTeam } from "@/lib/data/team-registry";
import {
  getAllMatches,
  getMatchWinner,
  isKnockoutRound,
  isMatchPlayed,
} from "@/lib/data/worldcup-loader";
import {
  getAdvancingTeamIds,
  isTeamEliminatedFromGroup,
} from "@/lib/domain/group-standings";

const GROUP_NAMES = [
  "Group A",
  "Group B",
  "Group C",
  "Group D",
  "Group E",
  "Group F",
  "Group G",
  "Group H",
  "Group I",
  "Group J",
  "Group K",
  "Group L",
];

function getOpponent(match: OpenFootballMatch, teamId: string): Team | null {
  const home = resolveTeam(match.team1);
  const away = resolveTeam(match.team2);
  if (!home || !away) return null;
  if (home.id === teamId) return away;
  if (away.id === teamId) return home;
  return null;
}

function getTeamGoals(
  match: OpenFootballMatch,
  teamId: string,
): [number, number] | null {
  if (!match.score?.ft) return null;
  const home = resolveTeam(match.team1);
  const away = resolveTeam(match.team2);
  if (!home || !away) return null;

  const [homeGoals, awayGoals] = match.score.ft;
  if (home.id === teamId) return [homeGoals, awayGoals];
  if (away.id === teamId) return [awayGoals, homeGoals];
  return null;
}

function getMatchResult(
  match: OpenFootballMatch,
  teamId: string,
): MatchResult {
  if (!isMatchPlayed(match)) return null;

  const winner = getMatchWinner(match);
  if (!winner) return "D";

  const winnerTeam = resolveTeam(winner);
  if (!winnerTeam) return null;
  return winnerTeam.id === teamId ? "W" : "L";
}

function formatScore(
  match: OpenFootballMatch,
  teamId: string,
): string | null {
  const goals = getTeamGoals(match, teamId);
  if (!goals) return null;

  const [forGoals, againstGoals] = goals;
  let label = `${forGoals}-${againstGoals}`;

  if (match.score?.p) {
    label += " (pens)";
  } else if (match.score?.et) {
    label += " (aet)";
  }

  return label;
}

export function getTeamMatches(teamId: string): OpenFootballMatch[] {
  return getAllMatches()
    .filter((match) => {
      const home = resolveTeam(match.team1);
      const away = resolveTeam(match.team2);
      return home?.id === teamId || away?.id === teamId;
    })
    .sort((a, b) => a.date.localeCompare(b.date) || (a.num ?? 0) - (b.num ?? 0));
}

export function isTeamEliminated(teamId: string): boolean {
  const matches = getTeamMatches(teamId);
  const groupMatches = getAllMatches().filter((m) => m.group);
  const playedKnockout = matches.filter(
    (m) => isKnockoutRound(m.round) && isMatchPlayed(m),
  );

  for (const match of playedKnockout) {
    const result = getMatchResult(match, teamId);
    if (result === "L") return true;
  }

  return isTeamEliminatedFromGroup(teamId, groupMatches, GROUP_NAMES);
}

export function getNextMatch(teamId: string): OpenFootballMatch | null {
  if (isTeamEliminated(teamId)) return null;

  const matches = getTeamMatches(teamId);
  return matches.find((match) => !isMatchPlayed(match)) ?? null;
}

export function getNextOpponent(teamId: string): Team | null {
  const nextMatch = getNextMatch(teamId);
  if (!nextMatch) return null;
  return getOpponent(nextMatch, teamId);
}

export interface TeamPathMatch {
  match: OpenFootballMatch;
  opponent: Team;
  result: MatchResult;
  scoreLabel: string | null;
  isPlayed: boolean;
  isNext: boolean;
}

export function buildTeamPath(teamId: string): TeamPathMatch[] {
  const matches = getTeamMatches(teamId);
  const nextMatch = getNextMatch(teamId);
  const eliminated = isTeamEliminated(teamId);

  const path: TeamPathMatch[] = [];

  for (const match of matches) {
    const opponent = getOpponent(match, teamId);
    if (!opponent) continue;

    const isPlayed = isMatchPlayed(match);
    const isNext = !eliminated && nextMatch === match;

    path.push({
      match,
      opponent,
      result: getMatchResult(match, teamId),
      scoreLabel: formatScore(match, teamId),
      isPlayed,
      isNext,
    });

    if (isPlayed && getMatchResult(match, teamId) === "L" && isKnockoutRound(match.round)) {
      break;
    }
  }

  const groupMatches = getAllMatches().filter((m) => m.group);
  if (isTeamEliminatedFromGroup(teamId, groupMatches, GROUP_NAMES)) {
    const lastGroupIndex = path.findLastIndex(
      (entry) => entry.match.group && entry.isPlayed,
    );
    if (lastGroupIndex >= 0) {
      return path.slice(0, lastGroupIndex + 1);
    }
  }

  return path;
}

export function getGroupNames(): string[] {
  return GROUP_NAMES;
}

export function getAdvancingTeams(): Set<string> {
  const groupMatches = getAllMatches().filter((m) => m.group);
  return getAdvancingTeamIds(groupMatches, GROUP_NAMES);
}
