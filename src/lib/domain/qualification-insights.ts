import type { GroupStageDifficultyCohort } from "@/lib/types";
import { computeNumericStats } from "@/lib/domain/group-stats";
import { MEAN_EPSILON, findExtremeBy } from "@/lib/domain/stats-helpers";

export function buildQualificationCohort(
  entries: Array<{ qualified: boolean }>,
): GroupStageDifficultyCohort {
  const qualified = entries.filter((entry) => entry.qualified).length;
  return {
    total: entries.length,
    qualified,
    eliminated: entries.length - qualified,
  };
}

export function qualificationRate(
  cohort: GroupStageDifficultyCohort,
): number | null {
  if (cohort.total === 0) return null;
  return cohort.qualified / cohort.total;
}

export interface QualificationInsightsResult<TSpotlight> {
  aboveMean: GroupStageDifficultyCohort;
  belowMean: GroupStageDifficultyCohort;
  atMean: GroupStageDifficultyCohort;
  stdDevValue: number | null;
  medianQualifiedValue: number | null;
  medianEliminatedValue: number | null;
  qualificationRateGap: number | null;
  hardestQualifierSpotlight: TSpotlight | null;
  easiestEliminatedSpotlight: TSpotlight | null;
}

export function buildQualificationInsights<TEntry, TSpotlight>(options: {
  entries: TEntry[];
  getValue: (entry: TEntry) => number;
  isQualified: (entry: TEntry) => boolean;
  toSpotlight: (
    entry: TEntry,
    mean: number,
    stdDev: number | null,
    kind: "qualifier" | "eliminated",
  ) => TSpotlight;
}): QualificationInsightsResult<TSpotlight> {
  const { entries, getValue, isQualified, toSpotlight } = options;

  const values = entries.map(getValue);
  const stats = computeNumericStats(values);
  const mean = stats.mean ?? 0;
  const stdDev = stats.stdDev;

  const aboveMeanEntries = entries.filter(
    (entry) => getValue(entry) > mean + MEAN_EPSILON,
  );
  const belowMeanEntries = entries.filter(
    (entry) => getValue(entry) < mean - MEAN_EPSILON,
  );
  const atMeanEntries = entries.filter(
    (entry) => Math.abs(getValue(entry) - mean) <= MEAN_EPSILON,
  );

  const aboveMean = buildQualificationCohort(aboveMeanEntries.map((entry) => ({
    qualified: isQualified(entry),
  })));
  const belowMean = buildQualificationCohort(belowMeanEntries.map((entry) => ({
    qualified: isQualified(entry),
  })));
  const atMean = buildQualificationCohort(atMeanEntries.map((entry) => ({
    qualified: isQualified(entry),
  })));

  const qualifiedValues = entries
    .filter(isQualified)
    .map(getValue);
  const eliminatedValues = entries
    .filter((entry) => !isQualified(entry))
    .map(getValue);

  const qualifiedStats = computeNumericStats(qualifiedValues);
  const eliminatedStats = computeNumericStats(eliminatedValues);

  const aboveRate = qualificationRate(aboveMean);
  const belowRate = qualificationRate(belowMean);
  const qualificationRateGap =
    aboveRate !== null && belowRate !== null ? belowRate - aboveRate : null;

  const hardestQualifierEntry = findExtremeBy(
    entries,
    isQualified,
    getValue,
    true,
  );
  const easiestEliminatedEntry = findExtremeBy(
    entries,
    (entry) => !isQualified(entry),
    getValue,
    false,
  );

  return {
    aboveMean,
    belowMean,
    atMean,
    stdDevValue: stdDev,
    medianQualifiedValue: qualifiedStats.median,
    medianEliminatedValue: eliminatedStats.median,
    qualificationRateGap,
    hardestQualifierSpotlight: hardestQualifierEntry
      ? toSpotlight(hardestQualifierEntry, mean, stdDev, "qualifier")
      : null,
    easiestEliminatedSpotlight: easiestEliminatedEntry
      ? toSpotlight(easiestEliminatedEntry, mean, stdDev, "eliminated")
      : null,
  };
}
