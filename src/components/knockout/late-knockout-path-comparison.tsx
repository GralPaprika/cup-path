"use client";

import type { LateKnockoutMatchSpotlight } from "@/lib/types";
import {
  HeadToHeadPointsChart,
  type HeadToHeadPathSeries,
} from "@/components/path/head-to-head-points-chart";
import {
  getTeamChartAvgColor,
  getTeamChartColor,
} from "@/lib/chart-colors";
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
): HeadToHeadPathSeries {
  const color = getTeamChartColor(side.team.id) ?? undefined;
  const avgColor = getTeamChartAvgColor(side.team.id) ?? undefined;

  return {
    team: side.team,
    teamPoints: side.teamFifaPoints,
    avgOpponentPoints: side.avgOpponentPoints,
    opponents: side.opponents,
    color,
    avgColor,
  };
}

export function LateKnockoutPathComparison({
  spotlight,
  chartTitle,
  chartCaption,
}: LateKnockoutPathComparisonProps) {
  const shared = useTranslations("home.knockoutStage");
  const teamNames = useTranslations("teams");
  const seriesA = toSeries(spotlight.team1Path);
  const seriesB = toSeries(spotlight.team2Path);

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
