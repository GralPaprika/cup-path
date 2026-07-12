import type {
  GroupStageDifficultyCohort,
  KnockoutFixtureEntry,
  KnockoutOpponentDifficultyEntry,
  KnockoutOpponentDifficultyInsights,
  KnockoutOpponentDifficultySpotlight,
  KnockoutOpponentDifficultyStrip,
} from "@/lib/types";
import { computeNumericStats } from "@/lib/domain/group-stats";

const MEAN_EPSILON = 0.005;

function buildCohort(
  entries: KnockoutOpponentDifficultyEntry[],
): GroupStageDifficultyCohort {
  const qualified = entries.filter((entry) => entry.qualified).length;
  return {
    total: entries.length,
    qualified,
    eliminated: entries.length - qualified,
  };
}

function qualificationRate(cohort: GroupStageDifficultyCohort): number | null {
  if (cohort.total === 0) return null;
  return cohort.qualified / cohort.total;
}

function findExtremeEntry(
  entries: KnockoutOpponentDifficultyEntry[],
  filter: (entry: KnockoutOpponentDifficultyEntry) => boolean,
  pickMax: boolean,
): KnockoutOpponentDifficultyEntry | null {
  const pool = entries.filter(filter);
  if (pool.length === 0) return null;

  return pool.reduce((best, current) => {
    if (pickMax) {
      return current.opponentFifaPoints > best.opponentFifaPoints
        ? current
        : best;
    }
    return current.opponentFifaPoints < best.opponentFifaPoints
      ? current
      : best;
  });
}

function toSpotlight(
  entry: KnockoutOpponentDifficultyEntry,
  mean: number,
  stdDev: number | null,
  kind: "qualifier" | "eliminated",
): KnockoutOpponentDifficultySpotlight {
  const isSdOutlier =
    stdDev !== null &&
    stdDev > 0 &&
    (kind === "qualifier"
      ? entry.opponentFifaPoints >= mean + stdDev
      : entry.opponentFifaPoints <= mean - stdDev);

  return {
    team: entry.team,
    opponent: entry.opponent,
    opponentFifaPoints: entry.opponentFifaPoints,
    deltaFromMean: entry.opponentFifaPoints - mean,
    isSdOutlier,
    matchNum: entry.matchNum,
  };
}

function buildKnockoutOpponentDifficultyInsights(
  entries: KnockoutOpponentDifficultyEntry[],
  mean: number,
  stdDev: number | null,
): KnockoutOpponentDifficultyInsights {
  const aboveMeanEntries = entries.filter(
    (entry) => entry.opponentFifaPoints > mean + MEAN_EPSILON,
  );
  const belowMeanEntries = entries.filter(
    (entry) => entry.opponentFifaPoints < mean - MEAN_EPSILON,
  );
  const atMeanEntries = entries.filter(
    (entry) => Math.abs(entry.opponentFifaPoints - mean) <= MEAN_EPSILON,
  );

  const aboveMean = buildCohort(aboveMeanEntries);
  const belowMean = buildCohort(belowMeanEntries);
  const atMean = buildCohort(atMeanEntries);

  const qualifiedOpponents = entries
    .filter((entry) => entry.qualified)
    .map((entry) => entry.opponentFifaPoints);
  const eliminatedOpponents = entries
    .filter((entry) => !entry.qualified)
    .map((entry) => entry.opponentFifaPoints);

  const qualifiedStats = computeNumericStats(qualifiedOpponents);
  const eliminatedStats = computeNumericStats(eliminatedOpponents);

  const aboveRate = qualificationRate(aboveMean);
  const belowRate = qualificationRate(belowMean);
  const qualificationRateGap =
    aboveRate !== null && belowRate !== null ? belowRate - aboveRate : null;

  const hardestOpponentQualifierEntry = findExtremeEntry(
    entries,
    (entry) => entry.qualified,
    true,
  );
  const easiestOpponentEliminatedEntry = findExtremeEntry(
    entries,
    (entry) => !entry.qualified,
    false,
  );

  return {
    aboveMean,
    belowMean,
    atMean,
    stdDevOpponentPoints: stdDev,
    medianQualifiedOpponent: qualifiedStats.median,
    medianEliminatedOpponent: eliminatedStats.median,
    qualificationRateGap,
    hardestOpponentQualifier: hardestOpponentQualifierEntry
      ? toSpotlight(hardestOpponentQualifierEntry, mean, stdDev, "qualifier")
      : null,
    easiestOpponentEliminated: easiestOpponentEliminatedEntry
      ? toSpotlight(
          easiestOpponentEliminatedEntry,
          mean,
          stdDev,
          "eliminated",
        )
      : null,
  };
}

export function buildKnockoutOpponentDifficultyStrip(
  fixtures: KnockoutFixtureEntry[],
): KnockoutOpponentDifficultyStrip | null {
  const entries: KnockoutOpponentDifficultyEntry[] = [];

  for (const fixture of fixtures) {
    if (fixture.team1FifaPoints === null || fixture.team2FifaPoints === null) {
      continue;
    }

    const team1Qualified = fixture.winnerTeamId === fixture.team1.id;

    entries.push({
      team: fixture.team1,
      opponent: fixture.team2,
      opponentFifaPoints: fixture.team2FifaPoints,
      qualified: team1Qualified,
      matchNum: fixture.matchNum,
    });
    entries.push({
      team: fixture.team2,
      opponent: fixture.team1,
      opponentFifaPoints: fixture.team1FifaPoints,
      qualified: !team1Qualified,
      matchNum: fixture.matchNum,
    });
  }

  if (entries.length === 0) return null;

  entries.sort((a, b) => b.opponentFifaPoints - a.opponentFifaPoints);

  const stats = computeNumericStats(
    entries.map((entry) => entry.opponentFifaPoints),
  );
  const mean = stats.mean ?? 0;

  return {
    entries,
    meanOpponentPoints: stats.mean,
    stdDevOpponentPoints: stats.stdDev,
    minOpponentPoints: stats.min,
    maxOpponentPoints: stats.max,
    insights: buildKnockoutOpponentDifficultyInsights(
      entries,
      mean,
      stats.stdDev,
    ),
  };
}
