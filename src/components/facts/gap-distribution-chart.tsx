"use client";

import {
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { CHART_COLORS } from "@/lib/chart-colors";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";

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
  renderPointTooltip?: (point: GapChartPoint) => ReactNode;
}

const WIDTH = 640;
const HEIGHT = 120;
const MARGIN = { top: 16, right: 16, bottom: 28, left: 16 };
const DOT_RADIUS = 5;
const DOT_RADIUS_HOVERED = 6.5;
const HIT_RADIUS = 10;

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

export function GapDistributionChart({
  points,
  mean,
  stdDev,
  ariaLabel,
  legend,
  footnotes,
  renderPointTooltip,
}: GapDistributionChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    point: GapChartPoint;
    x: number;
    y: number;
  } | null>(null);

  const showPoint = useCallback(
    (
      point: GapChartPoint,
      cx: number,
      cy: number,
      svgElement: SVGSVGElement | null,
    ) => {
      if (!renderPointTooltip || !svgElement) return;
      const screen = svgCoordsToScreen(svgElement, cx, cy);
      if (!screen) return;

      setHoveredPoint({
        point,
        x: screen.x,
        y: screen.y,
      });
    },
    [renderPointTooltip],
  );

  const hideTooltip = useCallback(() => {
    setHoveredPoint(null);
  }, []);

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

      <div className="relative" onMouseLeave={hideTooltip}>
        <svg
          className="h-auto w-full"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={ariaLabel}
          onMouseLeave={hideTooltip}
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
            const isHovered = hoveredPoint?.point.id === point.id;

            return (
              <g
                key={point.id}
                className={cn(renderPointTooltip && "cursor-pointer")}
                onMouseEnter={(event) =>
                  showPoint(
                    point,
                    cx,
                    cy,
                    event.currentTarget.ownerSVGElement,
                  )
                }
                onMouseMove={(event) =>
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
                tabIndex={renderPointTooltip ? 0 : undefined}
                role={renderPointTooltip ? "button" : undefined}
                aria-label={point.tooltip}
              >
                {point.showOutlierRing && (
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
                {renderPointTooltip ? (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={HIT_RADIUS}
                    fill="transparent"
                  />
                ) : null}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? DOT_RADIUS_HOVERED : DOT_RADIUS}
                  className={cn(
                    point.dotClassName,
                    "transition-all duration-150",
                    isHovered && "stroke-white/70",
                  )}
                  strokeWidth={isHovered ? 1.5 : 0}
                >
                  {!renderPointTooltip ? (
                    <title>{point.tooltip}</title>
                  ) : null}
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

        {hoveredPoint &&
        renderPointTooltip &&
        typeof document !== "undefined"
          ? createPortal(
              <div
                className="pointer-events-none fixed z-[120] transition-opacity duration-150"
                style={{
                  left: hoveredPoint.x,
                  top: hoveredPoint.y,
                  transform: "translate(-50%, calc(-100% - 14px))",
                }}
              >
                {renderPointTooltip(hoveredPoint.point)}
              </div>,
              document.body,
            )
          : null}
      </div>

      {footnotes}
    </figure>
  );
}
