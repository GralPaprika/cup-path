export interface NumericStats {
  count: number;
  mean: number | null;
  median: number | null;
  variance: number | null;
  stdDev: number | null;
  min: number | null;
  max: number | null;
}

const EMPTY_STATS: NumericStats = {
  count: 0,
  mean: null,
  median: null,
  variance: null,
  stdDev: null,
  min: null,
  max: null,
};

export function computeNumericStats(values: number[]): NumericStats {
  const count = values.length;
  if (count === 0) return EMPTY_STATS;

  const mean = values.reduce((sum, value) => sum + value, 0) / count;
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
