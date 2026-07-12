import type { NumericStats } from "@/lib/types";

const EMPTY_STATS: NumericStats = {
  count: 0,
  mean: null,
  median: null,
  variance: null,
  stdDev: null,
  min: null,
  max: null,
};

export function computeMean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function computeNumericStats(values: number[]): NumericStats {
  const count = values.length;
  if (count === 0) return EMPTY_STATS;

  const mean = computeMean(values)!;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(count / 2);
  const median =
    count % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / count;
  const stdDev = Math.sqrt(variance);

  return {
    count,
    mean,
    median,
    variance,
    stdDev,
    min: sorted[0],
    max: sorted[count - 1],
  };
}

export type { NumericStats } from "@/lib/types";
