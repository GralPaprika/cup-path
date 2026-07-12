"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { GroupMatchResult, MatchOutcomeGapEntry } from "@/lib/types";
import {
  gapBinForPoints,
  MATCH_OUTCOME_GAP_BINS,
  type MatchOutcomeGapBinId,
} from "@/lib/domain/match/match-outcome-gap";
import { cn } from "@/lib/utils";

export interface MatchOutcomeGapBinStats {
  id: MatchOutcomeGapBinId;
  label: string;
  total: number;
  wins: number;
  draws: number;
  losses: number;
  winPct: number;
  drawPct: number;
  lossPct: number;
}

interface HoveredDot {
  entry: MatchOutcomeGapEntry;
  x: number;
  y: number;
}

export interface MatchOutcomeGapChartProps {
  matches: MatchOutcomeGapEntry[];
  binLabels: Record<MatchOutcomeGapBinId, string>;
  ariaLabel: string;
  xAxisLabel: string;
  yAxisLabel: string;
  legend: ReactNode;
  footnotes: ReactNode;
  renderMatchTooltip: (entry: MatchOutcomeGapEntry) => ReactNode;
  formatBinTooltip: (bin: MatchOutcomeGapBinStats) => string;
}

const WIDTH = 640;
const HEIGHT = 236;
const MARGIN = { top: 16, right: 16, bottom: 20, left: 48 };
const BAR_AREA_HEIGHT = 130;
const DOT_AREA_TOP = MARGIN.top + BAR_AREA_HEIGHT + 28;

const RESULT_DOT_CLASS: Record<GroupMatchResult, string> = {
  W: "fill-wc-green/85",
  D: "fill-wc-sky/85",
  L: "fill-wc-red/85",
};

const RESULT_BAR_CLASS: Record<GroupMatchResult, string> = {
  W: "fill-wc-green/80",
  D: "fill-wc-sky/80",
  L: "fill-wc-red/80",
};

function buildBinStats(
  matches: MatchOutcomeGapEntry[],
  binLabels: Record<MatchOutcomeGapBinId, string>,
): MatchOutcomeGapBinStats[] {
  return MATCH_OUTCOME_GAP_BINS.map((bin) => {
    const bucket = matches.filter(
      (entry) => gapBinForPoints(entry.gapPoints) === bin.id,
    );
    const wins = bucket.filter((entry) => entry.favoriteResult === "W").length;
    const draws = bucket.filter((entry) => entry.favoriteResult === "D").length;
    const losses = bucket.filter((entry) => entry.favoriteResult === "L").length;
    const total = bucket.length;

    return {
      id: bin.id,
      label: binLabels[bin.id],
      total,
      wins,
      draws,
      losses,
      winPct: total > 0 ? (wins / total) * 100 : 0,
      drawPct: total > 0 ? (draws / total) * 100 : 0,
      lossPct: total > 0 ? (losses / total) * 100 : 0,
    };
  });
}

function svgCoordsToScreen(
  svg: SVGSVGElement,
  x: number,
  y: number,
): { x: number; y: number } | null {
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;

  const point = svg.createSVGPoint();
  point.x = x;
  point.y = y;
  const screen = point.matrixTransform(ctm);
  return { x: screen.x, y: screen.y };
}

function xForBinCenter(
  index: number,
  chartWidth: number,
  binCount: number,
): number {
  return MARGIN.left + (index + 0.5) * (chartWidth / binCount);
}

function xForGapInBinSlot(
  gap: number,
  maxGap: number,
  chartWidth: number,
): number {
  const binId = gapBinForPoints(gap);
  const binIndex = MATCH_OUTCOME_GAP_BINS.findIndex((bin) => bin.id === binId);
  const bin = MATCH_OUTCOME_GAP_BINS[binIndex];
  const slotWidth = chartWidth / MATCH_OUTCOME_GAP_BINS.length;
  const slotLeft = MARGIN.left + binIndex * slotWidth;

  const binMax =
    bin.max === Number.POSITIVE_INFINITY
      ? Math.max(maxGap, bin.min + 1)
      : bin.max;
  const range = Math.max(binMax - bin.min, 1);
  const t = Math.min(1, Math.max(0, (gap - bin.min) / range));

  const inset = slotWidth * 0.14;
  return slotLeft + inset + t * (slotWidth - inset * 2);
}

export function MatchOutcomeGapChart({
  matches,
  binLabels,
  ariaLabel,
  xAxisLabel,
  yAxisLabel,
  legend,
  footnotes,
  renderMatchTooltip,
  formatBinTooltip,
}: MatchOutcomeGapChartProps) {
  const [hoveredDot, setHoveredDot] = useState<HoveredDot | null>(null);

  const showDot = useCallback(
    (
      entry: MatchOutcomeGapEntry,
      cx: number,
      cy: number,
      svgElement: SVGSVGElement | null,
    ) => {
      if (!svgElement) return;
      const screen = svgCoordsToScreen(svgElement, cx, cy);
      if (!screen) return;

      setHoveredDot({
        entry,
        x: screen.x,
        y: screen.y,
      });
    },
    [],
  );

  const hideDot = useCallback(() => {
    setHoveredDot(null);
  }, []);

  useEffect(() => {
    setHoveredDot(null);
  }, [matches]);

  if (matches.length === 0) return null;

  const bins = buildBinStats(matches, binLabels);
  const gaps = matches.map((entry) => entry.gapPoints);
  const maxGap = Math.max(...gaps);

  const chartWidth = WIDTH - MARGIN.left - MARGIN.right;
  const barWidth = chartWidth / bins.length - 10;
  const barBaselineY = MARGIN.top + BAR_AREA_HEIGHT;
  const dotBaselineY = HEIGHT - MARGIN.bottom;

  const gapCounts = new Map<number, number>();
  const dotRows = matches.map((entry) => {
    const count = gapCounts.get(entry.gapPoints) ?? 0;
    gapCounts.set(entry.gapPoints, count + 1);
    return { entry, row: count };
  });
  const rowCount = Math.max(...[...gapCounts.values()], 1);
  const rowStep = Math.min(
    12,
    (dotBaselineY - DOT_AREA_TOP - 8) / rowCount,
  );
  const yForDot = (row: number) => dotBaselineY - 8 - row * rowStep;

  return (
    <figure className="space-y-2">
      <figcaption className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        {legend}
      </figcaption>

      <div className="relative" onMouseLeave={hideDot}>
        <svg
          className="h-auto w-full"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={ariaLabel}
          onMouseLeave={hideDot}
        >
          {[25, 50, 75, 100].map((tick) => (
            <text
              key={tick}
              x={MARGIN.left - 6}
              y={barBaselineY - (tick / 100) * BAR_AREA_HEIGHT + 3}
              textAnchor="end"
              className="fill-muted-foreground text-[9px]"
            >
              {tick}%
            </text>
          ))}

          <text
            x={12}
            y={MARGIN.top + BAR_AREA_HEIGHT / 2}
            textAnchor="middle"
            transform={`rotate(-90, 12, ${MARGIN.top + BAR_AREA_HEIGHT / 2})`}
            className="fill-muted-foreground text-[6px] uppercase tracking-wide"
          >
            {yAxisLabel}
          </text>

          <line
            x1={MARGIN.left}
            x2={WIDTH - MARGIN.right}
            y1={barBaselineY}
            y2={barBaselineY}
            className="stroke-white/15"
          />

          {bins.map((bin, index) => {
            if (bin.total === 0) {
              return (
                <g key={bin.id}>
                  <text
                    x={xForBinCenter(index, chartWidth, bins.length)}
                    y={barBaselineY + 18}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[10px]"
                  >
                    {bin.label}
                  </text>
                </g>
              );
            }

            const cx = xForBinCenter(index, chartWidth, bins.length);
            const x = cx - barWidth / 2;
            let stackTop = barBaselineY;

            const segments: Array<{ result: GroupMatchResult; pct: number }> = [
              { result: "W", pct: bin.winPct },
              { result: "D", pct: bin.drawPct },
              { result: "L", pct: bin.lossPct },
            ];

            return (
              <g key={bin.id}>
                {segments.map((segment) => {
                  if (segment.pct <= 0) return null;
                  const height = (segment.pct / 100) * BAR_AREA_HEIGHT;
                  stackTop -= height;
                  return (
                    <rect
                      key={segment.result}
                      x={x}
                      y={stackTop}
                      width={barWidth}
                      height={height}
                      className={RESULT_BAR_CLASS[segment.result]}
                      rx={segment.result === "W" ? 2 : 0}
                    />
                  );
                })}
                <rect
                  x={x}
                  y={barBaselineY - BAR_AREA_HEIGHT}
                  width={barWidth}
                  height={BAR_AREA_HEIGHT}
                  fill="transparent"
                >
                  <title>{formatBinTooltip(bin)}</title>
                </rect>
                <text
                  x={cx}
                  y={barBaselineY + 18}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {bin.label}
                </text>
                <text
                  x={cx}
                  y={barBaselineY + 30}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[9px]"
                >
                  n={bin.total}
                </text>
              </g>
            );
          })}

          <line
            x1={MARGIN.left}
            x2={WIDTH - MARGIN.right}
            y1={DOT_AREA_TOP - 10}
            y2={DOT_AREA_TOP - 10}
            className="stroke-white/10"
            strokeDasharray="3 3"
          />

          {MATCH_OUTCOME_GAP_BINS.map((bin, index) => {
            const slotX = MARGIN.left + index * (chartWidth / bins.length);
            return (
              <line
                key={bin.id}
                x1={slotX}
                x2={slotX}
                y1={DOT_AREA_TOP - 10}
                y2={dotBaselineY}
                className="stroke-white/6"
              />
            );
          })}
          <line
            x1={WIDTH - MARGIN.right}
            x2={WIDTH - MARGIN.right}
            y1={DOT_AREA_TOP - 10}
            y2={dotBaselineY}
            className="stroke-white/6"
          />

          {dotRows.map(({ entry, row }) => {
            const cx = xForGapInBinSlot(entry.gapPoints, maxGap, chartWidth);
            const cy = yForDot(row);
            const isHovered = hoveredDot?.entry.id === entry.id;

            return (
              <g
                key={entry.id}
                className="cursor-pointer"
                onMouseEnter={(event) =>
                  showDot(entry, cx, cy, event.currentTarget.ownerSVGElement)
                }
                onMouseMove={(event) =>
                  showDot(entry, cx, cy, event.currentTarget.ownerSVGElement)
                }
                onFocus={(event) =>
                  showDot(entry, cx, cy, event.currentTarget.ownerSVGElement)
                }
                onBlur={hideDot}
                tabIndex={0}
                role="button"
                aria-label={`${entry.team1.id} vs ${entry.team2.id}, ${entry.scoreLabel}`}
              >
                {entry.isOutlier && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={8}
                    fill="none"
                    className={cn(
                      "stroke-wc-orange transition-opacity",
                      isHovered ? "opacity-100" : "opacity-80",
                    )}
                    strokeWidth={2}
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={10}
                  fill="transparent"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6.5 : 5}
                  className={cn(
                    RESULT_DOT_CLASS[entry.favoriteResult],
                    "transition-all duration-150",
                    isHovered && "stroke-white/70",
                  )}
                  strokeWidth={isHovered ? 1.5 : 0}
                />
              </g>
            );
          })}

          <text
            x={MARGIN.left + chartWidth / 2}
            y={dotBaselineY + 12}
            textAnchor="middle"
            className="fill-muted-foreground text-[6px] uppercase tracking-wide"
          >
            {xAxisLabel}
          </text>

        </svg>

        {hoveredDot && typeof document !== "undefined"
          ? createPortal(
              <div
                className="pointer-events-none fixed z-50 transition-opacity duration-150"
                style={{
                  left: hoveredDot.x,
                  top: hoveredDot.y,
                  transform: "translate(-50%, calc(-100% - 14px))",
                }}
              >
                {renderMatchTooltip(hoveredDot.entry)}
              </div>,
              document.body,
            )
          : null}
      </div>

      {footnotes}
    </figure>
  );
}

export function computeOutcomeShares(matches: MatchOutcomeGapEntry[]) {
  const total = matches.length;
  if (total === 0) {
    return { total: 0, winPct: 0, drawPct: 0, lossPct: 0 };
  }

  const wins = matches.filter((entry) => entry.favoriteResult === "W").length;
  const draws = matches.filter((entry) => entry.favoriteResult === "D").length;
  const losses = matches.filter((entry) => entry.favoriteResult === "L").length;

  return {
    total,
    winPct: Math.round((wins / total) * 100),
    drawPct: Math.round((draws / total) * 100),
    lossPct: Math.round((losses / total) * 100),
  };
}

export function computeCloseGapInsight(matches: MatchOutcomeGapEntry[]) {
  const close = matches.filter((entry) => entry.gapPoints <= 25);
  if (close.length < 3) return null;
  return computeOutcomeShares(close);
}
