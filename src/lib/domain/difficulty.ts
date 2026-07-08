import type {
  MatchDifficulty,
  RankingEntry,
  Team,
  TeamPathSummary,
} from "@/lib/types";
import {
  buildTeamPath,
  getNextOpponent,
  isTeamEliminated,
} from "@/lib/domain/path-builder";
import { enrichTeam, getAllTeams, getTeamById } from "@/lib/data/team-registry";

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function withFlag(team: Team, entry?: RankingEntry): Team {
  return enrichTeam(team, entry?.flagUrl);
}

export function buildTeamPathSummary(
  teamId: string,
  rankings: Map<string, RankingEntry>,
): TeamPathSummary | null {
  const baseTeam = getTeamById(teamId);
  if (!baseTeam) return null;

  const teamRanking = rankings.get(teamId);
  const team = withFlag(baseTeam, teamRanking);
  const path = buildTeamPath(teamId);

  const matches: MatchDifficulty[] = path.map(
    ({ match, opponent, result, scoreLabel, isPlayed, isNext }) => {
      const opponentRanking = rankings.get(opponent.id);
      const opponentRank = opponentRanking?.rank ?? null;
      const opponentPoints = opponentRanking?.points ?? null;
      const teamRank = teamRanking?.rank ?? null;
      const teamPoints = teamRanking?.points ?? null;

      return {
        round: match.round,
        date: match.date,
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
    },
  );

  const opponentPoints = matches
    .map((match) => match.opponentPoints)
    .filter((value): value is number => value !== null);

  const opponentRanks = matches
    .map((match) => match.opponentRank)
    .filter((value): value is number => value !== null);

  const nextOpponent = getNextOpponent(teamId);

  return {
    team,
    teamRank: teamRanking?.rank ?? null,
    teamPoints: teamRanking?.points ?? null,
    matches,
    avgOpponentPoints: average(opponentPoints),
    avgOpponentRank: average(opponentRanks),
    isEliminated: isTeamEliminated(teamId),
    nextOpponent: nextOpponent
      ? withFlag(nextOpponent, rankings.get(nextOpponent.id))
      : null,
    playedCount: matches.filter((match) => match.isPlayed).length,
    totalCount: matches.length,
  };
}

export function buildAllTeamSummaries(
  rankings: Map<string, RankingEntry>,
): TeamPathSummary[] {
  const summaries = getAllTeams()
    .map((team) => buildTeamPathSummary(team.id, rankings))
    .filter((summary): summary is TeamPathSummary => summary !== null);

  summaries.sort((a, b) => {
    const aPoints = a.avgOpponentPoints ?? 0;
    const bPoints = b.avgOpponentPoints ?? 0;
    return bPoints - aPoints;
  });

  return summaries;
}

export function getHardestPathRank(
  summaries: TeamPathSummary[],
  teamId: string,
): number | null {
  const index = summaries.findIndex((summary) => summary.team.id === teamId);
  return index >= 0 ? index + 1 : null;
}

export function buildComparison(
  summaries: TeamPathSummary[],
  selectedTeamId?: string,
) {
  const selectedAvg =
    summaries.find((s) => s.team.id === selectedTeamId)?.avgOpponentPoints ??
    null;

  return summaries.map((summary, index) => ({
    team: summary.team,
    avgOpponentPoints: summary.avgOpponentPoints,
    avgOpponentRank: summary.avgOpponentRank,
    isEliminated: summary.isEliminated,
    rankAmongTeams: index + 1,
    deltaVsSelected:
      selectedAvg !== null && summary.avgOpponentPoints !== null
        ? summary.avgOpponentPoints - selectedAvg
        : null,
  }));
}
