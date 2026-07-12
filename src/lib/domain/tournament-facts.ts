import type {
  GroupComparisonCard,
  GroupOfDeathFact,
  GroupStagePoolFact,
  PathStage,
  RankingEntry,
  TeamHighlightFact,
  TournamentFacts,
  TournamentHighlights,
  TournamentSnapshot,
  TeamPathSummary,
  UpsetMatchFact,
} from "@/lib/types";
import type { TournamentContext } from "@/lib/domain/tournament-context";
import { computeMean, computeNumericStats } from "@/lib/domain/group-stats";
import { buildParticipantPoolStats } from "@/lib/domain/participant-pool";
import { getAdvancingTeamIds } from "@/lib/domain/group-standings";
import {
  PATH_STAGES,
  stageIndex,
} from "@/lib/domain/match-stages";
import { getGroupNames } from "@/lib/domain/path-builder";
import {
  getTeamMaxStageReached,
  getTeamsAtStage,
} from "@/lib/domain/team-stage-logic";

const TEAM_COUNT = 48;

function expectedStageIndexFromRank(rank: number): number {
  const clamped = Math.max(1, Math.min(TEAM_COUNT, rank));
  return Math.round(((clamped - 1) * (PATH_STAGES.length - 1)) / (TEAM_COUNT - 1));
}

function buildSnapshot(
  rankings: Map<string, RankingEntry>,
  teamCounts: Record<PathStage, number>,
): TournamentSnapshot {
  const points = [...rankings.values()].map((entry) => entry.points);
  const ranks = [...rankings.values()].map((entry) => entry.rank);

  return {
    avgFifaPoints: computeMean(points),
    medianFifaRank: computeNumericStats(ranks).median,
    teamCounts,
  };
}

function buildGroupStagePool(
  ctx: TournamentContext,
  summaries: TeamPathSummary[],
  rankings: Map<string, RankingEntry>,
  teamCounts: Record<PathStage, number>,
): GroupStagePoolFact {
  const cohortIds = getTeamsAtStage(ctx, "group");
  const pool = buildParticipantPoolStats(ctx, cohortIds, rankings);
  const summaryById = new Map(
    summaries.map((summary) => [summary.team.id, summary]),
  );

  const groupMatches = ctx.matches.filter((match) => match.group);
  const advancing = getAdvancingTeamIds(ctx, groupMatches, getGroupNames());

  let lowestRankedQualifier: GroupStagePoolFact["lowestRankedQualifier"] = null;
  for (const teamId of advancing) {
    const ranking = rankings.get(teamId);
    const summary = summaryById.get(teamId);
    if (!ranking || !summary) continue;

    if (
      !lowestRankedQualifier ||
      ranking.rank > lowestRankedQualifier.fifaRank
    ) {
      lowestRankedQualifier = {
        team: summary.team,
        fifaRank: ranking.rank,
        fifaPoints: ranking.points,
        groupLetter: summary.team.group,
      };
    }
  }

  return {
    teamCount: teamCounts.group ?? pool.participantCount,
    avgFifaPoints: pool.avgParticipantFifaPoints,
    avgFifaPointsContext: pool.avgParticipantFifaPointsContext,
    medianFifaRank: pool.medianParticipantFifaRank,
    lowestRankedQualifier,
  };
}

interface PerformanceDelta {
  teamId: string;
  delta: number;
  maxStageReached: PathStage;
}

function buildPerformanceDeltas(
  ctx: TournamentContext,
  summaries: TeamPathSummary[],
  rankings: Map<string, RankingEntry>,
): PerformanceDelta[] {
  return summaries.flatMap((summary) => {
    const ranking = rankings.get(summary.team.id);
    if (!ranking) return [];

    const actualIndex = stageIndex(getTeamMaxStageReached(ctx, summary.team.id));
    const expectedIndex = expectedStageIndexFromRank(ranking.rank);

    return [
      {
        teamId: summary.team.id,
        delta: actualIndex - expectedIndex,
        maxStageReached: PATH_STAGES[actualIndex],
      },
    ];
  });
}

function toTeamHighlight(
  summary: TeamPathSummary,
  rankings: Map<string, RankingEntry>,
  delta: PerformanceDelta,
): TeamHighlightFact {
  const ranking = rankings.get(summary.team.id);
  return {
    team: summary.team,
    fifaRank: ranking?.rank ?? null,
    fifaPoints: ranking?.points ?? null,
    maxStageReached: delta.maxStageReached,
    value: delta.delta,
  };
}

function buildOverUnderPerformers(
  ctx: TournamentContext,
  summaries: TeamPathSummary[],
  rankings: Map<string, RankingEntry>,
): Pick<TournamentHighlights, "overPerformer" | "underPerformer"> {
  const deltas = buildPerformanceDeltas(ctx, summaries, rankings);
  if (deltas.length === 0) {
    return { overPerformer: null, underPerformer: null };
  }

  const summaryById = new Map(
    summaries.map((summary) => [summary.team.id, summary]),
  );

  const over = deltas.reduce((best, current) =>
    current.delta > best.delta ? current : best,
  );
  const under = deltas.reduce((best, current) =>
    current.delta < best.delta ? current : best,
  );

  const overSummary = summaryById.get(over.teamId);
  const underSummary = summaryById.get(under.teamId);

  return {
    overPerformer:
      overSummary && over.delta > 0
        ? toTeamHighlight(overSummary, rankings, over)
        : null,
    underPerformer:
      underSummary && under.delta < 0
        ? toTeamHighlight(underSummary, rankings, under)
        : null,
  };
}

function scanUpsetMatches(summaries: TeamPathSummary[]): {
  biggestGiantKilling: UpsetMatchFact | null;
  biggestFavoriteUpset: UpsetMatchFact | null;
  giantKillerTotals: Map<string, number>;
} {
  let biggestGiantKilling: UpsetMatchFact | null = null;
  let biggestFavoriteUpset: UpsetMatchFact | null = null;
  const giantKillerTotals = new Map<string, number>();

  for (const summary of summaries) {
    for (const match of summary.matches) {
      if (!match.isPlayed || match.pointsGap === null) continue;

      if (match.result === "W" && match.pointsGap > 0) {
        const total =
          (giantKillerTotals.get(summary.team.id) ?? 0) + match.pointsGap;
        giantKillerTotals.set(summary.team.id, total);

        if (
          !biggestGiantKilling ||
          match.pointsGap > biggestGiantKilling.pointsGap
        ) {
          biggestGiantKilling = {
            team: summary.team,
            opponent: match.opponent,
            pointsGap: match.pointsGap,
            round: match.round,
            scoreLabel: match.scoreLabel,
          };
        }
      }

      if (match.result === "L" && match.pointsGap < 0) {
        if (
          !biggestFavoriteUpset ||
          match.pointsGap < biggestFavoriteUpset.pointsGap
        ) {
          biggestFavoriteUpset = {
            team: summary.team,
            opponent: match.opponent,
            pointsGap: match.pointsGap,
            round: match.round,
            scoreLabel: match.scoreLabel,
          };
        }
      }
    }
  }

  return { biggestGiantKilling, biggestFavoriteUpset, giantKillerTotals };
}

function buildGiantKillerLeader(
  ctx: TournamentContext,
  summaries: TeamPathSummary[],
  rankings: Map<string, RankingEntry>,
  giantKillerTotals: Map<string, number>,
): TeamHighlightFact | null {
  let leaderId: string | null = null;
  let leaderTotal = 0;

  for (const [teamId, total] of giantKillerTotals) {
    if (total > leaderTotal) {
      leaderTotal = total;
      leaderId = teamId;
    }
  }

  if (!leaderId || leaderTotal <= 0) return null;

  const summary = summaries.find((entry) => entry.team.id === leaderId);
  if (!summary) return null;

  const ranking = rankings.get(leaderId);
  return {
    team: summary.team,
    fifaRank: ranking?.rank ?? null,
    fifaPoints: ranking?.points ?? null,
    maxStageReached: getTeamMaxStageReached(ctx, leaderId),
    value: leaderTotal,
  };
}

function buildRemainingPathHighlights(
  ctx: TournamentContext,
  summaries: TeamPathSummary[],
  rankings: Map<string, RankingEntry>,
): Pick<TournamentHighlights, "hardestRemainingPath" | "easiestRemainingPath"> {
  const active = summaries.filter((summary) => !summary.isEliminated);
  const withDifficulty = active.filter(
    (summary) => summary.avgOpponentPoints !== null,
  );

  if (withDifficulty.length === 0) {
    return { hardestRemainingPath: null, easiestRemainingPath: null };
  }

  const hardest = withDifficulty.reduce((best, current) =>
    (current.avgOpponentPoints ?? 0) > (best.avgOpponentPoints ?? 0)
      ? current
      : best,
  );
  const easiest = withDifficulty.reduce((best, current) =>
    (current.avgOpponentPoints ?? Number.POSITIVE_INFINITY) <
    (best.avgOpponentPoints ?? Number.POSITIVE_INFINITY)
      ? current
      : best,
  );

  function toPathHighlight(summary: TeamPathSummary): TeamHighlightFact {
    const ranking = rankings.get(summary.team.id);
    return {
      team: summary.team,
      fifaRank: ranking?.rank ?? null,
      fifaPoints: ranking?.points ?? null,
      maxStageReached: getTeamMaxStageReached(ctx, summary.team.id),
      value: summary.avgOpponentPoints ?? 0,
    };
  }

  return {
    hardestRemainingPath: toPathHighlight(hardest),
    easiestRemainingPath: toPathHighlight(easiest),
  };
}

function buildGroupOfDeath(
  groupCards: GroupComparisonCard[],
): GroupOfDeathFact | null {
  const ranked = groupCards
    .filter((card) => card.avgFifaPoints !== null)
    .sort((a, b) => (b.avgFifaPoints ?? 0) - (a.avgFifaPoints ?? 0));

  const top = ranked[0];
  if (!top) return null;

  return {
    groupLetter: top.groupLetter,
    avgFifaPoints: top.avgFifaPoints,
  };
}

export function buildTournamentFacts(
  ctx: TournamentContext,
  summaries: TeamPathSummary[],
  rankings: Map<string, RankingEntry>,
  teamCounts: Record<PathStage, number>,
  groupCards: GroupComparisonCard[] = [],
): Omit<
  TournamentFacts,
  | "groupExpectedAnalysis"
  | "groupStageDifficulty"
  | "knockoutAnalyses"
> {
  const snapshot = buildSnapshot(rankings, teamCounts);
  const groupStagePool = buildGroupStagePool(ctx, summaries, rankings, teamCounts);
  const overUnder = buildOverUnderPerformers(ctx, summaries, rankings);
  const upsets = scanUpsetMatches(summaries);
  const remainingPaths = buildRemainingPathHighlights(ctx, summaries, rankings);

  const highlights: TournamentHighlights = {
    ...overUnder,
    ...remainingPaths,
    biggestGiantKilling: upsets.biggestGiantKilling,
    biggestFavoriteUpset: upsets.biggestFavoriteUpset,
    giantKillerLeader: buildGiantKillerLeader(
      ctx,
      summaries,
      rankings,
      upsets.giantKillerTotals,
    ),
    groupOfDeath: buildGroupOfDeath(groupCards),
  };

  return { snapshot, groupStagePool, highlights };
}
