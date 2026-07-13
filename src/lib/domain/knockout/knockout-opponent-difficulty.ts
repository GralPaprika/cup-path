import type {
  KnockoutFixtureEntry,
  KnockoutOpponentDifficultyEntry,
  KnockoutOpponentDifficultyInsights,
  KnockoutOpponentDifficultySpotlight,
  KnockoutOpponentDifficultyStrip,
} from "@/lib/types";
import { computeNumericStats } from "@/lib/domain/group/group-stats";
import { buildQualificationInsights } from "@/lib/domain/core/qualification-insights";
import { isMeanPlusStdDevOutlier } from "@/lib/domain/core/stats-helpers";

function toSpotlight(
  entry: KnockoutOpponentDifficultyEntry,
  mean: number,
  stdDev: number | null,
  kind: "qualifier" | "eliminated",
): KnockoutOpponentDifficultySpotlight {
  const isSdOutlier = isMeanPlusStdDevOutlier(
    entry.opponentFifaPoints,
    mean,
    stdDev,
    kind === "qualifier" ? "high" : "low",
  );

  return {
    team: entry.team,
    opponent: entry.opponent,
    opponentFifaPoints: entry.opponentFifaPoints,
    deltaFromMean: entry.opponentFifaPoints - mean,
    isSdOutlier,
    matchNum: entry.matchNum,
  };
}

function buildKnockoutOpponentDifficultyInsights(
  entries: KnockoutOpponentDifficultyEntry[],
  mean: number,
  stdDev: number | null,
): KnockoutOpponentDifficultyInsights {
  const insights = buildQualificationInsights({
    entries,
    getValue: (entry) => entry.opponentFifaPoints,
    isQualified: (entry) => entry.qualified,
    toSpotlight: (entry, insightMean, insightStdDev, kind) =>
      toSpotlight(entry, insightMean, insightStdDev, kind),
  });

  return {
    aboveMean: insights.aboveMean,
    belowMean: insights.belowMean,
    atMean: insights.atMean,
    stdDevOpponentPoints: insights.stdDevValue,
    medianQualifiedOpponent: insights.medianQualifiedValue,
    medianEliminatedOpponent: insights.medianEliminatedValue,
    qualificationRateGap: insights.qualificationRateGap,
    hardestOpponentQualifier: insights.hardestQualifierSpotlight,
    easiestOpponentEliminated: insights.easiestEliminatedSpotlight,
  };
}

export function buildKnockoutOpponentDifficultyStrip(
  fixtures: KnockoutFixtureEntry[],
): KnockoutOpponentDifficultyStrip | null {
  const entries: KnockoutOpponentDifficultyEntry[] = [];

  for (const fixture of fixtures) {
    if (fixture.team1FifaPoints === null || fixture.team2FifaPoints === null) {
      continue;
    }

    const team1Qualified = fixture.winnerTeamId === fixture.team1.id;

    entries.push({
      team: fixture.team1,
      opponent: fixture.team2,
      opponentFifaPoints: fixture.team2FifaPoints,
      teamFifaPoints: fixture.team1FifaPoints,
      qualified: team1Qualified,
      matchNum: fixture.matchNum,
    });
    entries.push({
      team: fixture.team2,
      opponent: fixture.team1,
      opponentFifaPoints: fixture.team1FifaPoints,
      teamFifaPoints: fixture.team2FifaPoints,
      qualified: !team1Qualified,
      matchNum: fixture.matchNum,
    });
  }

  if (entries.length === 0) return null;

  entries.sort((a, b) => b.opponentFifaPoints - a.opponentFifaPoints);

  const stats = computeNumericStats(
    entries.map((entry) => entry.opponentFifaPoints),
  );
  const mean = stats.mean ?? 0;

  return {
    entries,
    meanOpponentPoints: stats.mean,
    stdDevOpponentPoints: stats.stdDev,
    minOpponentPoints: stats.min,
    maxOpponentPoints: stats.max,
    insights: buildKnockoutOpponentDifficultyInsights(
      entries,
      mean,
      stats.stdDev,
    ),
  };
}
