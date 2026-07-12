export function formatGoalDifference(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

export function formatStandingValue(
  played: number,
  value: number | string,
): string {
  return played > 0 ? String(value) : "—";
}
