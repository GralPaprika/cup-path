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
  /** Default bar fill for general FIFA-points observations. */
  bar: "var(--color-wc-sky)",
  /** Opponent bars on a selected team's path, dimmed by chart fill opacity. */
  opponentBar: "var(--color-wc-orange)",
  /** Standard deviation band around a mean (neutral lavender). */
  stdDevBand: "var(--color-wc-lavender)",
  /** Tournament weakest-group benchmark. */
  weakestGroup: "var(--color-wc-red)",
  /** Tournament strongest-group benchmark. */
  strongestGroup: "var(--color-wc-lime)",
  /** Tournament all-groups average benchmark. */
  tournamentAvg: "var(--color-wc-turquoise)",
  /** Simulated path opponent bars (focus team under scenario). */
  simulatedPath: "var(--color-wc-orange)",
  /** Third-party comparison path on Simulate (another team's actual path). */
  pathComparisonTeam: "var(--color-wc-green)",
} as const;

/**
 * Kit-inspired fills for late-round path histograms (SF/Final).
 * Falls back to null so callers can use the default A/B palette.
 */
const TEAM_CHART_COLORS: Record<string, string> = {
  ARG: "#74ACDF", // celeste
  ENG: "#F8FAFC", // white
  FRA: "#002654", // darker blue
  ESP: "var(--color-wc-red)",
};

export function getTeamChartColor(teamId: string): string | null {
  return TEAM_CHART_COLORS[teamId] ?? null;
}

/** Dashed avg-rival line: same hue, softer so it stays distinct from bars. */
export function getTeamChartAvgColor(teamId: string): string | null {
  const base = getTeamChartColor(teamId);
  if (!base) return null;
  return `color-mix(in srgb, ${base} 70%, transparent)`;
}
