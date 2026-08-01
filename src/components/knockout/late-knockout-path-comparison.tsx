"use client";

import type { LateKnockoutMatchSpotlight } from "@/lib/types";
import {
  HeadToHeadPointsChart,
  type HeadToHeadPathSeries,
} from "@/components/path/head-to-head-points-chart";
import { resolveHeadToHeadKitColors } from "@/lib/chart-colors";
import { formatFifaPoints } from "@/lib/format";
import { getTeamDisplayName } from "@/lib/i18n/team-display-name";
import { useTranslations } from "next-intl";

interface LateKnockoutPathComparisonProps {
  spotlight: LateKnockoutMatchSpotlight;
  chartTitle: string;
  chartCaption: string;
}

function toSeries(
  side: LateKnockoutMatchSpotlight["team1Path"],
  colors: {
    color: string;
    avgColor: string;
    accent?: string;
    outline?: string | null;
  },
): HeadToHeadPathSeries {
  return {
    team: side.team,
    teamPoints: side.teamFifaPoints,
    avgOpponentPoints: side.avgOpponentPoints,
    opponents: side.opponents,
    color: colors.color,
    avgColor: colors.avgColor,
    accent: colors.accent,
    outline: colors.outline,
  };
}

export function LateKnockoutPathComparison({
  spotlight,
  chartTitle,
  chartCaption,
}: LateKnockoutPathComparisonProps) {
  const shared = useTranslations("home.knockoutStage");
  const teamNames = useTranslations("teams");
  const kit = resolveHeadToHeadKitColors(
    spotlight.team1Path.team.id,
    spotlight.team2Path.team.id,
  );
  const seriesA = toSeries(spotlight.team1Path, {
    color: kit.colorA,
    avgColor: kit.avgColorA,
    accent: kit.accentA,
    outline: kit.outlineA,
  });
  const seriesB = toSeries(spotlight.team2Path, {
    color: kit.colorB,
    avgColor: kit.avgColorB,
    accent: kit.accentB,
    outline: kit.outlineB,
  });

  if (seriesA.opponents.length === 0 && seriesB.opponents.length === 0) {
    return null;
  }

  const avgA = spotlight.team1Path.avgOpponentPoints;
  const avgB = spotlight.team2Path.avgOpponentPoints;
  const harderTeam =
    avgA !== null && avgB !== null && avgA !== avgB
      ? avgA > avgB
        ? spotlight.team1Path.team
        : spotlight.team2Path.team
      : null;
  const pathGap =
    avgA !== null && avgB !== null ? Math.abs(avgA - avgB) : null;

  return (
    <div className="space-y-3">
      <HeadToHeadPointsChart
        seriesA={seriesA}
        seriesB={seriesB}
        title={chartTitle}
        teamPointsLegend={shared("latePathTeamPointsLegend")}
        avgOpponentLegend={shared("latePathAvgOpponentLegend")}
        opponentPathLegend={shared("latePathOpponentLegend")}
        matchLabel={shared("latePathMatchLabel")}
        ariaLabel={shared("latePathChartAria", {
          teamA: seriesA.team.id,
          teamB: seriesB.team.id,
        })}
      />
      <p className="text-sm text-muted-foreground">{chartCaption}</p>
      {harderTeam && pathGap !== null && pathGap > 0 ? (
        <p className="text-sm text-muted-foreground">
          {shared("lateHarderPathSummary", {
            team: getTeamDisplayName(teamNames, harderTeam),
            gap: formatFifaPoints(pathGap),
          })}
        </p>
      ) : null}
    </div>
  );
}
