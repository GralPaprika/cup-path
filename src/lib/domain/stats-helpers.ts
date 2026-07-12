export const MEAN_EPSILON = 0.005;

export function isMeanPlusStdDevOutlier(
  value: number,
  mean: number | null,
  stdDev: number | null,
  direction: "high" | "low",
): boolean {
  if (mean === null || stdDev === null || stdDev <= 0) return false;
  return direction === "high"
    ? value >= mean + stdDev
    : value <= mean - stdDev;
}

export function findExtremeBy<T>(
  items: T[],
  filter: (item: T) => boolean,
  getValue: (item: T) => number,
  pickMax: boolean,
): T | null {
  const pool = items.filter(filter);
  if (pool.length === 0) return null;

  return pool.reduce((best, current) => {
    const bestValue = getValue(best);
    const currentValue = getValue(current);
    if (pickMax) {
      return currentValue > bestValue ? current : best;
    }
    return currentValue < bestValue ? current : best;
  });
}

export function findExtremeValue<T>(
  items: T[],
  getValue: (item: T) => number,
  pickMax: boolean,
): T | null {
  if (items.length === 0) return null;

  return items.reduce((best, current) => {
    const bestValue = getValue(best);
    const currentValue = getValue(current);
    if (pickMax) {
      return currentValue > bestValue ? current : best;
    }
    return currentValue < bestValue ? current : best;
  });
}
