"use client";

import { useMemo } from "react";
import type { MatchOutcomeGapDataset, PathStage } from "@/lib/types";
import { CollapsibleSection } from "@/components/shared/collapsible-section";
import { PathStageFilters } from "@/components/path/path-stage-filters";
import {
  computeOutcomeShares,
  MatchOutcomeGapChart,
} from "@/components/facts/match-outcome-gap-chart";
import { MatchOutcomeGapBinTooltip } from "@/components/facts/match-outcome-gap-bin-tooltip";
import { MatchOutcomeGapMatchTooltip } from "@/components/facts/match-outcome-gap-match-tooltip";
import { usePersistedMatchOutcomeGapStages } from "@/hooks/use-persisted-match-outcome-gap-stages";
import { getFurthestStage } from "@/lib/domain/match/match-stages";
import type { MatchOutcomeGapBinId } from "@/lib/domain/match/match-outcome-gap";
import { getRoundDisplayName } from "@/lib/i18n/round-display-name";
import { useTranslations } from "next-intl";

interface MatchOutcomeGapPanelProps {
  dataset: MatchOutcomeGapDataset;
}

function availableStagesFromDataset(
  dataset: MatchOutcomeGapDataset,
): Set<PathStage> {
  return new Set(dataset.matches.map((entry) => entry.stage));
}

export function MatchOutcomeGapPanel({
  dataset,
}: MatchOutcomeGapPanelProps) {
  const t = useTranslations("home.matchOutcomeGap");
  const stages = useTranslations("compare.stages");

  const availableStages = useMemo(
    () => availableStagesFromDataset(dataset),
    [dataset.matches],
  );

  const maxStageReached = useMemo(
    () => getFurthestStage(availableStages),
    [availableStages],
  );

  const [selectedStages, setSelectedStages, hydrated] =
    usePersistedMatchOutcomeGapStages(availableStages);

  const filteredMatches = useMemo(
    () =>
      dataset.matches.filter((entry) => selectedStages.has(entry.stage)),
    [dataset.matches, selectedStages],
  );

  const shares = useMemo(
    () => computeOutcomeShares(filteredMatches),
    [filteredMatches],
  );

  const binLabels: Record<MatchOutcomeGapBinId, string> = {
    "0-25": t("bin0to25"),
    "26-50": t("bin26to50"),
    "51-100": t("bin51to100"),
    "101-250": t("bin101to250"),
    "251+": t("bin251plus"),
  };

  const outcomeLegend = (
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
  );

  return (
    <CollapsibleSection title={t("title")} subtitle={t("subtitle")}>
      <div className="space-y-5">
        {!hydrated ? null : filteredMatches.length === 0 ? (
          <>
            <PathStageFilters
              value={selectedStages}
              onChange={setSelectedStages}
              maxStageReached={maxStageReached}
              variant="toggles"
              compact
              align="end"
              showLabel={false}
            />
            <p className="text-sm text-muted-foreground">{t("noMatches")}</p>
          </>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryTile
                label={t("summaryMatches")}
                value={String(shares.total)}
              />
              <SummaryTile
                label={t("summaryFavoriteWin")}
                value={`${shares.winPct}%`}
                className="text-wc-green"
              />
              <SummaryTile
                label={t("summaryDraw")}
                value={`${shares.drawPct}%`}
                className="text-wc-sky"
              />
              <SummaryTile
                label={t("summaryUpset")}
                value={`${shares.lossPct}%`}
                className="text-wc-red"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                {outcomeLegend}
              </div>
              <PathStageFilters
                value={selectedStages}
                onChange={setSelectedStages}
                maxStageReached={maxStageReached}
                variant="toggles"
                compact
                align="end"
                showLabel={false}
                className="shrink-0"
              />
            </div>

            <MatchOutcomeGapChart
              matches={filteredMatches}
              binLabels={binLabels}
              ariaLabel={t("chartAria", { count: filteredMatches.length })}
              xAxisLabel={t("xAxisLabel")}
              yAxisLabel={t("yAxisLabel")}
              footnotes={
                <p className="text-xs text-muted-foreground">{t("footnote")}</p>
              }
              getBinAriaLabel={(bin) =>
                t("binTooltip", {
                  label: bin.label,
                  total: bin.total,
                  winPct: Math.round(bin.winPct),
                  drawPct: Math.round(bin.drawPct),
                  lossPct: Math.round(bin.lossPct),
                })
              }
              renderBinTooltip={(bin) => (
                <MatchOutcomeGapBinTooltip
                  bin={bin}
                  gapRangeLabel={t("binTooltipGapRange", { label: bin.label })}
                  matchesLabel={t("binTooltipMatches", { count: bin.total })}
                  favoriteWinLabel={t("favoriteWin")}
                  drawLabel={t("draw")}
                  upsetLabel={t("upset")}
                />
              )}
              renderMatchTooltip={(entry) => (
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
              )}
            />
          </>
        )}
      </div>
    </CollapsibleSection>
  );
}

function SummaryTile({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-lg font-semibold text-white ${className ?? ""}`}>
        {value}
      </p>
    </div>
  );
}
