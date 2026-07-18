"use client";

import { OpponentDifficultyPointTooltip } from "@/components/facts/opponent-difficulty-point-tooltip";
import { OpponentDifficultyScatterChart } from "@/components/facts/opponent-difficulty-scatter-chart";
import type { GroupStageDifficultyStrip } from "@/lib/types";
import { CHART_COLORS } from "@/lib/chart-colors";
import { useTranslations } from "next-intl";

interface GroupStageDifficultyChartProps {
  strip: GroupStageDifficultyStrip;
  mode: string;
}

export function GroupStageDifficultyChart({
  strip,
  mode,
}: GroupStageDifficultyChartProps) {
  const t = useTranslations("home.groupExpectedFinishes");

  const { entries } = strip;
  if (entries.length === 0) return null;

  const meanPoints = strip.meanAvgOpponentPoints;

  const referenceLines = [
    {
      value: meanPoints,
      stroke: CHART_COLORS.mean,
      dash: "4 4",
      label: t("groupDifficultyLegendMean"),
      className: "text-wc-orange",
    },
    {
      value: strip.maxAvgOpponentPoints,
      stroke: "var(--color-wc-red)",
      dash: "2 3",
      label: t("groupDifficultyLegendHighest"),
      className: "text-wc-red",
    },
    {
      value: strip.minAvgOpponentPoints,
      stroke: "var(--color-wc-sky)",
      dash: "2 3",
      label: t("groupDifficultyLegendLowest"),
      className: "text-wc-sky",
    },
  ].filter(
    (line): line is typeof line & { value: number } => line.value !== null,
  );

  // Same tournament-average value on both axes so the cross reads as
  // one shared reference, not two different averages.
  const verticalReferenceLines =
    meanPoints === null
      ? []
      : [
          {
            value: meanPoints,
            stroke: CHART_COLORS.mean,
            dash: "4 4",
            label: t("groupDifficultyLegendMean"),
            className: "text-wc-orange",
          },
        ];

  const points = entries.map((entry) => ({
    id: entry.team.id,
    teamFifaPoints: entry.teamFifaPoints,
    rivalDifficultyPoints: entry.avgOpponentPoints,
    won: entry.qualified,
    href: `/team-analysis?team=${entry.team.id}&mode=${mode}`,
    tooltipData: {
      team: entry.team,
      teamFifaPoints: entry.teamFifaPoints,
      rivalDifficultyPoints: entry.avgOpponentPoints,
      won: entry.qualified,
      statusLabel: entry.qualified
        ? t("groupDifficultyQualified")
        : t("groupDifficultyEliminated"),
      rivalDifficultyLabel: t("groupDifficultyAxisRivalDifficulty"),
      gapLabel: t("groupDifficultyTooltipGap"),
      subtitle: t("groupDifficultyTooltipGroup", {
        letter: entry.groupLetter,
      }),
    },
  }));

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-white">
          {t("groupDifficultyTitle")}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("groupDifficultySubtitle", { count: entries.length })}
        </p>
      </div>

      <OpponentDifficultyScatterChart
        points={points}
        referenceLines={referenceLines}
        verticalReferenceLines={verticalReferenceLines}
        ariaLabel={t("groupDifficultyCaption")}
        xAxisLabel={t("groupDifficultyAxisTeamPoints")}
        yAxisLabel={t("groupDifficultyAxisRivalDifficulty")}
        footnote={
          <>
            <p className="text-xs text-muted-foreground">
              {t("groupDifficultyFootnote")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("groupDifficultyReadingFootnote")}
            </p>
          </>
        }
        renderPointTooltip={(data) => (
          <OpponentDifficultyPointTooltip {...data} />
        )}
        legend={
          <>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-wc-green/85" />
              {t("groupDifficultyLegendVictory")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-wc-red/80" />
              {t("groupDifficultyLegendDefeat")}
            </span>
            {referenceLines.map((line) => (
              <span
                key={line.label}
                className={`flex items-center gap-1.5 ${line.className}`}
              >
                {line.value === meanPoints ? (
                  <span className="relative inline-flex h-3 w-3 items-center justify-center">
                    <span
                      className="absolute h-3 border-l"
                      style={{
                        borderColor: line.stroke,
                        borderLeftStyle: "dashed",
                      }}
                    />
                    <span
                      className="absolute w-3 border-t"
                      style={{
                        borderColor: line.stroke,
                        borderTopStyle: "dashed",
                      }}
                    />
                  </span>
                ) : (
                  <span
                    className="inline-block w-5 border-t"
                    style={{
                      borderColor: line.stroke,
                      borderTopStyle: "dashed",
                    }}
                  />
                )}
                {line.label}
              </span>
            ))}
          </>
        }
      />
    </div>
  );
}
