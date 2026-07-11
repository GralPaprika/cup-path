/** Shared chart color semantics across Analysis, Groups, and Compare. */
export const CHART_COLORS = {
  /** Selected or primary focal team (Team A in head-to-head). */
  selectedTeam: "var(--color-wc-sky)",
  /** Group/path mean or primary average reference. */
  mean: "var(--color-wc-orange)",
  /** Comparison or secondary team (Team B in head-to-head). */
  comparisonTeam: "var(--color-wc-purple)",
  /** Comparison team average rivals reference. */
  comparisonAvg: "var(--color-wc-orchid)",
  /** Default bar fill for opponent observations (selected team's path — same as Compare Team A). */
  bar: "var(--color-wc-sky)",
  /** Standard deviation band around a mean (neutral lavender). */
  stdDevBand: "var(--color-wc-lavender)",
  /** Tournament weakest-group benchmark. */
  weakestGroup: "var(--color-wc-red)",
  /** Tournament strongest-group benchmark. */
  strongestGroup: "var(--color-wc-lime)",
  /** Tournament all-groups average benchmark. */
  tournamentAvg: "var(--color-wc-turquoise)",
} as const;
