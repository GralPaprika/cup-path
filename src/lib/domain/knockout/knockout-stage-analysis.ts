import type {
  KnockoutFixtureEntry,
  KnockoutStageAnalysis,
  OpenFootballMatch,
  RankingEntry,
} from "@/lib/types";
import type { TournamentContext } from "@/lib/domain/tournament/tournament-context";
import {
  getMatchWinner,
  isMatchPlayed,
} from "@/lib/data/worldcup-loader";
import { computeNumericStats } from "@/lib/domain/group/group-stats";
import { buildMatchScoreBreakdown } from "@/lib/domain/match/match-score";
import { buildKnockoutOpponentDifficultyStrip } from "@/lib/domain/knockout/knockout-opponent-difficulty";
import {
  buildParticipantPoolStats,
  findLowestRankedKnockoutQualifier,
} from "@/lib/domain/core/participant-pool";
import {
  findExtremeValue,
  isMeanPlusStdDevOutlier,
} from "@/lib/domain/core/stats-helpers";

function gapPointsForTeams(
  team1Points: number | null,
  team2Points: number | null,
): number {
  if (team1Points === null || team2Points === null) return 0;
  return Math.abs(team1Points - team2Points);
}

function buildKnockoutFixture(
  ctx: TournamentContext,
  match: OpenFootballMatch,
  rankings: Map<string, RankingEntry>,
): KnockoutFixtureEntry | null {
  const team1 = ctx.resolveTeam(match.team1);
  const team2 = ctx.resolveTeam(match.team2);
  if (!team1 || !team2) return null;

  const winnerName = getMatchWinner(match);
  if (!winnerName) return null;

  const winner = ctx.resolveTeam(winnerName);
  if (!winner) return null;

  const score = buildMatchScoreBreakdown(match.score);
  if (!score) return null;

  const team1FifaPoints = rankings.get(team1.id)?.points ?? null;
  const team2FifaPoints = rankings.get(team2.id)?.points ?? null;
  const gapPoints = gapPointsForTeams(team1FifaPoints, team2FifaPoints);

  let upsetWin = false;
  if (
    team1FifaPoints !== null &&
    team2FifaPoints !== null &&
    team1FifaPoints !== team2FifaPoints
  ) {
    const favoriteId =
      team1FifaPoints > team2FifaPoints ? team1.id : team2.id;
    upsetWin = winner.id !== favoriteId;
  }

  return {
    matchNum: match.num ?? null,
    date: match.date,
    team1,
    team2,
    team1FifaPoints,
    team2FifaPoints,
    gapPoints,
    scoreFt: score.ft,
    scoreEt: score.et,
    scorePens: score.pens,
    winnerTeamId: winner.id,
    upsetWin,
    isGapOutlier: false,
  };
}

export function buildKnockoutStageAnalysis(
  ctx: TournamentContext,
  roundName: string,
  rankings: Map<string, RankingEntry>,
): KnockoutStageAnalysis | null {
  const roundMatches = ctx.matches.filter(
    (match) => match.round === roundName && isMatchPlayed(match),
  );

  const rawFixtures = roundMatches
    .map((match) => buildKnockoutFixture(ctx, match, rankings))
    .filter((fixture): fixture is KnockoutFixtureEntry => fixture !== null);

  if (rawFixtures.length === 0) return null;

  const gaps = rawFixtures.map((fixture) => fixture.gapPoints);
  const gapStats = computeNumericStats(gaps);

  const fixtures = rawFixtures
    .map((fixture) => ({
      ...fixture,
      isGapOutlier: isMeanPlusStdDevOutlier(
        fixture.gapPoints,
        gapStats.mean,
        gapStats.stdDev,
        "high",
      ) && fixture.upsetWin,
    }))
    .sort((a, b) => b.gapPoints - a.gapPoints);

  const matchCount = fixtures.length;
  const participantIds = new Set(
    fixtures.flatMap((fixture) => [fixture.team1.id, fixture.team2.id]),
  );
  const pool = buildParticipantPoolStats(ctx, participantIds, rankings);

  return {
    matchCount,
    participantCount: pool.participantCount,
    qualifiedCount: matchCount,
    eliminatedCount: matchCount,
    avgParticipantFifaPoints: pool.avgParticipantFifaPoints,
    avgParticipantFifaPointsContext: pool.avgParticipantFifaPointsContext,
    medianParticipantFifaRank: pool.medianParticipantFifaRank,
    meanGap: gapStats.mean,
    stdDevGap: gapStats.stdDev,
    maxGap: gapStats.max,
    minGap: gapStats.min,
    highestGapMatch: findExtremeValue(fixtures, (fixture) => fixture.gapPoints, true),
    lowestGapMatch: findExtremeValue(fixtures, (fixture) => fixture.gapPoints, false),
    biggestUnderdogWin: findExtremeValue(
      fixtures.filter((fixture) => fixture.upsetWin),
      (fixture) => fixture.gapPoints,
      true,
    ),
    lowestRankedQualifier: findLowestRankedKnockoutQualifier({
      fixtures,
      rankings,
    }),
    fixtures,
    opponentDifficulty: buildKnockoutOpponentDifficultyStrip(fixtures),
  };
}
