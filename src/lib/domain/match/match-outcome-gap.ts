import type {
  GroupMatchResult,
  MatchOutcomeGapDataset,
  MatchOutcomeGapEntry,
  OpenFootballMatch,
  PathStage,
  RankingEntry,
} from "@/lib/types";
import type { TournamentContext } from "@/lib/domain/tournament/tournament-context";
import { isKnockoutRound, isMatchPlayed } from "@/lib/data/worldcup-loader";
import { isMeanPlusStdDevOutlier } from "@/lib/domain/core/stats-helpers";
import { computeNumericStats } from "@/lib/domain/group/group-stats";
import { buildMatchScoreBreakdown } from "@/lib/domain/match/match-score";
import { getMatchStage } from "@/lib/domain/match/match-stages";

type MatchSideOutcome = "home_win" | "away_win" | "draw";

function groupLetterFromName(groupName: string | undefined): string | null {
  if (!groupName) return null;
  return groupName.replace("Group ", "").toUpperCase();
}

function getGroupAnalyticsOutcome(
  homeGoals: number,
  awayGoals: number,
): MatchSideOutcome {
  if (homeGoals === awayGoals) return "draw";
  return homeGoals > awayGoals ? "home_win" : "away_win";
}

function getKnockoutAnalyticsOutcome(
  homeGoals: number,
  awayGoals: number,
  match: OpenFootballMatch,
): MatchSideOutcome {
  if (homeGoals !== awayGoals) {
    return homeGoals > awayGoals ? "home_win" : "away_win";
  }

  if (match.score?.et) {
    const [etHome, etAway] = match.score.et;
    if (etHome !== etAway) {
      return etHome > etAway ? "home_win" : "away_win";
    }
  }

  return "draw";
}

function getAnalyticsOutcome(
  match: OpenFootballMatch,
  homeGoals: number,
  awayGoals: number,
): MatchSideOutcome {
  if (isKnockoutRound(match.round)) {
    return getKnockoutAnalyticsOutcome(homeGoals, awayGoals, match);
  }
  return getGroupAnalyticsOutcome(homeGoals, awayGoals);
}

function resolveFavoriteTeamId(
  homeId: string,
  awayId: string,
  homePoints: number | null,
  awayPoints: number | null,
): string | null {
  if (homePoints === null || awayPoints === null) return null;
  if (homePoints > awayPoints) return homeId;
  if (awayPoints > homePoints) return awayId;
  return null;
}

function toFavoriteResult(
  outcome: MatchSideOutcome,
  favoriteTeamId: string,
  homeId: string,
): GroupMatchResult {
  if (outcome === "draw") return "D";

  const favoriteWon =
    (outcome === "home_win" && favoriteTeamId === homeId) ||
    (outcome === "away_win" && favoriteTeamId !== homeId);
  return favoriteWon ? "W" : "L";
}

function formatScoreLabel(match: OpenFootballMatch): string {
  const breakdown = buildMatchScoreBreakdown(match.score);
  if (!breakdown) return "";

  let label = breakdown.ft;
  if (breakdown.pens) {
    label += ` (${breakdown.pens} pens)`;
  } else if (breakdown.et) {
    label += ` (${breakdown.et} aet)`;
  }
  return label;
}

function buildMatchEntry(
  ctx: TournamentContext,
  match: OpenFootballMatch,
  rankings: Map<string, RankingEntry>,
): MatchOutcomeGapEntry | null {
  if (!isMatchPlayed(match) || !match.score?.ft) return null;

  const home = ctx.resolveTeam(match.team1);
  const away = ctx.resolveTeam(match.team2);
  if (!home || !away) return null;

  const stage = getMatchStage(match.round);
  if (!stage) return null;

  const homeEntry = rankings.get(home.id);
  const awayEntry = rankings.get(away.id);
  const homePoints = homeEntry?.points ?? null;
  const awayPoints = awayEntry?.points ?? null;

  const [homeGoals, awayGoals] = match.score.ft;
  const outcome = getAnalyticsOutcome(match, homeGoals, awayGoals);

  const isEqualRating =
    homePoints !== null &&
    awayPoints !== null &&
    homePoints === awayPoints;

  const favoriteTeamId = resolveFavoriteTeamId(
    home.id,
    away.id,
    homePoints,
    awayPoints,
  );

  if (outcome !== "draw" && !favoriteTeamId) return null;

  const favoriteResult =
    outcome === "draw"
      ? "D"
      : toFavoriteResult(outcome, favoriteTeamId!, home.id);
  const gapPoints = isEqualRating
    ? 0
    : homePoints !== null && awayPoints !== null
      ? Math.abs(homePoints - awayPoints)
      : 0;

  return {
    id: `${match.num ?? match.round}-${home.id}-${away.id}`,
    matchNum: match.num ?? null,
    stage,
    round: match.round,
    groupLetter: groupLetterFromName(match.group),
    team1: home,
    team2: away,
    team1FifaPoints: homePoints,
    team2FifaPoints: awayPoints,
    gapPoints,
    favoriteTeamId,
    favoriteResult,
    isEqualRating,
    scoreLabel: formatScoreLabel(match),
    isOutlier: false,
    outlierKind: null,
  };
}

function annotateOutliers(
  entries: MatchOutcomeGapEntry[],
): MatchOutcomeGapEntry[] {
  const byStage = new Map<PathStage, MatchOutcomeGapEntry[]>();
  for (const entry of entries) {
    const list = byStage.get(entry.stage) ?? [];
    list.push(entry);
    byStage.set(entry.stage, list);
  }

  const stageStats = new Map<
    PathStage,
    { mean: number | null; stdDev: number | null }
  >();
  for (const [stage, stageEntries] of byStage) {
    const stats = computeNumericStats(
      stageEntries.map((entry) => entry.gapPoints),
    );
    stageStats.set(stage, { mean: stats.mean, stdDev: stats.stdDev });
  }

  return entries.map((entry) => {
    const isSurpriseResult =
      (entry.favoriteResult === "D" || entry.favoriteResult === "L") &&
      entry.gapPoints > 0;
    if (!isSurpriseResult) return entry;

    const stats = stageStats.get(entry.stage);
    if (!stats) return entry;

    const isOutlier = isMeanPlusStdDevOutlier(
      entry.gapPoints,
      stats.mean,
      stats.stdDev,
      "high",
    );
    if (!isOutlier) return entry;

    return {
      ...entry,
      isOutlier: true,
      outlierKind: entry.favoriteResult === "D" ? ("draw" as const) : ("upset" as const),
    };
  });
}

export function buildMatchOutcomeGapDataset(
  ctx: TournamentContext,
  rankings: Map<string, RankingEntry>,
): MatchOutcomeGapDataset {
  const rawEntries = ctx.matches
    .map((match) => buildMatchEntry(ctx, match, rankings))
    .filter((entry): entry is MatchOutcomeGapEntry => entry !== null);

  const drawGaps = rawEntries
    .filter((entry) => entry.favoriteResult === "D" && entry.gapPoints > 0)
    .map((entry) => entry.gapPoints);
  const upsetGaps = rawEntries
    .filter((entry) => entry.favoriteResult === "L" && entry.gapPoints > 0)
    .map((entry) => entry.gapPoints);

  const drawStats = computeNumericStats(drawGaps);
  const upsetStats = computeNumericStats(upsetGaps);
  const matches = annotateOutliers(rawEntries);

  return {
    matches,
    drawGapMean: drawStats.mean,
    drawGapStdDev: drawStats.stdDev,
    upsetGapMean: upsetStats.mean,
    upsetGapStdDev: upsetStats.stdDev,
  };
}

export const MATCH_OUTCOME_GAP_BINS = [
  { id: "0-100", min: 0, max: 100 },
  { id: "101-250", min: 101, max: 250 },
  { id: "251+", min: 251, max: Number.POSITIVE_INFINITY },
] as const;

export type MatchOutcomeGapBinId = (typeof MATCH_OUTCOME_GAP_BINS)[number]["id"];

export function gapBinForPoints(gapPoints: number): MatchOutcomeGapBinId {
  for (let i = 0; i < MATCH_OUTCOME_GAP_BINS.length; i++) {
    const bin = MATCH_OUTCOME_GAP_BINS[i]!;
    const nextMin = MATCH_OUTCOME_GAP_BINS[i + 1]?.min;
    if (nextMin !== undefined) {
      if (gapPoints >= bin.min && gapPoints < nextMin) {
        return bin.id;
      }
    } else if (gapPoints >= bin.min) {
      return bin.id;
    }
  }
  return "251+";
}
