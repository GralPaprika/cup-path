import {
  TEAM_KIT_COLORS,
  getTeamKitColor,
  type KitVariant,
  type TeamKitColors,
} from "@/lib/data/team-kit-colors";

export { TEAM_KIT_COLORS, getTeamKitColor };
export type { KitVariant, TeamKitColors };

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

/** Site purple hex (matches --color-wc-purple) for kit clash chrome. */
export const KIT_SITE_PURPLE = "#7b2cbf";

/** Neutral clash fallbacks / accent tokens. */
export const KIT_FALLBACK_WHITE = "#F8FAFC";
export const KIT_FALLBACK_BLACK = "#111111";

export type SeriesKitStyle = {
  /** Bar fill. */
  fill: string;
  /** Bar stroke only (purple or opposite-kit for dark fills). */
  outline: string | null;
  /** Legends, solid team-points line, and dotted avg lines. */
  accent: string;
};

export type ColorFamily =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "white"
  | "black";

function parseHexRgb(color: string): { r: number; g: number; b: number } | null {
  const hex = color.trim();
  const short = /^#([0-9a-fA-F]{3})$/.exec(hex);
  if (short) {
    const [r, g, b] = short[1].split("").map((c) => parseInt(c + c, 16));
    return { r, g, b };
  }
  const full = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!full) return null;
  const n = parseInt(full[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function fillLightness(color: string): number | null {
  const rgb = parseHexRgb(color);
  if (!rgb) return null;
  return (
    (Math.max(rgb.r, rgb.g, rgb.b) + Math.min(rgb.r, rgb.g, rgb.b)) / 2 / 255
  );
}

/** Coarse hue family for clash detection (Spain red ≈ Norway red). */
export function colorFamily(color: string): ColorFamily {
  const rgb = parseHexRgb(color);
  if (!rgb) return "blue";

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;
  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  if (lightness < 0.18) return "black";
  if (lightness > 0.88) return "white";
  if (lightness > 0.82 && saturation < 0.35) return "white";
  if (saturation < 0.12) {
    return lightness < 0.45 ? "black" : "white";
  }

  let hue = 0;
  if (delta !== 0) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }

  if (hue < 20 || hue >= 340) return "red";
  if (hue < 45) return "orange";
  if (hue < 70) return "yellow";
  if (hue < 165) return "green";
  if (hue < 255) return "blue";
  if (hue < 290) return "purple";
  if (hue < 340) return "pink";
  return "red";
}

/** @deprecated Prefer getTeamKitColor(teamId, "home"). */
export function getTeamChartColor(teamId: string): string | null {
  return getTeamKitColor(teamId, "home");
}

/** Dashed avg-rival line: same hue as accent, softer vs bars. */
export function softAvgColor(base: string): string {
  return `color-mix(in srgb, ${base} 70%, transparent)`;
}

/** @deprecated Prefer softAvgColor on a resolved accent. */
export function getTeamChartAvgColor(teamId: string): string | null {
  const base = getTeamKitColor(teamId, "home");
  if (!base) return null;
  return softAvgColor(base);
}

function familiesClash(a: string, b: string): boolean {
  return colorFamily(a) === colorFamily(b);
}

function clashesWithAny(color: string, used: string[]): boolean {
  return used.some((u) => familiesClash(color, u));
}

function pickNonClashingFill(
  candidates: Array<string | null | undefined>,
  usedFills: string[],
  ultimateFallback: string,
): string {
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (!clashesWithAny(candidate, usedFills)) return candidate;
  }
  return ultimateFallback;
}

/** Opposite kit when fill is black/dark-blue (bar outline only, non-purple cases). */
export function needsDarkKitOutline(color: string): boolean {
  const family = colorFamily(color);
  if (family === "black") return true;
  if (family !== "blue") return false;
  const lightness = fillLightness(color);
  return lightness !== null && lightness < 0.32;
}

function oppositeKitOutline(teamId: string, fill: string): string | null {
  if (!needsDarkKitOutline(fill)) return null;

  const home = getTeamKitColor(teamId, "home");
  const away = getTeamKitColor(teamId, "away");
  const fillKey = fill.toLowerCase();

  let opposite: string | null = null;
  if (home && fillKey === home.toLowerCase()) opposite = away;
  else if (away && fillKey === away.toLowerCase()) opposite = home;
  else if (home && !needsDarkKitOutline(home)) opposite = home;
  else if (away && !needsDarkKitOutline(away)) opposite = away;
  else opposite = home ?? away;

  if (!opposite) return KIT_FALLBACK_WHITE;
  if (needsDarkKitOutline(opposite) || familiesClash(opposite, fill)) {
    // Black fills still prefer a light accent outline over nothing.
    if (colorFamily(fill) === "black") return KIT_FALLBACK_WHITE;
    return KIT_FALLBACK_WHITE;
  }
  return opposite;
}

/** Base style before white↔black pair adjustments. */
export function styleFromFill(teamId: string, fill: string): SeriesKitStyle {
  const family = colorFamily(fill);
  if (family === "black") {
    return {
      fill,
      outline: oppositeKitOutline(teamId, fill),
      accent: KIT_FALLBACK_WHITE,
    };
  }
  if (family === "white") {
    return {
      fill,
      outline: null,
      accent: fill,
    };
  }
  return {
    fill,
    outline: oppositeKitOutline(teamId, fill),
    accent: fill,
  };
}

function styleOccupies(style: SeriesKitStyle): string[] {
  return [style.fill, style.accent];
}

function styleCollides(style: SeriesKitStyle, occupied: string[]): boolean {
  return (
    clashesWithAny(style.fill, occupied) ||
    clashesWithAny(style.accent, occupied)
  );
}

function fillCollides(fill: string, occupied: string[]): boolean {
  return clashesWithAny(fill, occupied);
}

/** When white and black fills share a chart: invert white→black; black gets purple chrome. */
export function applyWhiteBlackPair(
  styles: SeriesKitStyle[],
): SeriesKitStyle[] {
  const hasWhite = styles.some((s) => colorFamily(s.fill) === "white");
  const hasBlack = styles.some((s) => colorFamily(s.fill) === "black");
  if (!hasWhite || !hasBlack) return styles;

  return styles.map((style) => {
    const family = colorFamily(style.fill);
    if (family === "white") {
      return {
        fill: KIT_FALLBACK_BLACK,
        outline: null,
        accent: KIT_FALLBACK_BLACK,
      };
    }
    if (family === "black") {
      return {
        fill: style.fill,
        outline: KIT_SITE_PURPLE,
        accent: KIT_SITE_PURPLE,
      };
    }
    return style;
  });
}

function allPurpleStyle(): SeriesKitStyle {
  return {
    fill: KIT_SITE_PURPLE,
    outline: KIT_SITE_PURPLE,
    accent: KIT_SITE_PURPLE,
  };
}

function homePurpleChrome(homeFill: string): SeriesKitStyle {
  return {
    fill: homeFill,
    outline: KIT_SITE_PURPLE,
    accent: KIT_SITE_PURPLE,
  };
}

function resolveComparisonStyle(
  teamId: string,
  occupied: string[],
): SeriesKitStyle {
  const home = getTeamKitColor(teamId, "home");
  const away = getTeamKitColor(teamId, "away");

  if (home) {
    const homeStyle = styleFromFill(teamId, home);
    if (!styleCollides(homeStyle, occupied)) return homeStyle;
  }
  if (away) {
    const awayStyle = styleFromFill(teamId, away);
    if (!styleCollides(awayStyle, occupied)) return awayStyle;
  }

  const homeFillBlocked = !home || fillCollides(home, occupied);
  const awayFillBlocked = !away || fillCollides(away, occupied);

  if (homeFillBlocked && awayFillBlocked) {
    return allPurpleStyle();
  }

  if (home && !homeFillBlocked) {
    return homePurpleChrome(home);
  }

  return allPurpleStyle();
}

export type HeadToHeadKitColors = {
  colorA: string;
  accentA: string;
  avgColorA: string;
  outlineA: string | null;
  colorB: string;
  accentB: string;
  avgColorB: string;
  outlineB: string | null;
};

/** Compare / SF-Final: Team A home; Team B home → away → white/black; then accent rules. */
export function resolveHeadToHeadKitColors(
  teamAId: string,
  teamBId: string,
): HeadToHeadKitColors {
  const fillA =
    getTeamKitColor(teamAId, "home") ?? CHART_COLORS.selectedTeam;
  const fillB = pickNonClashingFill(
    [
      getTeamKitColor(teamBId, "home"),
      getTeamKitColor(teamBId, "away"),
      KIT_FALLBACK_WHITE,
      KIT_FALLBACK_BLACK,
    ],
    [fillA],
    KIT_FALLBACK_BLACK,
  );

  const [styleA, styleB] = applyWhiteBlackPair([
    styleFromFill(teamAId, fillA),
    styleFromFill(teamBId, fillB),
  ]);

  return {
    colorA: styleA.fill,
    accentA: styleA.accent,
    avgColorA: softAvgColor(styleA.accent),
    outlineA: styleA.outline,
    colorB: styleB.fill,
    accentB: styleB.accent,
    avgColorB: softAvgColor(styleB.accent),
    outlineB: styleB.outline,
  };
}

export type SimulateKitColors = {
  actual: SeriesKitStyle;
  actualAvg: string;
  simulated: SeriesKitStyle;
  simulatedAvg: string;
  teamPointsLine: string;
  comparison?: SeriesKitStyle;
  comparisonAvg?: string;
};

/** Simulate: actual=home, simulated=away; comparison resolves against fills+accents. */
export function resolveSimulateKitColors(
  focusTeamId: string,
  comparisonTeamId?: string | null,
): SimulateKitColors {
  const actualFill =
    getTeamKitColor(focusTeamId, "home") ?? CHART_COLORS.selectedTeam;
  const simulatedFill = pickNonClashingFill(
    [
      getTeamKitColor(focusTeamId, "away"),
      KIT_FALLBACK_WHITE,
      KIT_FALLBACK_BLACK,
      CHART_COLORS.simulatedPath,
    ],
    [actualFill],
    KIT_FALLBACK_BLACK,
  );

  let [actual, simulated] = applyWhiteBlackPair([
    styleFromFill(focusTeamId, actualFill),
    styleFromFill(focusTeamId, simulatedFill),
  ]);

  const result: SimulateKitColors = {
    actual,
    actualAvg: softAvgColor(actual.accent),
    simulated,
    simulatedAvg: softAvgColor(simulated.accent),
    teamPointsLine: actual.accent,
  };

  if (comparisonTeamId) {
    const occupied = [
      ...styleOccupies(actual),
      ...styleOccupies(simulated),
    ];
    let comparison = resolveComparisonStyle(comparisonTeamId, occupied);
    [actual, simulated, comparison] = applyWhiteBlackPair([
      actual,
      simulated,
      comparison,
    ]);
    result.actual = actual;
    result.actualAvg = softAvgColor(actual.accent);
    result.simulated = simulated;
    result.simulatedAvg = softAvgColor(simulated.accent);
    result.teamPointsLine = actual.accent;
    result.comparison = comparison;
    result.comparisonAvg = softAvgColor(comparison.accent);
  }

  return result;
}

/** Near-white / very light fills need a stroke so bars stay visible. */
export function needsChartStroke(color: string): boolean {
  const family = colorFamily(color);
  if (family === "white") return true;
  const lightness = fillLightness(color);
  return lightness !== null && lightness > 0.78;
}

/** @deprecated Prefer styleFromFill / resolveKit rules. */
export function resolveKitOutline(teamId: string, fill: string): string | null {
  return styleFromFill(teamId, fill).outline;
}

/** Stroke used on light fills (white/cream) against dark chart backgrounds. */
export const LIGHT_FILL_STROKE = "rgba(15, 23, 42, 0.45)";

/** Resolved stroke for a chart fill: explicit outline, light guard, or none. */
export function chartStrokeForFill(
  fill: string,
  outline: string | null | undefined,
): { stroke: string; strokeWidth: number } | null {
  if (outline) return { stroke: outline, strokeWidth: 0.5 };
  if (needsChartStroke(fill)) {
    return { stroke: LIGHT_FILL_STROKE, strokeWidth: 0.75 };
  }
  return null;
}
