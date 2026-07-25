import { teamMatchesQuery } from "@/lib/i18n/team-display-name";

export interface ScatterFilterablePoint {
  won: boolean;
  teamId: string;
  displayName: string;
}

export function filterOpponentDifficultyScatterPoints<
  T extends ScatterFilterablePoint,
>(
  points: T[],
  options: { showWon: boolean; showLost: boolean; query: string },
): T[] {
  const { showWon, showLost, query } = options;

  return points.filter((point) => {
    if (point.won && !showWon) return false;
    if (!point.won && !showLost) return false;

    return teamMatchesQuery(
      { id: point.teamId, displayName: point.displayName },
      point.displayName,
      query,
    );
  });
}
