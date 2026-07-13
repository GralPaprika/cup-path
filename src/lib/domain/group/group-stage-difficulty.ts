import type {
  ComparisonEntry,
  GroupStageDifficultyEntry,
  GroupStageDifficultyInsights,
  GroupStageDifficultySpotlight,
  GroupStageDifficultyStrip,
  RankingEntry,
} from "@/lib/types";
import type { TournamentContext } from "@/lib/domain/tournament/tournament-context";
import { computeNumericStats } from "@/lib/domain/group/group-stats";
import { getAdvancingTeamIds } from "@/lib/domain/group/group-standings";
import { getGroupNames } from "@/lib/domain/path/path-builder";
import { buildQualificationInsights } from "@/lib/domain/core/qualification-insights";
import { isMeanPlusStdDevOutlier } from "@/lib/domain/core/stats-helpers";

function toSpotlight(
  entry: GroupStageDifficultyEntry,
  mean: number,
  stdDev: number | null,
  kind: "qualifier" | "eliminated",
): GroupStageDifficultySpotlight {
  const isSdOutlier = isMeanPlusStdDevOutlier(
    entry.avgOpponentPoints,
    mean,
    stdDev,
    kind === "qualifier" ? "high" : "low",
  );

  return {
    team: entry.team,
    groupLetter: entry.groupLetter,
    avgOpponentPoints: entry.avgOpponentPoints,
    deltaFromMean: entry.avgOpponentPoints - mean,
    isSdOutlier,
  };
}

function buildGroupStageDifficultyInsights(
  entries: GroupStageDifficultyEntry[],
): GroupStageDifficultyInsights {
  const insights = buildQualificationInsights({
    entries,
    getValue: (entry) => entry.avgOpponentPoints,
    isQualified: (entry) => entry.qualified,
    toSpotlight: (entry, insightMean, insightStdDev, kind) =>
      toSpotlight(entry, insightMean, insightStdDev, kind),
  });

  return {
    aboveMean: insights.aboveMean,
    belowMean: insights.belowMean,
    atMean: insights.atMean,
    stdDevAvgOpponentPoints: insights.stdDevValue,
    medianQualifiedAvg: insights.medianQualifiedValue,
    medianEliminatedAvg: insights.medianEliminatedValue,
    qualificationRateGap: insights.qualificationRateGap,
    hardestDrawSurvivor: insights.hardestQualifierSpotlight,
    easiestDrawCasualty: insights.easiestEliminatedSpotlight,
  };
}

export function buildGroupStageDifficultyStrip(
  ctx: TournamentContext,
  comparison: ComparisonEntry[],
  rankings: Map<string, RankingEntry>,
): GroupStageDifficultyStrip | null {
  const groupNames = getGroupNames();
  const groupMatches = ctx.matches.filter((match) => match.group);
  const advancing = getAdvancingTeamIds(ctx, groupMatches, groupNames);

  const entries: GroupStageDifficultyEntry[] = comparison
    .filter((entry) => entry.avgOpponentPoints !== null)
    .flatMap((entry) => {
      const teamFifaPoints = rankings.get(entry.team.id)?.points;
      if (teamFifaPoints === undefined) return [];

      return [
        {
          team: entry.team,
          groupLetter: entry.team.group,
          avgOpponentPoints: entry.avgOpponentPoints!,
          teamFifaPoints,
          qualified: advancing.has(entry.team.id),
        },
      ];
    })
    .sort((a, b) => b.avgOpponentPoints - a.avgOpponentPoints);

  if (entries.length === 0) return null;

  const stats = computeNumericStats(
    entries.map((entry) => entry.avgOpponentPoints),
  );

  return {
    entries,
    meanAvgOpponentPoints: stats.mean,
    stdDevAvgOpponentPoints: stats.stdDev,
    minAvgOpponentPoints: stats.min,
    maxAvgOpponentPoints: stats.max,
    insights: buildGroupStageDifficultyInsights(entries),
  };
}
