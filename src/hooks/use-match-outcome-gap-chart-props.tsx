"use client";

import { useMemo, type ReactNode } from "react";
import type { MatchOutcomeGapEntry } from "@/lib/types";
import type { MatchOutcomeGapBinId } from "@/lib/domain/match/match-outcome-gap";
import type {
  MatchOutcomeGapBinStats,
  MatchOutcomeGapChartProps,
} from "@/components/facts/match-outcome-gap-chart";
import { MatchOutcomeGapBinTooltip } from "@/components/facts/match-outcome-gap-bin-tooltip";
import { MatchOutcomeGapMatchTooltip } from "@/components/facts/match-outcome-gap-match-tooltip";
import { getRoundDisplayName } from "@/lib/i18n/round-display-name";
import { useTranslations } from "next-intl";

type ChartBindings = Pick<
  MatchOutcomeGapChartProps,
  | "matches"
  | "binLabels"
  | "ariaLabel"
  | "xAxisLabel"
  | "yAxisLabel"
  | "footnotes"
  | "getBinAriaLabel"
  | "renderBinTooltip"
  | "renderMatchTooltip"
>;

export function useMatchOutcomeGapLegend(): ReactNode {
  const t = useTranslations("home.matchOutcomeGap");

  return useMemo(
    () => (
      <>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-5 rounded-sm bg-wc-green/80" />
          {t("favoriteWin")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-5 rounded-sm bg-wc-sky/80" />
          {t("draw")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-5 rounded-sm bg-wc-red/80" />
          {t("upset")}
        </span>
        <span className="flex items-center gap-1.5 text-wc-orange">
          <span className="inline-flex h-3 w-3 items-center justify-center rounded-full border-2 border-wc-orange" />
          {t("outlier")}
        </span>
      </>
    ),
    [t],
  );
}

export function useMatchOutcomeGapBinLabels(): Record<
  MatchOutcomeGapBinId,
  string
> {
  const t = useTranslations("home.matchOutcomeGap");

  return useMemo(
    () => ({
      "0-25": t("bin0to25"),
      "26-50": t("bin26to50"),
      "51-100": t("bin51to100"),
      "101-250": t("bin101to250"),
      "251+": t("bin251plus"),
    }),
    [t],
  );
}

export function useMatchOutcomeGapChartProps(
  matches: MatchOutcomeGapEntry[],
  binLabels: Record<MatchOutcomeGapBinId, string>,
): ChartBindings {
  const t = useTranslations("home.matchOutcomeGap");
  const stages = useTranslations("compare.stages");

  return useMemo(
    () => ({
      matches,
      binLabels,
      ariaLabel: t("chartAria", { count: matches.length }),
      xAxisLabel: t("xAxisLabel"),
      yAxisLabel: t("yAxisLabel"),
      footnotes: (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{t("footnote")}</p>
          <p className="text-xs text-muted-foreground">{t("outlierFootnote")}</p>
        </div>
      ),
      getBinAriaLabel: (bin: MatchOutcomeGapBinStats) =>
        t("binTooltip", {
          label: bin.label,
          total: bin.total,
          winPct: Math.round(bin.winPct),
          drawPct: Math.round(bin.drawPct),
          lossPct: Math.round(bin.lossPct),
        }),
      renderBinTooltip: (bin: MatchOutcomeGapBinStats) => (
        <MatchOutcomeGapBinTooltip
          bin={bin}
          gapRangeLabel={t("binTooltipGapRange", { label: bin.label })}
          matchesLabel={t("binTooltipMatches", { count: bin.total })}
          favoriteWinLabel={t("favoriteWin")}
          drawLabel={t("draw")}
          upsetLabel={t("upset")}
        />
      ),
      renderMatchTooltip: (entry: MatchOutcomeGapEntry) => (
        <MatchOutcomeGapMatchTooltip
          entry={entry}
          roundLabel={getRoundDisplayName(stages, entry.round)}
          favoriteWinLabel={t("favoriteWin")}
          drawLabel={t("draw")}
          upsetLabel={t("upset")}
          gapLabel={t("tooltipGap")}
          favoriteLabel={t("tooltipFavorite")}
          evenlyMatchedLabel={t("tooltipEvenlyMatched")}
          outlierLabel={t("outlier")}
          groupLabel={
            entry.groupLetter
              ? t("tooltipGroup", { letter: entry.groupLetter })
              : undefined
          }
        />
      ),
    }),
    [binLabels, matches, stages, t],
  );
}
