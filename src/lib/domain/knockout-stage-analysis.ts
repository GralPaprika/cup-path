import type {
  KnockoutFixtureEntry,
  KnockoutStageAnalysis,
  OpenFootballMatch,
  RankingEntry,
  Team,
} from "@/lib/types";
import { resolveTeam } from "@/lib/data/team-registry";
import {
  getAllMatches,
  getMatchWinner,
  isMatchPlayed,
} from "@/lib/data/worldcup-loader";
import { computeNumericStats } from "@/lib/domain/group-stats";
import { buildMatchScoreBreakdown } from "@/lib/domain/match-score";
import { buildKnockoutOpponentDifficultyStrip } from "@/lib/domain/knockout-opponent-difficulty";
import { buildAvgPointsContext } from "@/lib/domain/points-anchor";

function gapPointsForTeams(
  team1Points: number | null,
  team2Points: number | null,
): number {
  if (team1Points === null || team2Points === null) return 0;
  return Math.abs(team1Points - team2Points);
}

function isGapOutlier(
  gapPoints: number,
  upsetWin: boolean,
  mean: number | null,
  stdDev: number | null,
): boolean {
  return (
    upsetWin &&
    mean !== null &&
    stdDev !== null &&
    stdDev > 0 &&
    gapPoints >= mean + stdDev
  );
}

function findExtremeFixture(
  fixtures: KnockoutFixtureEntry[],
  pickMax: boolean,
): KnockoutFixtureEntry | null {
  if (fixtures.length === 0) return null;

  return fixtures.reduce((best, fixture) => {
    if (pickMax) {
      return fixture.gapPoints > best.gapPoints ? fixture : best;
    }
    return fixture.gapPoints < best.gapPoints ? fixture : best;
  });
}

function findBiggestUnderdogWin(
  fixtures: KnockoutFixtureEntry[],
): KnockoutFixtureEntry | null {
  return findExtremeFixture(
    fixtures.filter((fixture) => fixture.upsetWin),
    true,
  );
}

function buildKnockoutFixture(
  match: OpenFootballMatch,
  rankings: Map<string, RankingEntry>,
): KnockoutFixtureEntry | null {
  const team1 = resolveTeam(match.team1);
  const team2 = resolveTeam(match.team2);
  if (!team1 || !team2) return null;

  const winnerName = getMatchWinner(match);
  if (!winnerName) return null;

  const winner = resolveTeam(winnerName);
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

function winnerTeam(fixture: KnockoutFixtureEntry): Team {
  return fixture.winnerTeamId === fixture.team1.id
    ? fixture.team1
    : fixture.team2;
}

function loserTeam(fixture: KnockoutFixtureEntry): Team {
  return fixture.winnerTeamId === fixture.team1.id
    ? fixture.team2
    : fixture.team1;
}

export function buildKnockoutStageAnalysis(
  roundName: string,
  rankings: Map<string, RankingEntry>,
): KnockoutStageAnalysis | null {
  const roundMatches = getAllMatches().filter(
    (match) => match.round === roundName && isMatchPlayed(match),
  );

  const rawFixtures = roundMatches
    .map((match) => buildKnockoutFixture(match, rankings))
    .filter((fixture): fixture is KnockoutFixtureEntry => fixture !== null);

  if (rawFixtures.length === 0) return null;

  const gaps = rawFixtures.map((fixture) => fixture.gapPoints);
  const gapStats = computeNumericStats(gaps);

  const fixtures = rawFixtures
    .map((fixture) => ({
      ...fixture,
      isGapOutlier: isGapOutlier(
        fixture.gapPoints,
        fixture.upsetWin,
        gapStats.mean,
        gapStats.stdDev,
      ),
    }))
    .sort((a, b) => b.gapPoints - a.gapPoints);

  const matchCount = fixtures.length;
  const participantCount = matchCount * 2;
  const participantIds = new Set(
    fixtures.flatMap((fixture) => [fixture.team1.id, fixture.team2.id]),
  );
  const participantRankings = [...participantIds]
    .map((teamId) => rankings.get(teamId))
    .filter((ranking): ranking is RankingEntry => ranking !== undefined);
  const participantPointsStats = computeNumericStats(
    participantRankings.map((ranking) => ranking.points),
  );
  const participantRankStats = computeNumericStats(
    participantRankings.map((ranking) => ranking.rank),
  );

  let lowestRankedQualifier: KnockoutStageAnalysis["lowestRankedQualifier"] =
    null;

  for (const fixture of fixtures) {
    const winner = winnerTeam(fixture);
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
        opponent: loserTeam(fixture),
      };
    }
  }

  return {
    matchCount,
    participantCount,
    qualifiedCount: matchCount,
    eliminatedCount: matchCount,
    avgParticipantFifaPoints: participantPointsStats.mean,
    avgParticipantFifaPointsContext: buildAvgPointsContext(
      participantPointsStats.mean,
      rankings.values(),
    ),
    medianParticipantFifaRank: participantRankStats.median,
    meanGap: gapStats.mean,
    stdDevGap: gapStats.stdDev,
    maxGap: gapStats.max,
    minGap: gapStats.min,
    highestGapMatch: findExtremeFixture(fixtures, true),
    lowestGapMatch: findExtremeFixture(fixtures, false),
    biggestUnderdogWin: findBiggestUnderdogWin(fixtures),
    lowestRankedQualifier,
    fixtures,
    opponentDifficulty: buildKnockoutOpponentDifficultyStrip(fixtures),
  };
}
