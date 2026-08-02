"use client";

import { useMemo, useState } from "react";
import { Maximize2 } from "lucide-react";
import type { MatchOutcomeGapDataset, PathStage } from "@/lib/types";
import { PathStageFilters } from "@/components/path/path-stage-filters";
import {
  computeOutcomeShares,
  MatchOutcomeGapChart,
} from "@/components/facts/match-outcome-gap-chart";
import { MatchOutcomeGapChartOverlay } from "@/components/facts/match-outcome-gap-chart-overlay";
import { usePersistedMatchOutcomeGapStages } from "@/hooks/use-persisted-match-outcome-gap-stages";
import {
  useMatchOutcomeGapBinLabels,
  useMatchOutcomeGapChartProps,
  useMatchOutcomeGapLegend,
} from "@/hooks/use-match-outcome-gap-chart-props";
import { getFurthestStage } from "@/lib/domain/match/match-stages";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

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
  const [overlayOpen, setOverlayOpen] = useState(false);

  const availableStages = useMemo(
    () => availableStagesFromDataset(dataset),
    [dataset],
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

  const binLabels = useMatchOutcomeGapBinLabels();
  const outcomeLegend = useMatchOutcomeGapLegend();
  const chartProps = useMatchOutcomeGapChartProps(filteredMatches, binLabels);

  const stageFilters = hydrated ? (
    <PathStageFilters
      value={selectedStages}
      onChange={setSelectedStages}
      maxStageReached={maxStageReached}
      variant="toggles"
      compact
      align="end"
      showLabel={false}
      className="min-w-0 lg:shrink-0"
    />
  ) : null;

  return (
    <section className="glass-panel min-w-0 overflow-hidden">
      <div className="border-b border-white/8 bg-white/[0.03] px-3 py-3 sm:px-5 sm:py-4 md:px-6">
        <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <div className="space-y-4 p-3 sm:space-y-5 sm:p-5 md:p-6">
        {!hydrated ? null : filteredMatches.length === 0 ? (
          <>
            {stageFilters}
            <p className="text-sm text-muted-foreground">{t("noMatches")}</p>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-4">
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

            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {outcomeLegend}
              </div>
              <div className="min-w-0">{stageFilters}</div>
            </div>

            <div className="relative min-w-0">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="absolute right-0 top-0 z-10 hidden md:inline-flex"
                aria-label={t("expandChart")}
                onClick={() => setOverlayOpen(true)}
              >
                <Maximize2 />
              </Button>

              <MatchOutcomeGapChart {...chartProps} hideFootnotes />

              <MatchOutcomeGapChartOverlay
                open={overlayOpen}
                onClose={() => setOverlayOpen(false)}
                title={t("expandedChartTitle")}
                closeLabel={t("closeExpandedChart")}
                zoomInLabel={t("zoomIn")}
                zoomOutLabel={t("zoomOut")}
                resetZoomLabel={t("resetZoom")}
                interactionHint={t("interactionHint")}
                legend={outcomeLegend}
                stageFilters={stageFilters}
                noMatchesMessage={t("noMatches")}
                {...chartProps}
              />
            </div>

            {chartProps.footnotes}
          </>
        )}
      </div>
    </section>
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
    <div className="rounded-lg border border-white/8 bg-white/[0.03] px-2 py-1.5 md:px-3 md:py-2.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className={`mt-0.5 text-base font-semibold text-white md:text-lg ${className ?? ""}`}
      >
        {value}
      </p>
    </div>
  );
}
