import type {
  AvgPointsContext,
  KnockoutQualifierSpotlight,
  RankingEntry,
  Team,
} from "@/lib/types";
import { computeNumericStats } from "@/lib/domain/group-stats";
import { buildAvgPointsContext } from "@/lib/domain/points-anchor";

export interface ParticipantPoolStats {
  participantCount: number;
  avgParticipantFifaPoints: number | null;
  avgParticipantFifaPointsContext: AvgPointsContext | null;
  medianParticipantFifaRank: number | null;
}

export function buildParticipantPoolStats(
  participantIds: Iterable<string>,
  rankings: Map<string, RankingEntry>,
): ParticipantPoolStats {
  const ids = [...participantIds];
  const participantRankings = ids
    .map((teamId) => rankings.get(teamId))
    .filter((ranking): ranking is RankingEntry => ranking !== undefined);

  const participantPointsStats = computeNumericStats(
    participantRankings.map((ranking) => ranking.points),
  );
  const participantRankStats = computeNumericStats(
    participantRankings.map((ranking) => ranking.rank),
  );

  return {
    participantCount: ids.length,
    avgParticipantFifaPoints: participantPointsStats.mean,
    avgParticipantFifaPointsContext: buildAvgPointsContext(
      participantPointsStats.mean,
      rankings.values(),
    ),
    medianParticipantFifaRank: participantRankStats.median,
  };
}

export function findLowestRankedKnockoutQualifier(options: {
  fixtures: Array<{
    gapPoints: number;
    winnerTeamId: string;
    team1: Team;
    team2: Team;
  }>;
  rankings: Map<string, RankingEntry>;
}): KnockoutQualifierSpotlight | null {
  const { fixtures, rankings } = options;
  let lowestRankedQualifier: KnockoutQualifierSpotlight | null = null;

  for (const fixture of fixtures) {
    const winner =
      fixture.winnerTeamId === fixture.team1.id
        ? fixture.team1
        : fixture.team2;
    const loser =
      fixture.winnerTeamId === fixture.team1.id
        ? fixture.team2
        : fixture.team1;
    const ranking = rankings.get(winner.id);
    if (!ranking) continue;

    if (
      !lowestRankedQualifier ||
      ranking.rank > lowestRankedQualifier.fifaRank
    ) {
      lowestRankedQualifier = {
        team: winner,
        fifaRank: ranking.rank,
        fifaPoints: ranking.points,
        gapPoints: fixture.gapPoints,
        opponent: loser,
      };
    }
  }

  return lowestRankedQualifier;
}
