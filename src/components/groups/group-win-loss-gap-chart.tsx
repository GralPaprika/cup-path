"use client";

import type { GroupExpectedMatchEntry } from "@/lib/types";
import { GapDistributionChart } from "@/components/facts/gap-distribution-chart";
import { formatFifaPoints } from "@/lib/format";
import { CHART_COLORS } from "@/lib/chart-colors";
import { cn } from "@/lib/utils";
import { groupMatchPointId } from "@/components/groups/group-gap-match-tooltip";
import { useGroupGapMatchTooltip } from "@/hooks/use-group-gap-match-tooltip";
import { useTranslations } from "next-intl";

interface GroupWinLossGapChartProps {
  winLossMatches: GroupExpectedMatchEntry[];
  mean: number | null;
  stdDev: number | null;
}

function dotClassName(entry: GroupExpectedMatchEntry): string {
  if (entry.upsetWin) return "fill-wc-orange/85";
  if (entry.expectedWinLanded && entry.favoriteTeamId) {
    return "fill-wc-green/85";
  }
  return "fill-white/35";
}

export function GroupWinLossGapChart({
  winLossMatches,
  mean,
  stdDev,
}: GroupWinLossGapChartProps) {
  const t = useTranslations("home.groupExpectedFinishes");
  const renderPointTooltip = useGroupGapMatchTooltip(winLossMatches, "winLoss");

  const points = winLossMatches.map((entry) => ({
    id: groupMatchPointId(entry),
    gapPoints: entry.gapPoints,
    dotClassName: cn(dotClassName(entry)),
    showOutlierRing: entry.isWinLossGapOutlier,
    tooltip: t("winLossGapChartTooltip", {
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
      ariaLabel={t("winLossGapChartCaption")}
      renderPointTooltip={renderPointTooltip}
      legend={
        <>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-wc-green/85" />
            {t("winLossGapChartLegendFavoriteWin")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-wc-orange/85" />
            {t("winLossGapChartLegendUpset")}
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
            {t("winLossGapChartLegendBigUpset")}
          </span>
        </>
      }
      footnotes={
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {t("winLossGapChartFootnote")}
          </p>
          {winLossMatches.some((entry) => entry.upsetWin) && (
            <p className="text-xs text-muted-foreground">
              {t("winLossTableUnderdogHint")}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {t("winLossTableUpsetHint")}
          </p>
        </div>
      }
    />
  );
}
