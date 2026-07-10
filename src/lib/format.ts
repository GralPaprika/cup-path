export function formatFifaPoints(value: number | null, suffix = ""): string {
  if (value === null) return "—";
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted}${suffix}`;
}

export function formatWholeNumber(value: number | null, suffix = ""): string {
  if (value === null) return "—";
  return `${Math.round(value).toLocaleString()}${suffix}`;
}

export function formatStatValue(
  value: number | null,
  decimals = 2,
): string {
  if (value === null) return "—";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
