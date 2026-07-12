"use client";

import type { GroupComparisonCard, GroupPointsBenchmarks } from "@/lib/types";
import { useTranslations } from "next-intl";
import {
  FifaPointsBarChart,
  type FifaPointsObservation,
  type FifaPointsReferenceLine,
} from "@/components/path/fifa-points-bar-chart";
import { formatFifaPoints } from "@/lib/format";
import { CHART_COLORS } from "@/lib/chart-colors";

interface GroupFifaPointsChartProps {
  group: GroupComparisonCard;
  pointsBenchmarks: GroupPointsBenchmarks | null;
  selectedTeamId?: string;
}

function buildGroupBenchmarkLines(
  benchmarks: GroupPointsBenchmarks,
  t: ReturnType<typeof useTranslations<"groups">>,
): FifaPointsReferenceLine[] {
  return [
    {
      value: benchmarks.weakest.avgFifaPoints,
      stroke: CHART_COLORS.weakestGroup,
      legendLabel: t("weakestGroupLine", {
        group: benchmarks.weakest.groupLetter,
        value: formatFifaPoints(benchmarks.weakest.avgFifaPoints),
      }),
      legendClassName: "text-wc-red",
    },
    {
      value: benchmarks.strongest.avgFifaPoints,
      stroke: CHART_COLORS.strongestGroup,
      legendLabel: t("strongestGroupLine", {
        group: benchmarks.strongest.groupLetter,
        value: formatFifaPoints(benchmarks.strongest.avgFifaPoints),
      }),
      legendClassName: "text-wc-lime",
    },
    {
      value: benchmarks.tournamentAverage,
      stroke: CHART_COLORS.tournamentAvg,
      strokeDasharray: "7 5",
      legendLabel: t("averageGroupLine", {
        value: formatFifaPoints(benchmarks.tournamentAverage),
      }),
      legendClassName: "text-wc-turquoise",
    },
  ];
}

export function GroupFifaPointsChart({
  group,
  pointsBenchmarks,
  selectedTeamId,
}: GroupFifaPointsChartProps) {
  const t = useTranslations("groups");

  const observations: FifaPointsObservation[] = group.teams.flatMap((entry) =>
    entry.fifaPoints === null
      ? []
      : [
          {
            teamId: entry.team.id,
            displayName: entry.team.displayName,
            flagUrl: entry.team.flagUrl,
            points: entry.fifaPoints,
          },
        ],
  );

  const selectedEntry = selectedTeamId
    ? group.teams.find((entry) => entry.team.id === selectedTeamId)
    : undefined;

  const stats = group.fifaPointsStats;
  const referenceLines = pointsBenchmarks
    ? buildGroupBenchmarkLines(pointsBenchmarks, t)
    : [];

  if (stats.mean === null || stats.stdDev === null) {
    return null;
  }

  const lowerDeviation = Math.max(0, stats.mean - stats.stdDev);
  const upperDeviation = stats.mean + stats.stdDev;

  return (
    <FifaPointsBarChart
      observations={observations}
      stats={stats}
      title={t("fifaPointsChartTitle")}
      standardDeviationBandLabel={t("standardDeviationBand")}
      meanLegendLabel={t("meanValue", {
        value: formatFifaPoints(stats.mean),
      })}
      hintLabel={t("fifaPointsChartHint", {
        lower: formatFifaPoints(lowerDeviation),
        upper: formatFifaPoints(upperDeviation),
      })}
      ariaLabel={t("fifaPointsChartAria", {
        group: group.groupLetter,
        mean: formatFifaPoints(stats.mean),
        deviation: formatFifaPoints(stats.stdDev),
      })}
      referenceLines={referenceLines}
      selectedTeam={selectedEntry?.team ?? null}
      selectedTeamPoints={selectedEntry?.fifaPoints ?? null}
      selectedTeamLegend={
        selectedEntry?.fifaPoints != null
          ? `${selectedEntry.team.id} ${formatFifaPoints(selectedEntry.fifaPoints)}`
          : null
      }
      className=""
    />
  );
}
