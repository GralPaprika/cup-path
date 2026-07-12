"use client";

import type { KnockoutFixtureEntry } from "@/lib/types";
import { GapDistributionChart } from "@/components/facts/gap-distribution-chart";
import { formatFifaPoints } from "@/lib/format";
import { CHART_COLORS } from "@/lib/chart-colors";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface KnockoutStageGapChartProps {
  fixtures: KnockoutFixtureEntry[];
  mean: number | null;
  stdDev: number | null;
  gapChartCaption: string;
}

function dotClassName(fixture: KnockoutFixtureEntry): string {
  return fixture.upsetWin ? "fill-wc-orange/85" : "fill-wc-green/85";
}

function fixtureScoreLabel(fixture: KnockoutFixtureEntry): string {
  const parts = [fixture.scoreFt];
  if (fixture.scoreEt) parts.push(`ET ${fixture.scoreEt}`);
  if (fixture.scorePens) parts.push(`Pens ${fixture.scorePens}`);
  return parts.join(" · ");
}

export function KnockoutStageGapChart({
  fixtures,
  mean,
  stdDev,
  gapChartCaption,
}: KnockoutStageGapChartProps) {
  const shared = useTranslations("home.knockoutStage");
  const tables = useTranslations("home.factsTables");

  const points = fixtures.map((fixture) => ({
    id: `${fixture.matchNum ?? fixture.date}-${fixture.team1.id}-${fixture.team2.id}-${fixture.scoreFt}`,
    gapPoints: fixture.gapPoints,
    dotClassName: cn(dotClassName(fixture)),
    showOutlierRing: fixture.isGapOutlier,
    tooltip: shared("gapChartTooltip", {
      match:
        fixture.matchNum !== null ? `#${fixture.matchNum}` : fixture.date,
      team1: fixture.team1.id,
      team2: fixture.team2.id,
      score: fixtureScoreLabel(fixture),
      gap: formatFifaPoints(fixture.gapPoints),
    }),
  }));

  return (
    <GapDistributionChart
      points={points}
      mean={mean}
      stdDev={stdDev}
      ariaLabel={gapChartCaption}
      legend={
        <>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-wc-green/85" />
            {shared("gapChartLegendFavoriteQualified")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-wc-orange/85" />
            {shared("gapChartLegendUnderdogQualified")}
          </span>
          <span className="flex items-center gap-1.5 text-wc-orange">
            <span className="inline-block w-5 border-t border-dashed border-wc-orange" />
            {tables("gapChartLegendMean")}
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-5 rounded-sm"
              style={{ backgroundColor: CHART_COLORS.stdDevBand, opacity: 0.35 }}
            />
            {tables("gapChartLegendBand")}
          </span>
          <span className="flex items-center gap-1.5 text-wc-orange">
            <span className="inline-flex h-3 w-3 items-center justify-center rounded-full border-2 border-wc-orange" />
            {shared("gapChartLegendBigUpset")}
          </span>
        </>
      }
      footnotes={
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {shared("gapChartFootnote")}
          </p>
          {fixtures.some((fixture) => fixture.upsetWin) && (
            <p className="text-xs text-muted-foreground">
              {tables("underdogRowHint")}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {tables("upsetRowHint")}
          </p>
        </div>
      }
    />
  );
}
