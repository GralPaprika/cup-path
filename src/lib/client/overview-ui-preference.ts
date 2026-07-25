export const OVERVIEW_SCATTER_STORAGE_KEY = "cuppath:overview:scatter";

export const OVERVIEW_COLLAPSE_GROUP_EXPECTED_FINISHES_KEY =
  "cuppath:overview:collapse:group-expected-finishes";

export function overviewCollapseKnockoutKey(roundId: string): string {
  return `cuppath:overview:collapse:knockout:${roundId}`;
}

export const OVERVIEW_SORT_GROUP_WIN_LOSS_KEY =
  "cuppath:overview:sort:group-win-loss";

export const OVERVIEW_SORT_GROUP_DRAWS_KEY = "cuppath:overview:sort:group-draws";

export function overviewSortKnockoutKey(roundId: string): string {
  return `cuppath:overview:sort:knockout:${roundId}`;
}

export type OverviewScatterPrefs = {
  showWon: boolean;
  showLost: boolean;
  showFifaLabels: boolean;
};

export const DEFAULT_OVERVIEW_SCATTER_PREFS: OverviewScatterPrefs = {
  showWon: true,
  showLost: true,
  showFifaLabels: false,
};
