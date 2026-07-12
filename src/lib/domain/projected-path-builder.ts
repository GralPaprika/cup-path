import type {
  MatchDifficulty,
  MatchResult,
  RankingEntry,
  SimulationScenario,
  Team,
  TeamPathSummary,
} from "@/lib/types";
import type { TournamentContext } from "@/lib/domain/tournament-context";
import { enrichTeam } from "@/lib/data/team-registry";
import { isKnockoutRound } from "@/lib/data/worldcup-loader";
import {
  resolveBracket,
  type ResolveBracketOptions,
} from "@/lib/domain/bracket-resolver";
import { computeFilteredAverages } from "@/lib/domain/difficulty";
import { getMatchStage, PATH_STAGES } from "@/lib/domain/match-stages";
import { buildTeamPath } from "@/lib/domain/path-builder";

const ALL_PATH_STAGES = new Set(PATH_STAGES);

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
  ctx: TournamentContext,
  teamId: string,
  scenario: SimulationScenario,
  rankings: Map<string, RankingEntry>,
  options: ResolveBracketOptions = {},
): TeamPathSummary | null {
  const baseTeam = ctx.getTeamById(teamId);
  if (!baseTeam) return null;

  const teamRanking = rankings.get(teamId);
  const team = withFlag(baseTeam, teamRanking);
  const actualPath = buildTeamPath(ctx, teamId);
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

  const bracket = resolveBracket(ctx, scenario, options);
  for (const bracketMatch of bracket) {
    const isHome = bracketMatch.home.teamId === teamId;
    const isAway = bracketMatch.away.teamId === teamId;
    if (!isHome && !isAway) continue;

    const opponentId = isHome
      ? bracketMatch.away.teamId
      : bracketMatch.home.teamId;
    if (!opponentId) continue;

    const opponent = ctx.getTeamById(opponentId);
    if (!opponent) continue;

    const overridden = Boolean(scenario.knockoutWinners?.[bracketMatch.num]);
    const isPlayed = overridden ? false : bracketMatch.isPlayed;

    let result: MatchResult = null;
    let scoreLabel: string | null = isPlayed ? bracketMatch.scoreLabel : null;

    if (isPlayed && bracketMatch.winnerTeamId) {
      result = bracketMatch.winnerTeamId === teamId ? "W" : "L";
    } else if (overridden && bracketMatch.winnerTeamId) {
      result = bracketMatch.winnerTeamId === teamId ? "W" : "L";
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
    if (stage && stage !== "group" && match.result === "L") {
      eliminated = true;
      break;
    }
  }

  const finalMatches = eliminated ? truncated : matches;
  const nextIndex = finalMatches.findIndex((match) => !match.isPlayed);
  if (nextIndex >= 0 && !eliminated) {
    finalMatches[nextIndex] = { ...finalMatches[nextIndex], isNext: true };
  }

  const { avgOpponentPoints, avgOpponentRank } = computeFilteredAverages(
    finalMatches,
    ALL_PATH_STAGES,
  );

  const nextMatch = finalMatches.find((match) => match.isNext);

  return {
    team,
    teamRank: teamRanking?.rank ?? null,
    teamPoints: teamRanking?.points ?? null,
    matches: finalMatches,
    avgOpponentPoints,
    avgOpponentRank,
    isEliminated: eliminated,
    nextOpponent: nextMatch?.opponent ?? null,
    playedCount: finalMatches.filter((match) => match.isPlayed).length,
    totalCount: finalMatches.length,
  };
}
