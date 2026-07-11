"use client";

import type { GroupComparisonCard } from "@/lib/types";
import { useTranslations } from "next-intl";
import {
  FifaPointsBarChart,
  type FifaPointsObservation,
  type FifaPointsReferenceLine,
} from "@/components/fifa-points-bar-chart";
import { formatFifaPoints } from "@/lib/format";

interface GroupFifaPointsChartProps {
  group: GroupComparisonCard;
  allGroups: GroupComparisonCard[];
  selectedTeamId?: string;
}

function buildGroupBenchmarkLines(
  allGroups: GroupComparisonCard[],
  t: ReturnType<typeof useTranslations<"groups">>,
): FifaPointsReferenceLine[] {
  const groupsWithAverage = allGroups.filter(
    (entry) => entry.avgFifaPoints !== null,
  );
  if (groupsWithAverage.length === 0) {
    return [];
  }

  const weakest = groupsWithAverage.reduce((min, entry) =>
    entry.avgFifaPoints! < min.avgFifaPoints! ? entry : min,
  );
  const strongest = groupsWithAverage.reduce((max, entry) =>
    entry.avgFifaPoints! > max.avgFifaPoints! ? entry : max,
  );
  const tournamentAverage =
    groupsWithAverage.reduce((sum, entry) => sum + entry.avgFifaPoints!, 0) /
    groupsWithAverage.length;

  return [
    {
      value: weakest.avgFifaPoints!,
      stroke: "var(--color-wc-red)",
      legendLabel: t("weakestGroupLine", {
        group: weakest.groupLetter,
        value: formatFifaPoints(weakest.avgFifaPoints!),
      }),
      legendClassName: "text-wc-red",
    },
    {
      value: strongest.avgFifaPoints!,
      stroke: "var(--color-wc-lime)",
      legendLabel: t("strongestGroupLine", {
        group: strongest.groupLetter,
        value: formatFifaPoints(strongest.avgFifaPoints!),
      }),
      legendClassName: "text-wc-lime",
    },
    {
      value: tournamentAverage,
      stroke: "var(--color-wc-turquoise)",
      strokeDasharray: "7 5",
      legendLabel: t("averageGroupLine", {
        value: formatFifaPoints(tournamentAverage),
      }),
      legendClassName: "text-wc-turquoise",
    },
  ];
}

export function GroupFifaPointsChart({
  group,
  allGroups,
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
  const referenceLines = buildGroupBenchmarkLines(allGroups, t);

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
