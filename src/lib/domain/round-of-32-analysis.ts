import type {
  OpenFootballMatch,
  RankingEntry,
  Round32Analysis,
  Round32FixtureEntry,
  Team,
  TeamPathSummary,
} from "@/lib/types";
import { resolveTeam } from "@/lib/data/team-registry";
import {
  getAllMatches,
  getMatchWinner,
  isMatchPlayed,
} from "@/lib/data/worldcup-loader";
import { computeNumericStats } from "@/lib/domain/group-stats";
import { buildMatchScoreBreakdown } from "@/lib/domain/match-score";
import { buildRound32OpponentDifficultyStrip } from "@/lib/domain/round-of-32-opponent-difficulty";

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
  fixtures: Round32FixtureEntry[],
  pickMax: boolean,
): Round32FixtureEntry | null {
  if (fixtures.length === 0) return null;

  return fixtures.reduce((best, fixture) => {
    if (pickMax) {
      return fixture.gapPoints > best.gapPoints ? fixture : best;
    }
    return fixture.gapPoints < best.gapPoints ? fixture : best;
  });
}

function findBiggestUnderdogWin(
  fixtures: Round32FixtureEntry[],
): Round32FixtureEntry | null {
  return findExtremeFixture(
    fixtures.filter((fixture) => fixture.upsetWin),
    true,
  );
}

function buildRound32Fixture(
  match: OpenFootballMatch,
  rankings: Map<string, RankingEntry>,
): Round32FixtureEntry | null {
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

function winnerTeam(fixture: Round32FixtureEntry): Team {
  return fixture.winnerTeamId === fixture.team1.id
    ? fixture.team1
    : fixture.team2;
}

function loserTeam(fixture: Round32FixtureEntry): Team {
  return fixture.winnerTeamId === fixture.team1.id
    ? fixture.team2
    : fixture.team1;
}

export function buildRound32Analysis(
  _summaries: TeamPathSummary[],
  rankings: Map<string, RankingEntry>,
): Round32Analysis | null {
  const r32Matches = getAllMatches().filter(
    (match) => match.round === "Round of 32" && isMatchPlayed(match),
  );

  const rawFixtures = r32Matches
    .map((match) => buildRound32Fixture(match, rankings))
    .filter((fixture): fixture is Round32FixtureEntry => fixture !== null);

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

  let lowestRankedQualifier: Round32Analysis["lowestRankedQualifier"] = null;

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
    medianParticipantFifaRank: participantRankStats.median,
    avgRivalDifficulty: participantPointsStats.mean,
    meanGap: gapStats.mean,
    stdDevGap: gapStats.stdDev,
    maxGap: gapStats.max,
    minGap: gapStats.min,
    highestGapMatch: findExtremeFixture(fixtures, true),
    lowestGapMatch: findExtremeFixture(fixtures, false),
    biggestUnderdogWin: findBiggestUnderdogWin(fixtures),
    lowestRankedQualifier,
    fixtures,
    opponentDifficulty: buildRound32OpponentDifficultyStrip(fixtures),
  };
}
