"use client";

import type { Team } from "@/lib/types";
import type { OpponentPointsObservation } from "@/lib/domain/path/path-opponent-observations";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PATH_CHART_HEIGHT, PATH_CHART_WIDTH } from "@/components/path-points-chart/constants";
import {
  buildPathChartScale,
  collectNumericValues,
  computeBarGeometry,
  opponentSlotCount,
  type PathChartBarSeries,
} from "@/components/path-points-chart/layout";
import {
  PathChartLegendBarItem,
  PathChartLegendLineItem,
} from "@/components/path-points-chart/legend-items";
import { MatchSlotLabelGrid } from "@/components/path-points-chart/match-slot-label-grid";
import { OpponentBar } from "@/components/path-points-chart/opponent-bar";

export interface SimulatedPathSeries {
  opponents: OpponentPointsObservation[];
  avgOpponentPoints: number | null;
  barColor: string;
  avgColor: string;
  /** Legend + dotted avg accent (may differ from bar fill for black kits). */
  accent?: string;
  outline?: string | null;
  legendLabel: string;
}

interface SimulatedPathPointsChartProps {
  focusTeam: Pick<Team, "id" | "displayName" | "flagUrl">;
  teamPoints: number | null;
  actual: SimulatedPathSeries;
  simulated: SimulatedPathSeries;
  comparison?: SimulatedPathSeries & {
    team: Pick<Team, "id" | "displayName" | "flagUrl">;
  };
  /** Focus-team FIFA points line; defaults to actual bar color. */
  teamPointsLineColor?: string;
  title: string;
  teamPointsLegend: string;
  opponentPathLegend: string;
  matchLabel: string;
  ariaLabel: string;
  className?: string;
}

function ReferenceLine({
  y,
  color,
  dashed,
  x1,
  x2,
}: {
  y: number;
  color: string;
  dashed?: boolean;
  x1: number;
  x2: number;
}) {
  return (
    <line
      x1={x1}
      x2={x2}
      y1={y}
      y2={y}
      stroke={color}
      strokeWidth={1}
      strokeDasharray={dashed ? "7 5" : undefined}
    />
  );
}

export function SimulatedPathPointsChart({
  focusTeam,
  teamPoints,
  actual,
  simulated,
  comparison,
  teamPointsLineColor,
  title,
  teamPointsLegend,
  opponentPathLegend,
  matchLabel,
  ariaLabel,
  className = "",
}: SimulatedPathPointsChartProps) {
  const pointsLineColor = teamPointsLineColor ?? actual.barColor;
  const slotCount = opponentSlotCount(
    actual.opponents,
    simulated.opponents,
    comparison?.opponents,
  );
  const scale = buildPathChartScale(
    collectNumericValues([
      ...actual.opponents.map(({ points }) => points),
      ...simulated.opponents.map(({ points }) => points),
      ...(comparison?.opponents.map(({ points }) => points) ?? []),
      teamPoints,
      actual.avgOpponentPoints,
      simulated.avgOpponentPoints,
      comparison?.avgOpponentPoints,
    ]),
    slotCount,
  );

  if (!scale) return null;

  const barSeries: PathChartBarSeries[] = [
    {
      opponents: actual.opponents,
      color: actual.barColor,
      outline: actual.outline,
      legendLabel: actual.legendLabel,
      barTitle: defaultBarTitle,
    },
    {
      opponents: simulated.opponents,
      color: simulated.barColor,
      outline: simulated.outline,
      legendLabel: simulated.legendLabel,
      barTitle: defaultBarTitle,
    },
    ...(comparison
      ? [
          {
            opponents: comparison.opponents,
            color: comparison.barColor,
            outline: comparison.outline,
            legendLabel: comparison.legendLabel,
            barTitle: defaultBarTitle,
          },
        ]
      : []),
  ];
  const { barWidth, getBarShift } = computeBarGeometry(
    scale.slotWidth,
    barSeries.length,
  );

  const avgLines = [
    {
      value: actual.avgOpponentPoints,
      color: actual.avgColor,
      accent: actual.accent ?? actual.avgColor,
      legendLabel: actual.legendLabel,
    },
    {
      value: simulated.avgOpponentPoints,
      color: simulated.avgColor,
      accent: simulated.accent ?? simulated.avgColor,
      legendLabel: simulated.legendLabel,
    },
    ...(comparison
      ? [
          {
            value: comparison.avgOpponentPoints,
            color: comparison.avgColor,
            accent: comparison.accent ?? comparison.avgColor,
            legendLabel: comparison.legendLabel,
          },
        ]
      : []),
  ];

  function isSlotChanged(slotIndex: number): boolean {
    const actualOpponent = actual.opponents[slotIndex];
    const simulatedOpponent = simulated.opponents[slotIndex];
    return Boolean(
      actualOpponent &&
        simulatedOpponent &&
        actualOpponent.teamId !== simulatedOpponent.teamId,
    );
  }

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-xl border border-white/8 bg-black/10 p-3",
        className,
      )}
    >
      <figcaption className="mb-1.5 flex flex-wrap items-center justify-between gap-2 px-1">
        <span className="text-sm font-semibold text-white">{title}</span>
        <span className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <PathChartLegendLineItem
            color={pointsLineColor}
            team={focusTeam}
            label={teamPointsLegend}
          />
          {avgLines.map((line) =>
            line.value !== null ? (
              <PathChartLegendLineItem
                key={`avg-${line.legendLabel}`}
                color={line.accent}
                dashed
                label={line.legendLabel}
              />
            ) : null,
          )}
          <span className="flex items-center gap-2">
            {barSeries.map((series) => (
              <PathChartLegendBarItem
                key={`bar-legend-${series.legendLabel}`}
                color={series.color}
                outline={series.outline}
                label={series.legendLabel}
              />
            ))}
            <span className="text-[10px]">{opponentPathLegend}</span>
          </span>
        </span>
      </figcaption>

      <div>
        <svg
          className="h-auto w-full"
          viewBox={`0 0 ${PATH_CHART_WIDTH} ${PATH_CHART_HEIGHT}`}
          role="img"
          aria-label={ariaLabel}
        >
          {scale.ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={scale.margin.left}
                x2={PATH_CHART_WIDTH - scale.margin.right}
                y1={scale.y(tick)}
                y2={scale.y(tick)}
                className="stroke-white/10"
              />
              <text
                x={scale.margin.left - 9}
                y={scale.y(tick) + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[8px]"
              >
                {Math.round(tick).toLocaleString()}
              </text>
            </g>
          ))}

          {teamPoints !== null && (
            <ReferenceLine
              y={scale.y(teamPoints)}
              color={pointsLineColor}
              x1={scale.margin.left}
              x2={PATH_CHART_WIDTH - scale.margin.right}
            />
          )}

          {avgLines.map(
            (line) =>
              line.value !== null && (
                <ReferenceLine
                  key={`avg-line-${line.legendLabel}`}
                  y={scale.y(line.value)}
                  color={line.color}
                  dashed
                  x1={scale.margin.left}
                  x2={PATH_CHART_WIDTH - scale.margin.right}
                />
              ),
          )}

          {barSeries.flatMap((series, seriesIndex) =>
            Array.from({ length: slotCount }, (_, slotIndex) => {
              const opponent = series.opponents[slotIndex];
              if (!opponent) return null;

              return (
                <OpponentBar
                  key={`bar-${seriesIndex}-${opponent.teamId}-${slotIndex}`}
                  barKey={`bar-${seriesIndex}-${opponent.teamId}-${slotIndex}`}
                  opponent={opponent}
                  fill={series.color}
                  outline={series.outline}
                  barWidth={barWidth}
                  x={scale.slotCenter(slotIndex) - barWidth / 2 + getBarShift(seriesIndex)}
                  barTop={scale.y(opponent.points)}
                  barBottom={scale.barBottom}
                  title={
                    series.barTitle?.(opponent) ??
                    `${opponent.displayName}: ${formatFifaPoints(opponent.points)}`
                  }
                />
              );
            }),
          )}
        </svg>

        <MatchSlotLabelGrid
          slotCount={slotCount}
          series={barSeries}
          matchLabel={matchLabel}
          labelInsetLeft={scale.labelInsetLeft}
          labelInsetRight={scale.labelInsetRight}
          isSlotChanged={isSlotChanged}
        />
      </div>
    </figure>
  );
}

function defaultBarTitle(opponent: OpponentPointsObservation): string {
  return `${opponent.displayName}: ${formatFifaPoints(opponent.points)}`;
}
