"use client";

import {
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { OpponentDifficultyScatterFifaLabels } from "@/components/charts/opponent-difficulty-scatter-fifa-labels";
import { TableSearchInput } from "@/components/tables/table-search-input";
import { Switch } from "@/components/ui/switch";
import { useMinWidthLg, useMinWidthMd } from "@/hooks/use-min-width";
import { svgCoordsToScreen } from "@/lib/client/svg-coords";
import { formatWholeNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface OpponentDifficultyScatterPoint<TTooltip = unknown> {
  id: string;
  /** FIFA code shown when showFifaLabels is on (may differ from id in knockout). */
  fifaCode: string;
  teamFifaPoints: number;
  rivalDifficultyPoints: number;
  won: boolean;
  href: string;
  tooltipData: TTooltip;
}

export interface OpponentDifficultyReferenceLine {
  value: number;
  stroke: string;
  dash: string;
  label: string;
  className: string;
}

export interface OpponentDifficultyScatterChartProps<TTooltip = unknown> {
  /** Visible (filtered) points drawn as dots. */
  points: OpponentDifficultyScatterPoint<TTooltip>[];
  /** Full point set used only for fixed X/Y domains. */
  domainPoints: OpponentDifficultyScatterPoint<TTooltip>[];
  referenceLines: OpponentDifficultyReferenceLine[];
  verticalReferenceLines?: OpponentDifficultyReferenceLine[];
  ariaLabel: string;
  referenceLegend: ReactNode;
  footnote: ReactNode;
  xAxisLabel: string;
  yAxisLabel: string;
  renderPointTooltip: (data: TTooltip) => ReactNode;
  wonLabel: string;
  lostLabel: string;
  showWon: boolean;
  showLost: boolean;
  onToggleWon: () => void;
  onToggleLost: () => void;
  query: string;
  onQueryChange: (query: string) => void;
  searchPlaceholder: string;
  searchLabel: string;
  /** Removable: FIFA code labels on dots. Default off. */
  showFifaLabels: boolean;
  onShowFifaLabelsChange: (show: boolean) => void;
  fifaLabelsLabel: string;
  emptyFilteredMessage?: string;
}

const WIDTH = 600;
const HEIGHT = 280;
const HEIGHT_NARROW = 340;
const HEIGHT_PHONE = 420;
const MARGIN = { top: 20, right: 16, bottom: 44, left: 58 };
const MARGIN_NARROW = { top: 16, right: 12, bottom: 48, left: 48 };
const MARGIN_PHONE = { top: 18, right: 12, bottom: 58, left: 58 };
const DOT_RADIUS = 6;
const DOT_RADIUS_PHONE = 9.5;
const FIFA_LABEL_OFFSET_Y = 12;
const FIFA_LABEL_OFFSET_Y_PHONE = 16;
const TOOLTIP_OFFSET_X = 14;

function fifaPointsDomain(values: number[]): { min: number; max: number } {
  if (values.length === 0) {
    return { min: 0, max: 100 };
  }

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = Math.max(40, (maxVal - minVal) * 0.06);

  return {
    min: Math.max(0, Math.floor((minVal - padding) / 50) * 50),
    max: Math.ceil((maxVal + padding) / 50) * 50,
  };
}

function tickStep(min: number, max: number): number {
  const range = max - min;
  if (range <= 200) return 50;
  if (range <= 500) return 100;
  return 200;
}

function generateTicks(min: number, max: number): number[] {
  const step = tickStep(min, max);
  const ticks: number[] = [];
  const start = Math.ceil(min / step) * step;

  for (let value = start; value <= max; value += step) {
    ticks.push(value);
  }

  return ticks;
}

export function OpponentDifficultyScatterChart<TTooltip>({
  points,
  domainPoints,
  referenceLines,
  verticalReferenceLines = [],
  ariaLabel,
  referenceLegend,
  footnote,
  xAxisLabel,
  yAxisLabel,
  renderPointTooltip,
  wonLabel,
  lostLabel,
  showWon,
  showLost,
  onToggleWon,
  onToggleLost,
  query,
  onQueryChange,
  searchPlaceholder,
  searchLabel,
  showFifaLabels,
  onShowFifaLabelsChange,
  fifaLabelsLabel,
  emptyFilteredMessage,
}: OpponentDifficultyScatterChartProps<TTooltip>) {
  const isDesktop = useMinWidthLg();
  const isMdUp = useMinWidthMd();
  const isPhone = !isMdUp;
  const height = isDesktop ? HEIGHT : isPhone ? HEIGHT_PHONE : HEIGHT_NARROW;
  const margin = isDesktop ? MARGIN : isPhone ? MARGIN_PHONE : MARGIN_NARROW;
  const dotRadius = isPhone ? DOT_RADIUS_PHONE : DOT_RADIUS;
  const fifaLabelOffsetY = isPhone
    ? FIFA_LABEL_OFFSET_Y_PHONE
    : FIFA_LABEL_OFFSET_Y;
  const tickLabelClass = isPhone
    ? "fill-muted-foreground text-[14px]"
    : "fill-muted-foreground text-[9px]";
  const axisLabelClass = isPhone
    ? "fill-muted-foreground text-[12px] uppercase tracking-wide"
    : "fill-muted-foreground text-[6px] uppercase tracking-wide";
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    point: OpponentDifficultyScatterPoint<TTooltip>;
    x: number;
    y: number;
  } | null>(null);

  const showPoint = useCallback(
    (
      point: OpponentDifficultyScatterPoint<TTooltip>,
      cx: number,
      cy: number,
      svgElement: SVGSVGElement | null,
    ) => {
      if (!svgElement) return;
      const screen = svgCoordsToScreen(svgElement, cx, cy);
      if (!screen) return;

      setHoveredPoint({
        point,
        x: screen.x,
        y: screen.y,
      });
    },
    [],
  );

  const hideTooltip = useCallback(() => {
    setHoveredPoint(null);
  }, []);

  if (domainPoints.length === 0) return null;

  const xValues = [
    ...domainPoints.map((point) => point.teamFifaPoints),
    ...verticalReferenceLines.map((line) => line.value),
  ];
  const xDomain = fifaPointsDomain(xValues);
  const yValues = [
    ...domainPoints.map((point) => point.rivalDifficultyPoints),
    ...referenceLines.map((line) => line.value),
  ];
  const yDomain = fifaPointsDomain(yValues);

  const chartWidth = WIDTH - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const baselineX = margin.left;
  const baselineY = height - margin.bottom;

  const xScale = (value: number) =>
    baselineX +
    ((value - xDomain.min) / Math.max(xDomain.max - xDomain.min, 1)) *
      chartWidth;

  const yScale = (value: number) =>
    margin.top +
    chartHeight -
    ((value - yDomain.min) / Math.max(yDomain.max - yDomain.min, 1)) *
      chartHeight;

  const xTicks = generateTicks(xDomain.min, xDomain.max);
  const yTicks = generateTicks(yDomain.min, yDomain.max);

  return (
    <figure className="min-w-0 overflow-hidden rounded-xl border border-white/8 bg-black/10 p-3">
      <figcaption className="mb-3 flex flex-col gap-2 text-[11px] text-muted-foreground lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-x-3 lg:gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
          <button
            type="button"
            role="switch"
            aria-checked={showWon}
            onClick={onToggleWon}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 font-medium transition-colors",
              showWon
                ? "border-wc-green/40 bg-wc-green/15 text-white hover:bg-wc-green/25"
                : "border-white/10 bg-transparent text-muted-foreground/50 opacity-60 hover:border-white/20 hover:opacity-100",
            )}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-wc-green/85" />
            {wonLabel}
          </button>
          <button
            type="button"
            role="switch"
            aria-checked={showLost}
            onClick={onToggleLost}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 font-medium transition-colors",
              showLost
                ? "border-wc-red/40 bg-wc-red/15 text-white hover:bg-wc-red/25"
                : "border-white/10 bg-transparent text-muted-foreground/50 opacity-60 hover:border-white/20 hover:opacity-100",
            )}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-wc-red/80" />
            {lostLabel}
          </button>
          {referenceLegend}
        </div>

        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:ml-auto lg:gap-3">
          {/* Removable: FIFA label toggle — delete with scatter-fifa-labels.tsx */}
          <label className="flex cursor-pointer items-center gap-2 text-[11px] text-muted-foreground">
            <Switch
              checked={showFifaLabels}
              onChange={() => onShowFifaLabelsChange(!showFifaLabels)}
              size="sm"
              accent="sky"
            />
            <span>{fifaLabelsLabel}</span>
          </label>
          <div className="w-full max-w-full sm:w-40 sm:shrink-0">
            <TableSearchInput
              value={query}
              onChange={onQueryChange}
              placeholder={searchPlaceholder}
              label={searchLabel}
              size="sm"
            />
          </div>
        </div>
      </figcaption>

      <div className="relative min-w-0">
        <svg
          ref={svgRef}
          width={WIDTH}
          height={height}
          viewBox={`0 0 ${WIDTH} ${height}`}
          className="block h-auto w-full"
          role="img"
          aria-label={ariaLabel}
          onMouseLeave={hideTooltip}
        >
          <line
            x1={baselineX}
            x2={WIDTH - margin.right}
            y1={baselineY}
            y2={baselineY}
            className="stroke-white/15"
          />
          <line
            x1={baselineX}
            x2={baselineX}
            y1={margin.top}
            y2={baselineY}
            className="stroke-white/15"
          />

          {xTicks.map((tick) => (
            <g key={`x-${tick}`}>
              <line
                x1={xScale(tick)}
                x2={xScale(tick)}
                y1={baselineY}
                y2={baselineY + 4}
                className="stroke-white/20"
              />
              <text
                x={xScale(tick)}
                y={baselineY + 16}
                textAnchor="middle"
                className={tickLabelClass}
              >
                {formatWholeNumber(tick)}
              </text>
            </g>
          ))}

          {yTicks.map((tick) => (
            <g key={`y-${tick}`}>
              <line
                x1={baselineX - 4}
                x2={baselineX}
                y1={yScale(tick)}
                y2={yScale(tick)}
                className="stroke-white/20"
              />
              <text
                x={baselineX - 8}
                y={yScale(tick) + 3}
                textAnchor="end"
                className={tickLabelClass}
              >
                {formatWholeNumber(tick)}
              </text>
            </g>
          ))}

          {referenceLines.map((line) => (
            <g key={`h-${line.label}`}>
              <line
                x1={baselineX}
                x2={WIDTH - margin.right}
                y1={yScale(line.value)}
                y2={yScale(line.value)}
                stroke={line.stroke}
                strokeWidth={1}
                strokeDasharray={line.dash}
              />
            </g>
          ))}

          {verticalReferenceLines.map((line) => (
            <g key={`v-${line.label}`}>
              <line
                x1={xScale(line.value)}
                x2={xScale(line.value)}
                y1={margin.top}
                y2={baselineY}
                stroke={line.stroke}
                strokeWidth={1}
                strokeDasharray={line.dash}
              />
            </g>
          ))}

          {points.map((point) => {
            const cx = xScale(point.teamFifaPoints);
            const cy = yScale(point.rivalDifficultyPoints);

            return (
              <a key={point.id} href={point.href} className="cursor-pointer">
                <circle
                  cx={cx}
                  cy={cy}
                  r={dotRadius}
                  className={
                    point.won
                      ? "fill-wc-green/85 transition-opacity hover:opacity-90"
                      : "fill-wc-red/80 transition-opacity hover:opacity-90"
                  }
                  onMouseEnter={(event) =>
                    showPoint(
                      point,
                      cx,
                      cy,
                      event.currentTarget.ownerSVGElement,
                    )
                  }
                  onFocus={(event) =>
                    showPoint(
                      point,
                      cx,
                      cy,
                      event.currentTarget.ownerSVGElement,
                    )
                  }
                  onBlur={hideTooltip}
                  tabIndex={0}
                  role="img"
                />
              </a>
            );
          })}

          {showFifaLabels ? (
            <OpponentDifficultyScatterFifaLabels
              points={points.map((point) => ({
                id: point.id,
                fifaCode: point.fifaCode,
                cx: xScale(point.teamFifaPoints),
                cy: yScale(point.rivalDifficultyPoints),
              }))}
              offsetY={fifaLabelOffsetY}
            />
          ) : null}

          <text
            x={baselineX + chartWidth / 2}
            y={height - 6}
            textAnchor="middle"
            className={axisLabelClass}
          >
            {xAxisLabel}
          </text>
          <text
            x={8}
            y={margin.top + chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, 8, ${margin.top + chartHeight / 2})`}
            className={axisLabelClass}
          >
            {yAxisLabel}
          </text>
        </svg>

        {points.length === 0 && emptyFilteredMessage ? (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            {emptyFilteredMessage}
          </p>
        ) : null}

        {hoveredPoint && typeof document !== "undefined"
          ? createPortal(
              <div
                className="pointer-events-none fixed z-[120] transition-opacity duration-150"
                style={{
                  left: hoveredPoint.x,
                  top: hoveredPoint.y,
                  transform: `translate(${TOOLTIP_OFFSET_X}px, -50%)`,
                }}
              >
                {renderPointTooltip(hoveredPoint.point.tooltipData)}
              </div>,
              document.body,
            )
          : null}
      </div>

      <div className="mt-2 space-y-1">{footnote}</div>
    </figure>
  );
}
