"use client";

import { useTranslations } from "next-intl";
import type { NumericStats, Team } from "@/lib/types";
import type { OpponentPointsObservation } from "@/lib/domain/path/path-opponent-stats";
import { FifaPointsBarChart } from "@/components/path/fifa-points-bar-chart";
import { formatFifaPoints } from "@/lib/format";

interface OpponentPointsChartProps {
  observations: OpponentPointsObservation[];
  stats: NumericStats;
  selectedTeam: Pick<Team, "id" | "flagUrl" | "displayName">;
  selectedTeamPoints: number | null;
}

export function OpponentPointsChart({
  observations,
  stats,
  selectedTeam,
  selectedTeamPoints,
}: OpponentPointsChartProps) {
  const t = useTranslations("teamAnalysis.advanced");

  if (stats.mean === null || stats.stdDev === null) {
    return null;
  }

  const lowerDeviation = Math.max(0, stats.mean - stats.stdDev);
  const upperDeviation = stats.mean + stats.stdDev;

  return (
    <FifaPointsBarChart
      observations={observations}
      stats={stats}
      title={t("pointsChartTitle")}
      standardDeviationBandLabel={t("standardDeviationBand")}
      meanLegendLabel={t("meanValue", {
        value: formatFifaPoints(stats.mean),
      })}
      hintLabel={t("pointsChartHint", {
        lower: formatFifaPoints(lowerDeviation),
        upper: formatFifaPoints(upperDeviation),
      })}
      ariaLabel={t("pointsChartAria", {
        mean: formatFifaPoints(stats.mean),
        deviation: formatFifaPoints(stats.stdDev),
      })}
      selectedTeam={selectedTeam}
      selectedTeamPoints={selectedTeamPoints}
      selectedTeamLegend={
        selectedTeamPoints !== null
          ? `${selectedTeam.id} ${formatFifaPoints(selectedTeamPoints)}`
          : null
      }
    />
  );
}
