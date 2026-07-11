"use client";

import type { Team } from "@/lib/types";
import type { OpponentPointsObservation } from "@/lib/domain/path-opponent-observations";
import { TeamFlag } from "@/components/team-flag";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CHART_COLORS } from "@/lib/chart-colors";

export interface SimulatedPathSeries {
  opponents: OpponentPointsObservation[];
  avgOpponentPoints: number | null;
  barColor: string;
  avgColor: string;
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
  title: string;
  teamPointsLegend: string;
  opponentPathLegend: string;
  matchLabel: string;
  ariaLabel: string;
  className?: string;
}

const WIDTH = 720;
const BASE_HEIGHT = 300;
const BASE_MARGIN = { top: 20, right: 24, bottom: 48, left: 58 };
const COMPARISON_BOTTOM_MARGIN = 70;

function getChartLayout(hasComparison: boolean) {
  return {
    height: BASE_HEIGHT,
    margin: {
      ...BASE_MARGIN,
      bottom: hasComparison ? COMPARISON_BOTTOM_MARGIN : BASE_MARGIN.bottom,
    },
  };
}

export function SimulatedPathPointsChart({
  focusTeam,
  teamPoints,
  actual,
  simulated,
  comparison,
  title,
  teamPointsLegend,
  opponentPathLegend,
  matchLabel,
  ariaLabel,
  className = "",
}: SimulatedPathPointsChartProps) {
  const slotCount = Math.max(
    actual.opponents.length,
    simulated.opponents.length,
    comparison?.opponents.length ?? 0,
    1,
  );
  const seriesCount = comparison ? 3 : 2;
  const { height, margin } = getChartLayout(Boolean(comparison));
  const chartWidth = WIDTH - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const slotWidth = chartWidth / slotCount;
  const barWidth = Math.min(
    comparison ? 28 : 44,
    slotWidth * (comparison ? 0.72 : 0.62),
  );
  const overlapShift = barWidth * 0.28;

  const allValues = [
    ...actual.opponents.map(({ points }) => points),
    ...simulated.opponents.map(({ points }) => points),
    ...(comparison?.opponents.map(({ points }) => points) ?? []),
    teamPoints,
    actual.avgOpponentPoints,
    simulated.avgOpponentPoints,
    comparison?.avgOpponentPoints ?? null,
  ].filter((value): value is number => value !== null);

  if (allValues.length === 0) {
    return null;
  }

  const scaleMax = Math.max(...allValues);
  const domainMax = Math.ceil(scaleMax / 250) * 250;
  const y = (value: number) =>
    margin.top + chartHeight - (value / domainMax) * chartHeight;
  const slotCenter = (index: number) =>
    margin.left + slotWidth * index + slotWidth / 2;
  const ticks = [0, domainMax / 2, domainMax];
  const labelInsetLeft = `${(margin.left / WIDTH) * 100}%`;
  const labelInsetRight = `${(margin.right / WIDTH) * 100}%`;
  const labelHeight = `${(margin.bottom / height) * 100}%`;
  const barBottom = y(0);

  const barShifts =
    seriesCount === 3
      ? [-overlapShift, 0, overlapShift]
      : [-overlapShift / 2, overlapShift / 2];

  function LegendLineItem({
    color,
    dashed,
    label,
    team,
  }: {
    color: string;
    dashed?: boolean;
    label: string;
    team?: Pick<Team, "id" | "flagUrl" | "displayName">;
  }) {
    return (
      <span className="flex items-center gap-1.5" style={{ color }}>
        <span
          className="inline-block w-5 border-t"
          style={{
            borderColor: color,
            borderTopStyle: dashed ? "dashed" : "solid",
          }}
        />
        {team ? <TeamFlag team={team} size="sm" /> : null}
        <span className="font-mono text-[10px] font-semibold">{label}</span>
      </span>
    );
  }

  function LegendBarItem({
    color,
    label,
  }: {
    color: string;
    label: string;
  }) {
    return (
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span
          className="inline-block h-2.5 w-3 rounded-sm"
          style={{ backgroundColor: color }}
        />
        <span className="text-[10px] font-semibold">{label}</span>
      </span>
    );
  }

  function renderBar(
    opponent: OpponentPointsObservation,
    index: number,
    fill: string,
    shift: number,
    key: string,
  ) {
    const x = slotCenter(index) - barWidth / 2 + shift;
    const barTop = y(opponent.points);

    return (
      <g key={key}>
        <rect
          x={x}
          y={barTop}
          width={barWidth}
          height={barBottom - barTop}
          rx={5}
          fill={fill}
          fillOpacity={0.82}
        >
          <title>
            {opponent.displayName}: {formatFifaPoints(opponent.points)}
          </title>
        </rect>
      </g>
    );
  }

  const barSeries = [
    { opponents: actual.opponents, color: actual.barColor, shift: barShifts[0] },
    {
      opponents: simulated.opponents,
      color: simulated.barColor,
      shift: barShifts[1],
    },
    ...(comparison
      ? [
          {
            opponents: comparison.opponents,
            color: comparison.barColor,
            shift: barShifts[2],
          },
        ]
      : []),
  ];

  const avgLines = [
    { value: actual.avgOpponentPoints, color: actual.avgColor },
    { value: simulated.avgOpponentPoints, color: simulated.avgColor },
    ...(comparison
      ? [{ value: comparison.avgOpponentPoints, color: comparison.avgColor }]
      : []),
  ];

  function OpponentSlotLabel({
    opponent,
    color,
    changed,
  }: {
    opponent: OpponentPointsObservation | undefined;
    color: string;
    changed?: boolean;
  }) {
    if (!opponent) {
      return <span className="text-[9px] text-muted-foreground/50">—</span>;
    }

    return (
      <div
        className={cn(
          "flex flex-col items-center gap-0.5",
          changed && "rounded-md ring-1 ring-wc-orange/40",
        )}
      >
        <TeamFlag
          team={{
            id: opponent.teamId,
            flagUrl: opponent.flagUrl,
            displayName: opponent.displayName,
          }}
          size="sm"
        />
        <span className="font-mono text-[9px] font-semibold" style={{ color }}>
          {opponent.teamId}
        </span>
      </div>
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
          <LegendLineItem
            color={CHART_COLORS.selectedTeam}
            team={focusTeam}
            label={teamPointsLegend}
          />
          {avgLines.map((line, index) =>
            line.value !== null ? (
              <LegendLineItem
                key={`avg-${index}`}
                color={line.color}
                dashed
                label={
                  index === 0
                    ? actual.legendLabel
                    : index === 1
                      ? simulated.legendLabel
                      : (comparison?.legendLabel ?? "")
                }
              />
            ) : null,
          )}
          <span className="flex items-center gap-2">
            {barSeries.map((series, index) => (
              <LegendBarItem
                key={`bar-legend-${index}`}
                color={series.color}
                label={
                  index === 0
                    ? actual.legendLabel
                    : index === 1
                      ? simulated.legendLabel
                      : (comparison?.legendLabel ?? "")
                }
              />
            ))}
            <span className="text-[10px]">{opponentPathLegend}</span>
          </span>
        </span>
      </figcaption>

      <div className="relative">
        <svg
          className="h-auto w-full"
          viewBox={`0 0 ${WIDTH} ${height}`}
          role="img"
          aria-label={ariaLabel}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={margin.left}
                x2={WIDTH - margin.right}
                y1={y(tick)}
                y2={y(tick)}
                className="stroke-white/10"
              />
              <text
                x={margin.left - 9}
                y={y(tick) + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[8px]"
              >
                {Math.round(tick).toLocaleString()}
              </text>
            </g>
          ))}

          {teamPoints !== null && (
            <line
              x1={margin.left}
              x2={WIDTH - margin.right}
              y1={y(teamPoints)}
              y2={y(teamPoints)}
              stroke={CHART_COLORS.selectedTeam}
              strokeWidth={1}
            />
          )}

          {avgLines.map(
            (line, index) =>
              line.value !== null && (
                <line
                  key={`avg-line-${index}`}
                  x1={margin.left}
                  x2={WIDTH - margin.right}
                  y1={y(line.value)}
                  y2={y(line.value)}
                  stroke={line.color}
                  strokeWidth={1}
                  strokeDasharray="7 5"
                />
              ),
          )}

          {barSeries.flatMap((series, seriesIndex) =>
            Array.from({ length: slotCount }, (_, index) => {
              const opponent = series.opponents[index];
              if (!opponent) return null;
              return renderBar(
                opponent,
                index,
                series.color,
                series.shift,
                `bar-${seriesIndex}-${opponent.teamId}-${index}`,
              );
            }),
          )}
        </svg>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 flex"
          style={{
            paddingLeft: labelInsetLeft,
            paddingRight: labelInsetRight,
            height: labelHeight,
          }}
        >
          {Array.from({ length: slotCount }, (_, index) => {
            const actualOpponent = actual.opponents[index];
            const simulatedOpponent = simulated.opponents[index];
            const comparisonOpponent = comparison?.opponents[index];
            const opponentChanged =
              actualOpponent &&
              simulatedOpponent &&
              actualOpponent.teamId !== simulatedOpponent.teamId;

            return (
              <div
                key={`slot-${index}`}
                className="flex flex-1 flex-col items-center justify-start gap-0.5 pt-0.5"
              >
                <span className="font-mono text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {matchLabel} {index + 1}
                </span>
                <div className="flex flex-col items-center gap-0.5">
                  <OpponentSlotLabel
                    opponent={actualOpponent}
                    color={actual.barColor}
                  />
                  <OpponentSlotLabel
                    opponent={simulatedOpponent}
                    color={simulated.barColor}
                    changed={Boolean(opponentChanged)}
                  />
                  {comparison && (
                    <OpponentSlotLabel
                      opponent={comparisonOpponent}
                      color={comparison.barColor}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </figure>
  );
}
