"use client";

import type { GroupExpectedMatchEntry } from "@/lib/types";
import { GapDistributionChart } from "@/components/facts/gap-distribution-chart";
import { formatFifaPoints } from "@/lib/format";
import { CHART_COLORS } from "@/lib/chart-colors";
import { useTranslations } from "next-intl";

interface GroupDrawsGapChartProps {
  drawMatches: GroupExpectedMatchEntry[];
  mean: number | null;
  stdDev: number | null;
}

export function GroupDrawsGapChart({
  drawMatches,
  mean,
  stdDev,
}: GroupDrawsGapChartProps) {
  const t = useTranslations("home.groupExpectedFinishes");

  const points = drawMatches.map((entry) => ({
    id: `${entry.groupLetter}-${entry.team1.id}-${entry.team2.id}-${entry.scoreLabel}`,
    gapPoints: entry.gapPoints,
    dotClassName: "fill-wc-sky/85",
    showOutlierRing: entry.isDrawGapOutlier,
    tooltip: t("drawGapChartTooltip", {
      group: entry.groupLetter,
      team1: entry.team1.id,
      team2: entry.team2.id,
      score: entry.scoreLabel,
      gap: formatFifaPoints(entry.gapPoints),
    }),
  }));

  return (
    <GapDistributionChart
      points={points}
      mean={mean}
      stdDev={stdDev}
      ariaLabel={t("drawGapChartCaption")}
      legend={
        <>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-wc-sky/85" />
            {t("drawGapChartLegendDot")}
          </span>
          <span className="flex items-center gap-1.5 text-wc-orange">
            <span className="inline-block w-5 border-t border-dashed border-wc-orange" />
            {t("drawGapChartLegendMean")}
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-5 rounded-sm"
              style={{ backgroundColor: CHART_COLORS.stdDevBand, opacity: 0.35 }}
            />
            {t("drawGapChartLegendBand")}
          </span>
          <span className="flex items-center gap-1.5 text-wc-orange">
            <span className="inline-flex h-3 w-3 items-center justify-center rounded-full border-2 border-wc-orange" />
            {t("drawGapChartLegendOutlier")}
          </span>
        </>
      }
      footnotes={
        <p className="text-xs text-muted-foreground">{t("drawGapChartFootnote")}</p>
      }
    />
  );
}
