import type {
  ComparisonEntry,
  MatchDifficulty,
  PathStage,
  RankingEntry,
  Team,
  TeamPathSummary,
} from "@/lib/types";
import {
  buildTeamPath,
  getNextOpponent,
  isTeamEliminated,
} from "@/lib/domain/path-builder";
import { getMatchStage, DEFAULT_PATH_STAGES, getFurthestStage, PATH_STAGES } from "@/lib/domain/match-stages";
import { enrichTeam, getAllTeams, getTeamById } from "@/lib/data/team-registry";

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function withFlag(team: Team, entry?: RankingEntry): Team {
  return enrichTeam(team, entry?.flagUrl);
}

export function computeFilteredAverages(
  matches: MatchDifficulty[],
  stages: Set<PathStage>,
): { avgOpponentPoints: number | null; avgOpponentRank: number | null } {
  const filtered = matches.filter((match) => {
    const stage = getMatchStage(match.round);
    return stage !== null && stages.has(stage);
  });

  const opponentPoints = filtered
    .map((match) => match.opponentPoints)
    .filter((value): value is number => value !== null);

  const opponentRanks = filtered
    .map((match) => match.opponentRank)
    .filter((value): value is number => value !== null);

  return {
    avgOpponentPoints: average(opponentPoints),
    avgOpponentRank: average(opponentRanks),
  };
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

export interface HardestPathRankResult {
  rank: number | null;
  cohortSize: number;
  cohortStage: PathStage;
}

export function getHardestPathRank(
  summaries: TeamPathSummary[],
  teamId: string,
  stages: Set<PathStage> = new Set(DEFAULT_PATH_STAGES),
  cohortTeamIds: Set<string>,
): HardestPathRankResult {
  const cohortStage = getFurthestStage(stages);
  const ranked = summaries
    .filter((summary) => cohortTeamIds.has(summary.team.id))
    .map((summary) => ({
      teamId: summary.team.id,
      avg:
        computeFilteredAverages(summary.matches, stages).avgOpponentPoints ??
        Number.NEGATIVE_INFINITY,
    }))
    .sort((a, b) => b.avg - a.avg);

  const index = ranked.findIndex((entry) => entry.teamId === teamId);

  return {
    rank: index >= 0 ? index + 1 : null,
    cohortSize: cohortTeamIds.size,
    cohortStage,
  };
}

export function applyStageFilterToSummary(
  summary: TeamPathSummary,
  stages: Set<PathStage>,
): TeamPathSummary {
  const { avgOpponentPoints, avgOpponentRank } = computeFilteredAverages(
    summary.matches,
    stages,
  );

  return {
    ...summary,
    avgOpponentPoints,
    avgOpponentRank,
  };
}

export function buildComparison(
  summaries: TeamPathSummary[],
  selectedTeamId?: string,
  stages: Set<PathStage> = new Set(DEFAULT_PATH_STAGES),
) {
  const entries = summaries.map((summary) => {
    const { avgOpponentPoints, avgOpponentRank } = computeFilteredAverages(
      summary.matches,
      stages,
    );

    return {
      team: summary.team,
      avgOpponentPoints,
      avgOpponentRank,
      isEliminated: summary.isEliminated,
    };
  });

  entries.sort((a, b) => {
    const aPoints = a.avgOpponentPoints ?? Number.NEGATIVE_INFINITY;
    const bPoints = b.avgOpponentPoints ?? Number.NEGATIVE_INFINITY;
    return bPoints - aPoints;
  });

  const selectedAvg =
    entries.find((entry) => entry.team.id === selectedTeamId)?.avgOpponentPoints ??
    null;

  return entries.map((entry, index) => ({
    ...entry,
    rankAmongTeams: index + 1,
    deltaVsSelected:
      selectedAvg !== null && entry.avgOpponentPoints !== null
        ? entry.avgOpponentPoints - selectedAvg
        : null,
  }));
}
