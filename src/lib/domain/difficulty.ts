import type {
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
import {
  getMatchStage,
  DEFAULT_PATH_STAGES,
  getFurthestStage,
  PATH_STAGES,
} from "@/lib/domain/match-stages";
import { computeMean } from "@/lib/domain/group-stats";
import {
  buildCompetitionRankMap,
  rankTeamInCohort,
} from "@/lib/domain/path-ranking";
import { enrichTeam, getAllTeams, getTeamById } from "@/lib/data/team-registry";
import { buildAvgPointsContext } from "@/lib/domain/points-anchor";

const ALL_PATH_STAGES = new Set(PATH_STAGES);

function withFlag(team: Team, entry?: RankingEntry): Team {
  return enrichTeam(team, entry?.flagUrl);
}

export interface FilteredAverageOptions {
  playedOnly?: boolean;
}

export function computeFilteredAverages(
  matches: MatchDifficulty[],
  stages: Set<PathStage>,
  options: FilteredAverageOptions = {},
): { avgOpponentPoints: number | null; avgOpponentRank: number | null } {
  const filtered = matches.filter((match) => {
    const stage = getMatchStage(match.round);
    if (stage === null || !stages.has(stage)) return false;
    if (options.playedOnly && !match.isPlayed) return false;
    return true;
  });

  const opponentPoints = filtered
    .map((match) => match.opponentPoints)
    .filter((value): value is number => value !== null);

  const opponentRanks = filtered
    .map((match) => match.opponentRank)
    .filter((value): value is number => value !== null);

  return {
    avgOpponentPoints: computeMean(opponentPoints),
    avgOpponentRank: computeMean(opponentRanks),
  };
}

interface CohortMetricEntry {
  teamId: string;
  avgOpponentPoints: number;
  avgOpponentRank: number;
}

function buildCohortMetricEntries(
  allSummaries: TeamPathSummary[],
  teamId: string,
  pathSummary: TeamPathSummary | undefined,
  stages: Set<PathStage>,
  cohortTeamIds: Set<string>,
  options: FilteredAverageOptions = {},
): CohortMetricEntry[] {
  const summaryByTeamId = new Map(
    allSummaries.map((summary) => [summary.team.id, summary]),
  );

  return [...cohortTeamIds]
    .map((id) => {
      const summary =
        id === teamId && pathSummary ? pathSummary : summaryByTeamId.get(id);
      if (!summary) return null;

      const { avgOpponentPoints, avgOpponentRank } = computeFilteredAverages(
        summary.matches,
        stages,
        options,
      );

      return {
        teamId: id,
        avgOpponentPoints:
          avgOpponentPoints ?? Number.NEGATIVE_INFINITY,
        avgOpponentRank: avgOpponentRank ?? Number.POSITIVE_INFINITY,
      };
    })
    .filter((entry): entry is CohortMetricEntry => entry !== null);
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

  const { avgOpponentPoints, avgOpponentRank } = computeFilteredAverages(
    matches,
    ALL_PATH_STAGES,
  );

  const nextOpponent = getNextOpponent(teamId);

  return {
    team,
    teamRank: teamRanking?.rank ?? null,
    teamPoints: teamRanking?.points ?? null,
    matches,
    avgOpponentPoints,
    avgOpponentRank,
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
    const aPoints = a.avgOpponentPoints ?? Number.NEGATIVE_INFINITY;
    const bPoints = b.avgOpponentPoints ?? Number.NEGATIVE_INFINITY;
    return bPoints - aPoints;
  });

  return summaries;
}

export interface HardestPathRankResult {
  rank: number | null;
  rankByAvgRank: number | null;
  cohortSize: number;
  cohortStage: PathStage;
}

export function getHardestPathRank(
  summaries: TeamPathSummary[],
  teamId: string,
  stages: Set<PathStage> = new Set(DEFAULT_PATH_STAGES),
  cohortTeamIds: Set<string>,
  options: FilteredAverageOptions = {},
): HardestPathRankResult {
  const cohortStage = getFurthestStage(stages);
  const focusSummary = summaries.find((summary) => summary.team.id === teamId);

  const cohortEntries = buildCohortMetricEntries(
    summaries,
    teamId,
    focusSummary,
    stages,
    cohortTeamIds,
    options,
  );

  const pointsEntries = cohortEntries.map((entry) => ({
    teamId: entry.teamId,
    value: entry.avgOpponentPoints,
  }));
  const rankEntries = cohortEntries.map((entry) => ({
    teamId: entry.teamId,
    value: entry.avgOpponentRank,
  }));

  return {
    rank: rankTeamInCohort(pointsEntries, teamId, true),
    rankByAvgRank: rankTeamInCohort(rankEntries, teamId, false),
    cohortSize: cohortEntries.length,
    cohortStage,
  };
}

export function applyStageFilterToSummary(
  summary: TeamPathSummary,
  stages: Set<PathStage>,
  options: FilteredAverageOptions = {},
): TeamPathSummary {
  const { avgOpponentPoints, avgOpponentRank } = computeFilteredAverages(
    summary.matches,
    stages,
    options,
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
  cohortTeamIds?: Set<string>,
  rankings?: Map<string, RankingEntry>,
  options: FilteredAverageOptions = {},
) {
  const entries = summaries.map((summary) => {
    const { avgOpponentPoints, avgOpponentRank } = computeFilteredAverages(
      summary.matches,
      stages,
      options,
    );

    return {
      team: summary.team,
      avgOpponentPoints,
      avgOpponentRank,
      isEliminated: summary.isEliminated,
    };
  });

  const cohort =
    cohortTeamIds ??
    new Set(entries.map((entry) => entry.team.id));

  const cohortPointsEntries = entries
    .filter((entry) => cohort.has(entry.team.id))
    .map((entry) => ({
      teamId: entry.team.id,
      value: entry.avgOpponentPoints ?? Number.NEGATIVE_INFINITY,
    }));

  const rankByTeamId = buildCompetitionRankMap(cohortPointsEntries, true);

  const selectedAvg =
    selectedTeamId && cohort.has(selectedTeamId)
      ? entries.find((entry) => entry.team.id === selectedTeamId)
          ?.avgOpponentPoints ?? null
      : null;

  return entries.map((entry) => ({
    ...entry,
    avgPointsContext: rankings
      ? buildAvgPointsContext(entry.avgOpponentPoints, rankings.values(), {
          excludeTeamId: entry.team.id,
        })
      : null,
    rankAmongTeams: rankByTeamId.get(entry.team.id) ?? null,
    deltaVsSelected:
      selectedAvg !== null && entry.avgOpponentPoints !== null
        ? entry.avgOpponentPoints - selectedAvg
        : null,
  }));
}
