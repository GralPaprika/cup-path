import type {
  MatchDifficulty,
  RankingEntry,
  RankingMode,
  Team,
  TeamPathSummary,
} from "@/lib/types";
import { buildRankingsMap, getRankingsSnapshot } from "@/lib/data/rankings-store";
import {
  buildTeamPath,
  getNextOpponent,
  isTeamEliminated,
} from "@/lib/domain/path-builder";
import { enrichTeam, getTeamById } from "@/lib/data/team-registry";

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function withFlag(team: Team, entry?: RankingEntry): Team {
  return enrichTeam(team, entry?.flagUrl);
}

export async function analyzeTeamPath(
  teamId: string,
  mode: RankingMode,
): Promise<TeamPathSummary | null> {
  const baseTeam = getTeamById(teamId);
  if (!baseTeam) return null;

  const snapshot = await getRankingsSnapshot(mode);
  const rankings = buildRankingsMap(snapshot);
  const teamRanking = rankings.get(teamId);
  const team = withFlag(baseTeam, teamRanking);
  const path = buildTeamPath(teamId);

  const matches: MatchDifficulty[] = path.map(({ match, opponent, result, scoreLabel, isPlayed, isNext }) => {
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
  });

  const opponentPoints = matches
    .map((match) => match.opponentPoints)
    .filter((value): value is number => value !== null);

  const opponentRanks = matches
    .map((match) => match.opponentRank)
    .filter((value): value is number => value !== null);

  const nextOpponent = getNextOpponent(teamId);

  return {
    team,
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

export async function analyzeAllTeams(
  mode: RankingMode,
  selectedTeamId?: string,
): Promise<TeamPathSummary[]> {
  const { getAllTeams } = await import("@/lib/data/team-registry");
  const teams = getAllTeams();
  const summaries: TeamPathSummary[] = [];

  for (const team of teams) {
    const summary = await analyzeTeamPath(team.id, mode);
    if (summary) summaries.push(summary);
  }

  summaries.sort((a, b) => {
    const aPoints = a.avgOpponentPoints ?? 0;
    const bPoints = b.avgOpponentPoints ?? 0;
    return bPoints - aPoints;
  });

  if (selectedTeamId) {
    const selected = summaries.find((s) => s.team.id === selectedTeamId);
    if (selected) {
      return summaries.map((summary) => summary);
    }
  }

  return summaries;
}

export function getHardestPathRank(
  summaries: TeamPathSummary[],
  teamId: string,
): number | null {
  const sorted = [...summaries].sort((a, b) => {
    const aPoints = a.avgOpponentPoints ?? -Infinity;
    const bPoints = b.avgOpponentPoints ?? -Infinity;
    return bPoints - aPoints;
  });

  const index = sorted.findIndex((summary) => summary.team.id === teamId);
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
