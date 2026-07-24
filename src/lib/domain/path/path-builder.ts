import type { MatchResult, OpenFootballMatch, Team } from "@/lib/types";
import type { TournamentContext } from "@/lib/domain/tournament/tournament-context";
import {
  getMatchWinner,
  isKnockoutRound,
  isMatchPlayed,
} from "@/lib/data/worldcup-loader";
import {
  getAdvancingTeamIds,
  isTeamEliminatedFromGroup,
} from "@/lib/domain/group/group-standings";
import { isThirdPlaceMatch } from "@/lib/domain/match/match-stages";

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

function getOpponent(
  ctx: TournamentContext,
  match: OpenFootballMatch,
  teamId: string,
): Team | null {
  const home = ctx.resolveTeam(match.team1);
  const away = ctx.resolveTeam(match.team2);
  if (!home || !away) return null;
  if (home.id === teamId) return away;
  if (away.id === teamId) return home;
  return null;
}

function getTeamGoals(
  ctx: TournamentContext,
  match: OpenFootballMatch,
  teamId: string,
  pair: [number, number],
): [number, number] | null {
  const home = ctx.resolveTeam(match.team1);
  const away = ctx.resolveTeam(match.team2);
  if (!home || !away) return null;

  const [homeGoals, awayGoals] = pair;
  if (home.id === teamId) return [homeGoals, awayGoals];
  if (away.id === teamId) return [awayGoals, homeGoals];
  return null;
}

function getMatchResult(
  ctx: TournamentContext,
  match: OpenFootballMatch,
  teamId: string,
): MatchResult {
  if (!isMatchPlayed(match)) return null;

  const winner = getMatchWinner(match);
  if (!winner) return "D";

  const winnerTeam = ctx.resolveTeam(winner);
  if (!winnerTeam) return null;
  return winnerTeam.id === teamId ? "W" : "L";
}

interface FormattedPathScore {
  scoreLabel: string;
  scorePensLabel: string | null;
}

function formatScore(
  ctx: TournamentContext,
  match: OpenFootballMatch,
  teamId: string,
): FormattedPathScore | null {
  if (!match.score?.ft) return null;

  const hasPens = Boolean(match.score.p);
  const pair =
    !hasPens && match.score.et ? match.score.et : match.score.ft;
  const goals = getTeamGoals(ctx, match, teamId, pair);
  if (!goals) return null;

  const [forGoals, againstGoals] = goals;
  let scoreLabel = `${forGoals}-${againstGoals}`;
  let scorePensLabel: string | null = null;

  if (hasPens && match.score.p) {
    const [homePens, awayPens] = match.score.p;
    scorePensLabel = `(${homePens}-${awayPens} pens)`;
  } else if (match.score.et) {
    scoreLabel += " (aet)";
  }

  return { scoreLabel, scorePensLabel };
}

export function getTeamMatches(
  ctx: TournamentContext,
  teamId: string,
): OpenFootballMatch[] {
  return ctx.matches
    .filter((match) => {
      const home = ctx.resolveTeam(match.team1);
      const away = ctx.resolveTeam(match.team2);
      return home?.id === teamId || away?.id === teamId;
    })
    .sort((a, b) => a.date.localeCompare(b.date) || (a.num ?? 0) - (b.num ?? 0));
}

export function isTeamEliminated(
  ctx: TournamentContext,
  teamId: string,
): boolean {
  const matches = getTeamMatches(ctx, teamId);
  const groupMatches = ctx.matches.filter((m) => m.group);
  const playedKnockout = matches.filter(
    (m) => isKnockoutRound(m.round) && isMatchPlayed(m),
  );

  for (const match of playedKnockout) {
    const result = getMatchResult(ctx, match, teamId);
    if (result === "L") return true;
  }

  return isTeamEliminatedFromGroup(ctx, teamId, groupMatches, GROUP_NAMES);
}

export function getNextMatch(
  ctx: TournamentContext,
  teamId: string,
): OpenFootballMatch | null {
  if (isTeamEliminated(ctx, teamId)) return null;

  const matches = getTeamMatches(ctx, teamId);
  return matches.find((match) => !isMatchPlayed(match)) ?? null;
}

export function getNextOpponent(
  ctx: TournamentContext,
  teamId: string,
): Team | null {
  const nextMatch = getNextMatch(ctx, teamId);
  if (!nextMatch) return null;
  return getOpponent(ctx, nextMatch, teamId);
}

export interface TeamPathMatch {
  match: OpenFootballMatch;
  opponent: Team;
  result: MatchResult;
  scoreLabel: string | null;
  scorePensLabel: string | null;
  isPlayed: boolean;
  isNext: boolean;
}

export function buildTeamPath(
  ctx: TournamentContext,
  teamId: string,
): TeamPathMatch[] {
  const matches = getTeamMatches(ctx, teamId);
  const nextMatch = getNextMatch(ctx, teamId);
  const eliminated = isTeamEliminated(ctx, teamId);

  const path: TeamPathMatch[] = [];

  for (const match of matches) {
    const opponent = getOpponent(ctx, match, teamId);
    if (!opponent) continue;

    const isPlayed = isMatchPlayed(match);
    const isNext = !eliminated && nextMatch === match;

    const formatted = formatScore(ctx, match, teamId);
    path.push({
      match,
      opponent,
      result: getMatchResult(ctx, match, teamId),
      scoreLabel: formatted?.scoreLabel ?? null,
      scorePensLabel: formatted?.scorePensLabel ?? null,
      isPlayed,
      isNext,
    });

    if (
      isPlayed &&
      getMatchResult(ctx, match, teamId) === "L" &&
      isKnockoutRound(match.round) &&
      !isThirdPlaceMatch(match.round)
    ) {
      // SF losers may still play the third-place match — keep going when later
      // fixtures remain on this team's schedule.
      const matchIndex = matches.indexOf(match);
      if (matchIndex < 0 || matchIndex === matches.length - 1) break;
      continue;
    }
  }

  const groupMatches = ctx.matches.filter((m) => m.group);
  if (isTeamEliminatedFromGroup(ctx, teamId, groupMatches, GROUP_NAMES)) {
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

export function getAdvancingTeams(ctx: TournamentContext): Set<string> {
  const groupMatches = ctx.matches.filter((m) => m.group);
  return getAdvancingTeamIds(ctx, groupMatches, GROUP_NAMES);
}
