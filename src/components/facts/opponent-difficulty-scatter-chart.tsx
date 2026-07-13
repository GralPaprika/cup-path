"use client";

import {
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { formatWholeNumber } from "@/lib/format";

export interface OpponentDifficultyScatterPoint<TTooltip = unknown> {
  id: string;
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
  points: OpponentDifficultyScatterPoint<TTooltip>[];
  referenceLines: OpponentDifficultyReferenceLine[];
  ariaLabel: string;
  legend: ReactNode;
  footnote: ReactNode;
  xAxisLabel: string;
  yAxisLabel: string;
  renderPointTooltip: (data: TTooltip) => ReactNode;
}

const WIDTH = 600;
const HEIGHT = 280;
const MARGIN = { top: 20, right: 16, bottom: 44, left: 58 };
const DOT_RADIUS = 6;
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

export function OpponentDifficultyScatterChart<TTooltip>({
  points,
  referenceLines,
  ariaLabel,
  legend,
  footnote,
  xAxisLabel,
  yAxisLabel,
  renderPointTooltip,
}: OpponentDifficultyScatterChartProps<TTooltip>) {
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

  if (points.length === 0) return null;

  const xDomain = fifaPointsDomain(points.map((point) => point.teamFifaPoints));
  const yValues = [
    ...points.map((point) => point.rivalDifficultyPoints),
    ...referenceLines.map((line) => line.value),
  ];
  const yDomain = fifaPointsDomain(yValues);

  const chartWidth = WIDTH - MARGIN.left - MARGIN.right;
  const chartHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const baselineX = MARGIN.left;
  const baselineY = HEIGHT - MARGIN.bottom;

  const xScale = (value: number) =>
    baselineX +
    ((value - xDomain.min) / Math.max(xDomain.max - xDomain.min, 1)) *
      chartWidth;

  const yScale = (value: number) =>
    MARGIN.top +
    chartHeight -
    ((value - yDomain.min) / Math.max(yDomain.max - yDomain.min, 1)) *
      chartHeight;

  const xTicks = generateTicks(xDomain.min, xDomain.max);
  const yTicks = generateTicks(yDomain.min, yDomain.max);

  return (
    <figure className="overflow-hidden rounded-xl border border-white/8 bg-black/10 p-3">
      <figcaption className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        {legend}
      </figcaption>

      <div className="relative">
        <svg
          ref={svgRef}
          width={WIDTH}
          height={HEIGHT}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="block h-auto w-full"
          role="img"
          aria-label={ariaLabel}
          onMouseLeave={hideTooltip}
        >
          <line
            x1={baselineX}
            x2={WIDTH - MARGIN.right}
            y1={baselineY}
            y2={baselineY}
            className="stroke-white/15"
          />
          <line
            x1={baselineX}
            x2={baselineX}
            y1={MARGIN.top}
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
                className="fill-muted-foreground text-[9px]"
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
                className="fill-muted-foreground text-[9px]"
              >
                {formatWholeNumber(tick)}
              </text>
            </g>
          ))}

          {referenceLines.map((line) => (
            <g key={line.label}>
              <line
                x1={baselineX}
                x2={WIDTH - MARGIN.right}
                y1={yScale(line.value)}
                y2={yScale(line.value)}
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
                  r={DOT_RADIUS}
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

          <text
            x={baselineX + chartWidth / 2}
            y={HEIGHT - 6}
            textAnchor="middle"
            className="fill-muted-foreground text-[6px] uppercase tracking-wide"
          >
            {xAxisLabel}
          </text>
          <text
            x={8}
            y={MARGIN.top + chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, 8, ${MARGIN.top + chartHeight / 2})`}
            className="fill-muted-foreground text-[6px] uppercase tracking-wide"
          >
            {yAxisLabel}
          </text>
        </svg>

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
