import type {
  ComparisonEntry,
  GroupStageDifficultyCohort,
  GroupStageDifficultyEntry,
  GroupStageDifficultyInsights,
  GroupStageDifficultySpotlight,
  GroupStageDifficultyStrip,
} from "@/lib/types";
import { getAllMatches } from "@/lib/data/worldcup-loader";
import { computeNumericStats } from "@/lib/domain/group-stats";
import { getAdvancingTeamIds } from "@/lib/domain/group-standings";
import { getGroupNames } from "@/lib/domain/path-builder";

const MEAN_EPSILON = 0.005;

function buildCohort(entries: GroupStageDifficultyEntry[]): GroupStageDifficultyCohort {
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
  entries: GroupStageDifficultyEntry[],
  filter: (entry: GroupStageDifficultyEntry) => boolean,
  pickMax: boolean,
): GroupStageDifficultyEntry | null {
  const pool = entries.filter(filter);
  if (pool.length === 0) return null;

  return pool.reduce((best, current) => {
    if (pickMax) {
      return current.avgOpponentPoints > best.avgOpponentPoints ? current : best;
    }
    return current.avgOpponentPoints < best.avgOpponentPoints ? current : best;
  });
}

function toSpotlight(
  entry: GroupStageDifficultyEntry,
  mean: number,
  stdDev: number | null,
  kind: "survivor" | "casualty",
): GroupStageDifficultySpotlight {
  const isSdOutlier =
    stdDev !== null &&
    stdDev > 0 &&
    (kind === "survivor"
      ? entry.avgOpponentPoints >= mean + stdDev
      : entry.avgOpponentPoints <= mean - stdDev);

  return {
    team: entry.team,
    groupLetter: entry.groupLetter,
    avgOpponentPoints: entry.avgOpponentPoints,
    deltaFromMean: entry.avgOpponentPoints - mean,
    isSdOutlier,
  };
}

function buildGroupStageDifficultyInsights(
  entries: GroupStageDifficultyEntry[],
  mean: number,
  stdDev: number | null,
): GroupStageDifficultyInsights {
  const aboveMeanEntries = entries.filter(
    (entry) => entry.avgOpponentPoints > mean + MEAN_EPSILON,
  );
  const belowMeanEntries = entries.filter(
    (entry) => entry.avgOpponentPoints < mean - MEAN_EPSILON,
  );
  const atMeanEntries = entries.filter(
    (entry) => Math.abs(entry.avgOpponentPoints - mean) <= MEAN_EPSILON,
  );

  const aboveMean = buildCohort(aboveMeanEntries);
  const belowMean = buildCohort(belowMeanEntries);
  const atMean = buildCohort(atMeanEntries);

  const qualifiedAvgs = entries
    .filter((entry) => entry.qualified)
    .map((entry) => entry.avgOpponentPoints);
  const eliminatedAvgs = entries
    .filter((entry) => !entry.qualified)
    .map((entry) => entry.avgOpponentPoints);

  const qualifiedStats = computeNumericStats(qualifiedAvgs);
  const eliminatedStats = computeNumericStats(eliminatedAvgs);

  const aboveRate = qualificationRate(aboveMean);
  const belowRate = qualificationRate(belowMean);
  const qualificationRateGap =
    aboveRate !== null && belowRate !== null ? belowRate - aboveRate : null;

  const hardestSurvivorEntry = findExtremeEntry(
    entries,
    (entry) => entry.qualified,
    true,
  );
  const easiestCasualtyEntry = findExtremeEntry(
    entries,
    (entry) => !entry.qualified,
    false,
  );

  return {
    aboveMean,
    belowMean,
    atMean,
    stdDevAvgOpponentPoints: stdDev,
    medianQualifiedAvg: qualifiedStats.median,
    medianEliminatedAvg: eliminatedStats.median,
    qualificationRateGap,
    hardestDrawSurvivor: hardestSurvivorEntry
      ? toSpotlight(hardestSurvivorEntry, mean, stdDev, "survivor")
      : null,
    easiestDrawCasualty: easiestCasualtyEntry
      ? toSpotlight(easiestCasualtyEntry, mean, stdDev, "casualty")
      : null,
  };
}

export function buildGroupStageDifficultyStrip(
  comparison: ComparisonEntry[],
): GroupStageDifficultyStrip | null {
  const groupNames = getGroupNames();
  const groupMatches = getAllMatches().filter((match) => match.group);
  const advancing = getAdvancingTeamIds(groupMatches, groupNames);

  const entries: GroupStageDifficultyEntry[] = comparison
    .filter((entry) => entry.avgOpponentPoints !== null)
    .map((entry) => ({
      team: entry.team,
      groupLetter: entry.team.group,
      avgOpponentPoints: entry.avgOpponentPoints!,
      qualified: advancing.has(entry.team.id),
    }))
    .sort((a, b) => b.avgOpponentPoints - a.avgOpponentPoints);

  if (entries.length === 0) return null;

  const stats = computeNumericStats(
    entries.map((entry) => entry.avgOpponentPoints),
  );

  const mean = stats.mean ?? 0;

  return {
    entries,
    meanAvgOpponentPoints: stats.mean,
    stdDevAvgOpponentPoints: stats.stdDev,
    minAvgOpponentPoints: stats.min,
    maxAvgOpponentPoints: stats.max,
    insights: buildGroupStageDifficultyInsights(entries, mean, stats.stdDev),
  };
}
