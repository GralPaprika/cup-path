import type {
  MatchDifficulty,
  MatchResult,
  RankingEntry,
  SimulationScenario,
  Team,
  TeamPathSummary,
} from "@/lib/types";
import { enrichTeam, getTeamById } from "@/lib/data/team-registry";
import { isKnockoutRound } from "@/lib/data/worldcup-loader";
import { resolveBracket, type ResolveBracketOptions } from "@/lib/domain/bracket-resolver";
import { getMatchStage } from "@/lib/domain/match-stages";
import { buildTeamPath } from "@/lib/domain/path-builder";

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function withFlag(team: Team, entry?: RankingEntry): Team {
  return enrichTeam(team, entry?.flagUrl);
}

function toMatchDifficulty(
  teamId: string,
  round: string,
  date: string,
  opponent: Team,
  rankings: Map<string, RankingEntry>,
  result: MatchResult,
  scoreLabel: string | null,
  isPlayed: boolean,
  isNext: boolean,
): MatchDifficulty {
  const teamRanking = rankings.get(teamId);
  const opponentRanking = rankings.get(opponent.id);
  const teamRank = teamRanking?.rank ?? null;
  const teamPoints = teamRanking?.points ?? null;
  const opponentRank = opponentRanking?.rank ?? null;
  const opponentPoints = opponentRanking?.points ?? null;

  return {
    round,
    date,
    opponent: withFlag(opponent, opponentRanking),
    opponentRank,
    opponentPoints,
    teamRank,
    teamPoints,
    rankGap:
      opponentRank !== null && teamRank !== null
        ? opponentRank - teamRank
        : null,
    pointsGap:
      opponentPoints !== null && teamPoints !== null
        ? opponentPoints - teamPoints
        : null,
    result,
    scoreLabel,
    isNext,
    isPlayed,
  };
}

export function buildProjectedTeamPathSummary(
  teamId: string,
  scenario: SimulationScenario,
  rankings: Map<string, RankingEntry>,
  options: ResolveBracketOptions = {},
): TeamPathSummary | null {
  const baseTeam = getTeamById(teamId);
  if (!baseTeam) return null;

  const teamRanking = rankings.get(teamId);
  const team = withFlag(baseTeam, teamRanking);
  const actualPath = buildTeamPath(teamId);
  const groupEntries = actualPath.filter(
    (entry) => !isKnockoutRound(entry.match.round),
  );

  const matches: MatchDifficulty[] = groupEntries.map(
    ({ match, opponent, result, scoreLabel, isPlayed, isNext }) =>
      toMatchDifficulty(
        teamId,
        match.round,
        match.date,
        opponent,
        rankings,
        result,
        scoreLabel,
        isPlayed,
        isNext,
      ),
  );

  const bracket = resolveBracket(scenario, options);
  for (const bracketMatch of bracket) {
    const isHome = bracketMatch.home.teamId === teamId;
    const isAway = bracketMatch.away.teamId === teamId;
    if (!isHome && !isAway) continue;

    const opponentId = isHome
      ? bracketMatch.away.teamId
      : bracketMatch.home.teamId;
    if (!opponentId) continue;

    const opponent = getTeamById(opponentId);
    if (!opponent) continue;

    const overridden = Boolean(scenario.knockoutWinners?.[bracketMatch.num]);
    const isPlayed = overridden ? false : bracketMatch.isPlayed;

    let result: MatchResult = null;
    let scoreLabel: string | null = isPlayed ? bracketMatch.scoreLabel : null;

    if (isPlayed && bracketMatch.winnerTeamId) {
      result = bracketMatch.winnerTeamId === teamId ? "W" : "L";
    } else if (overridden && bracketMatch.winnerTeamId) {
      result = null;
      scoreLabel = null;
    }

    matches.push(
      toMatchDifficulty(
        teamId,
        bracketMatch.round,
        bracketMatch.date,
        opponent,
        rankings,
        result,
        scoreLabel,
        isPlayed,
        false,
      ),
    );
  }

  matches.sort((a, b) => a.date.localeCompare(b.date));

  const truncated: MatchDifficulty[] = [];
  let eliminated = false;
  for (const match of matches) {
    truncated.push(match);
    const stage = getMatchStage(match.round);
    if (stage && stage !== "group" && match.isPlayed && match.result === "L") {
      eliminated = true;
      break;
    }
  }

  const finalMatches = eliminated ? truncated : matches;
  const nextIndex = finalMatches.findIndex((match) => !match.isPlayed);
  if (nextIndex >= 0 && !eliminated) {
    finalMatches[nextIndex] = { ...finalMatches[nextIndex], isNext: true };
  }

  const opponentPoints = finalMatches
    .map((match) => match.opponentPoints)
    .filter((value): value is number => value !== null);
  const opponentRanks = finalMatches
    .map((match) => match.opponentRank)
    .filter((value): value is number => value !== null);

  const nextMatch = finalMatches.find((match) => match.isNext);

  return {
    team,
    teamRank: teamRanking?.rank ?? null,
    teamPoints: teamRanking?.points ?? null,
    matches: finalMatches,
    avgOpponentPoints: average(opponentPoints),
    avgOpponentRank: average(opponentRanks),
    isEliminated: eliminated,
    nextOpponent: nextMatch?.opponent ?? null,
    playedCount: finalMatches.filter((match) => match.isPlayed).length,
    totalCount: finalMatches.length,
  };
}
