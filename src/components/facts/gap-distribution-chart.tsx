"use client";

import type { ReactNode } from "react";
import { CHART_COLORS } from "@/lib/chart-colors";
import { formatFifaPoints } from "@/lib/format";

export interface GapChartPoint {
  id: string;
  gapPoints: number;
  dotClassName: string;
  showOutlierRing: boolean;
  tooltip: string;
}

export interface GapDistributionChartProps {
  points: GapChartPoint[];
  mean: number | null;
  stdDev: number | null;
  ariaLabel: string;
  legend: ReactNode;
  footnotes: ReactNode;
}

const WIDTH = 640;
const HEIGHT = 120;
const MARGIN = { top: 16, right: 16, bottom: 28, left: 16 };

export function GapDistributionChart({
  points,
  mean,
  stdDev,
  ariaLabel,
  legend,
  footnotes,
}: GapDistributionChartProps) {
  if (points.length === 0) return null;

  const gaps = points.map((point) => point.gapPoints);
  const maxGap = Math.max(...gaps);
  const bandHigh = mean !== null && stdDev !== null ? mean + stdDev : maxGap;
  const domainMax = Math.max(maxGap, bandHigh, 1);
  const padding = Math.max(20, domainMax * 0.08);
  const chartWidth = WIDTH - MARGIN.left - MARGIN.right;
  const baselineY = HEIGHT - MARGIN.bottom;

  const x = (gap: number) =>
    MARGIN.left + (gap / (domainMax + padding)) * chartWidth;

  const gapCounts = new Map<number, number>();
  const dotRows = points.map((point) => {
    const count = gapCounts.get(point.gapPoints) ?? 0;
    gapCounts.set(point.gapPoints, count + 1);
    return { point, row: count };
  });

  const rowCount = Math.max(...[...gapCounts.values()], 1);
  const rowStep = Math.min(
    14,
    (HEIGHT - MARGIN.top - MARGIN.bottom - 16) / rowCount,
  );

  const yForDot = (row: number) => baselineY - 12 - row * rowStep;

  const bandLow =
    mean !== null && stdDev !== null ? Math.max(0, mean - stdDev) : null;
  const bandHighValue =
    mean !== null && stdDev !== null ? mean + stdDev : null;

  return (
    <figure className="space-y-2">
      <figcaption className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        {legend}
      </figcaption>

      <svg
        className="h-auto w-full"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={ariaLabel}
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

        {dotRows.map(({ point, row }) => {
          const cx = x(point.gapPoints);
          const cy = yForDot(row);

          return (
            <g key={point.id}>
              {point.showOutlierRing && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={8}
                  fill="none"
                  className="stroke-wc-orange"
                  strokeWidth={2}
                />
              )}
              <circle cx={cx} cy={cy} r={5} className={point.dotClassName}>
                <title>{point.tooltip}</title>
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

      {footnotes}
    </figure>
  );
}
