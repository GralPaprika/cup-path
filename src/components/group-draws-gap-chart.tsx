"use client";

import type { GroupExpectedMatchEntry } from "@/lib/types";
import { formatFifaPoints } from "@/lib/format";
import { CHART_COLORS } from "@/lib/chart-colors";
import { useTranslations } from "next-intl";

interface GroupDrawsGapChartProps {
  drawMatches: GroupExpectedMatchEntry[];
  mean: number | null;
  stdDev: number | null;
}

const WIDTH = 640;
const HEIGHT = 120;
const MARGIN = { top: 16, right: 16, bottom: 28, left: 16 };

export function GroupDrawsGapChart({
  drawMatches,
  mean,
  stdDev,
}: GroupDrawsGapChartProps) {
  const t = useTranslations("home.groupExpectedFinishes");

  if (drawMatches.length === 0) return null;

  const gaps = drawMatches.map((entry) => entry.gapPoints);
  const maxGap = Math.max(...gaps);
  const bandHigh =
    mean !== null && stdDev !== null ? mean + stdDev : maxGap;
  const domainMax = Math.max(maxGap, bandHigh, 1);
  const padding = Math.max(20, domainMax * 0.08);
  const chartWidth = WIDTH - MARGIN.left - MARGIN.right;
  const baselineY = HEIGHT - MARGIN.bottom;

  const x = (gap: number) =>
    MARGIN.left + (gap / (domainMax + padding)) * chartWidth;

  const gapCounts = new Map<number, number>();
  const dotRows = drawMatches.map((entry) => {
    const count = gapCounts.get(entry.gapPoints) ?? 0;
    gapCounts.set(entry.gapPoints, count + 1);
    return { entry, row: count };
  });

  const rowCount = Math.max(...[...gapCounts.values()], 1);
  const rowStep = Math.min(14, (HEIGHT - MARGIN.top - MARGIN.bottom - 16) / rowCount);

  const yForDot = (row: number) =>
    baselineY - 12 - row * rowStep;

  const bandLow =
    mean !== null && stdDev !== null ? Math.max(0, mean - stdDev) : null;
  const bandHighValue =
    mean !== null && stdDev !== null ? mean + stdDev : null;

  return (
    <figure className="space-y-2">
      <figcaption className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
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
      </figcaption>

      <svg
        className="h-auto w-full"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={t("drawGapChartCaption")}
      >
        <line
          x1={MARGIN.left}
          x2={WIDTH - MARGIN.right}
          y1={baselineY}
          y2={baselineY}
          className="stroke-white/15"
        />

        {bandLow !== null && bandHighValue !== null && (
          <rect
            x={x(bandLow)}
            y={MARGIN.top}
            width={Math.max(x(bandHighValue) - x(bandLow), 1)}
            height={baselineY - MARGIN.top}
            fill={CHART_COLORS.stdDevBand}
            fillOpacity={0.18}
          />
        )}

        {mean !== null && (
          <line
            x1={x(mean)}
            x2={x(mean)}
            y1={MARGIN.top}
            y2={baselineY}
            stroke={CHART_COLORS.mean}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        )}

        {dotRows.map(({ entry, row }) => {
          const cx = x(entry.gapPoints);
          const cy = yForDot(row);

          return (
            <g key={`${entry.groupLetter}-${entry.team1.id}-${entry.team2.id}-${entry.scoreLabel}`}>
              {entry.isDrawGapOutlier && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={8}
                  fill="none"
                  className="stroke-wc-orange"
                  strokeWidth={2}
                />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={5}
                className="fill-wc-sky/85"
              >
                <title>
                  {t("drawGapChartTooltip", {
                    group: entry.groupLetter,
                    team1: entry.team1.id,
                    team2: entry.team2.id,
                    score: entry.scoreLabel,
                    gap: formatFifaPoints(entry.gapPoints),
                  })}
                </title>
              </circle>
            </g>
          );
        })}

        <text
          x={MARGIN.left}
          y={HEIGHT - 6}
          className="fill-muted-foreground text-[10px]"
        >
          0
        </text>
        <text
          x={WIDTH - MARGIN.right}
          y={HEIGHT - 6}
          textAnchor="end"
          className="fill-muted-foreground text-[10px]"
        >
          {formatFifaPoints(Math.round(domainMax))}
        </text>
      </svg>

      <p className="text-xs text-muted-foreground">{t("drawGapChartFootnote")}</p>
    </figure>
  );
}
