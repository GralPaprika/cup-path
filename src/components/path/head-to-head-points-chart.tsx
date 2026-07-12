"use client";

import type { Team } from "@/lib/types";
import type { OpponentPointsObservation } from "@/lib/domain/path/path-opponent-observations";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CHART_COLORS } from "@/lib/chart-colors";
import { PATH_CHART_HEIGHT, PATH_CHART_WIDTH } from "@/components/path-points-chart/constants";
import {
  buildPathChartScale,
  collectNumericValues,
  computeBarGeometry,
  opponentSlotCount,
  type PathChartBarSeries,
} from "@/components/path-points-chart/layout";
import {
  PathChartLegendLineItem,
} from "@/components/path-points-chart/legend-items";
import { MatchSlotLabelGrid } from "@/components/path-points-chart/match-slot-label-grid";
import { OpponentBar } from "@/components/path-points-chart/opponent-bar";

export interface HeadToHeadPathSeries {
  team: Pick<Team, "id" | "displayName" | "flagUrl">;
  teamPoints: number | null;
  avgOpponentPoints: number | null;
  opponents: OpponentPointsObservation[];
}

interface HeadToHeadPointsChartProps {
  seriesA: HeadToHeadPathSeries;
  seriesB: HeadToHeadPathSeries;
  title: string;
  teamPointsLegend: string;
  avgOpponentLegend: string;
  opponentPathLegend: string;
  matchLabel: string;
  ariaLabel: string;
  className?: string;
}

export function HeadToHeadPointsChart({
  seriesA,
  seriesB,
  title,
  teamPointsLegend,
  avgOpponentLegend,
  opponentPathLegend,
  matchLabel,
  ariaLabel,
  className = "",
}: HeadToHeadPointsChartProps) {
  const slotCount = opponentSlotCount(seriesA.opponents, seriesB.opponents);
  const scale = buildPathChartScale(
    collectNumericValues([
      ...seriesA.opponents.map(({ points }) => points),
      ...seriesB.opponents.map(({ points }) => points),
      seriesA.teamPoints,
      seriesB.teamPoints,
      seriesA.avgOpponentPoints,
      seriesB.avgOpponentPoints,
    ]),
    slotCount,
  );

  if (!scale) return null;

  const barSeries: PathChartBarSeries[] = [
    {
      opponents: seriesA.opponents,
      color: CHART_COLORS.selectedTeam,
      legendLabel: seriesA.team.id,
      barTitle: (opponent) =>
        `${seriesA.team.id} vs ${opponent.displayName}: ${formatFifaPoints(opponent.points)}`,
    },
    {
      opponents: seriesB.opponents,
      color: CHART_COLORS.comparisonTeam,
      legendLabel: seriesB.team.id,
      barTitle: (opponent) =>
        `${seriesB.team.id} vs ${opponent.displayName}: ${formatFifaPoints(opponent.points)}`,
    },
  ];
  const { barWidth, getBarShift } = computeBarGeometry(scale.slotWidth, barSeries.length);

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-xl border border-white/8 bg-black/10 p-3",
        className,
      )}
    >
      <figcaption className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
        <span className="text-sm font-semibold text-white">{title}</span>
        <span className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <PathChartLegendLineItem
            color={CHART_COLORS.selectedTeam}
            team={seriesA.team}
            label={teamPointsLegend}
          />
          <PathChartLegendLineItem
            color={CHART_COLORS.mean}
            dashed
            team={seriesA.team}
            label={avgOpponentLegend}
          />
          <PathChartLegendLineItem
            color={CHART_COLORS.comparisonTeam}
            team={seriesB.team}
            label={teamPointsLegend}
          />
          <PathChartLegendLineItem
            color={CHART_COLORS.comparisonAvg}
            dashed
            team={seriesB.team}
            label={avgOpponentLegend}
          />
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="inline-flex w-5 items-center -space-x-1.5" aria-hidden>
              <span
                className="inline-block h-2.5 w-3 rounded-sm"
                style={{ backgroundColor: CHART_COLORS.selectedTeam }}
              />
              <span
                className="inline-block h-2.5 w-3 rounded-sm"
                style={{ backgroundColor: CHART_COLORS.comparisonTeam }}
              />
            </span>
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

          {seriesA.teamPoints !== null && (
            <line
              x1={scale.margin.left}
              x2={PATH_CHART_WIDTH - scale.margin.right}
              y1={scale.y(seriesA.teamPoints)}
              y2={scale.y(seriesA.teamPoints)}
              stroke={CHART_COLORS.selectedTeam}
              strokeWidth={1}
            />
          )}
          {seriesB.teamPoints !== null && (
            <line
              x1={scale.margin.left}
              x2={PATH_CHART_WIDTH - scale.margin.right}
              y1={scale.y(seriesB.teamPoints)}
              y2={scale.y(seriesB.teamPoints)}
              stroke={CHART_COLORS.comparisonTeam}
              strokeWidth={1}
            />
          )}
          {seriesA.avgOpponentPoints !== null && (
            <line
              x1={scale.margin.left}
              x2={PATH_CHART_WIDTH - scale.margin.right}
              y1={scale.y(seriesA.avgOpponentPoints)}
              y2={scale.y(seriesA.avgOpponentPoints)}
              stroke={CHART_COLORS.mean}
              strokeWidth={1}
              strokeDasharray="7 5"
            />
          )}
          {seriesB.avgOpponentPoints !== null && (
            <line
              x1={scale.margin.left}
              x2={PATH_CHART_WIDTH - scale.margin.right}
              y1={scale.y(seriesB.avgOpponentPoints)}
              y2={scale.y(seriesB.avgOpponentPoints)}
              stroke={CHART_COLORS.comparisonAvg}
              strokeWidth={1}
              strokeDasharray="7 5"
            />
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
        />
      </div>
    </figure>
  );
}
