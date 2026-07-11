"use client";

import type { Team } from "@/lib/types";
import type { OpponentPointsObservation } from "@/lib/domain/path-opponent-observations";
import { TeamFlag } from "@/components/team-flag";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CHART_COLORS } from "@/lib/chart-colors";

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

const WIDTH = 720;
const HEIGHT = 300;
const MARGIN = { top: 24, right: 24, bottom: 52, left: 58 };

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
  const slotCount = Math.max(seriesA.opponents.length, seriesB.opponents.length, 1);
  const chartWidth = WIDTH - MARGIN.left - MARGIN.right;
  const chartHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const slotWidth = chartWidth / slotCount;
  const barWidth = Math.min(44, slotWidth * 0.62);
  const overlapShift = barWidth * 0.22;

  const allValues = [
    ...seriesA.opponents.map(({ points }) => points),
    ...seriesB.opponents.map(({ points }) => points),
    seriesA.teamPoints,
    seriesB.teamPoints,
    seriesA.avgOpponentPoints,
    seriesB.avgOpponentPoints,
  ].filter((value): value is number => value !== null);

  if (allValues.length === 0) {
    return null;
  }

  const scaleMax = Math.max(...allValues);
  const domainMax = Math.ceil(scaleMax / 250) * 250;
  const y = (value: number) =>
    MARGIN.top + chartHeight - (value / domainMax) * chartHeight;
  const slotCenter = (index: number) =>
    MARGIN.left + slotWidth * index + slotWidth / 2;
  const ticks = [0, domainMax / 2, domainMax];
  const labelInsetLeft = `${(MARGIN.left / WIDTH) * 100}%`;
  const labelInsetRight = `${(MARGIN.right / WIDTH) * 100}%`;
  const labelHeight = `${(MARGIN.bottom / HEIGHT) * 100}%`;
  const barBottom = y(0);

  function LegendLineItem({
    color,
    dashed,
    label,
    team,
  }: {
    color: string;
    dashed?: boolean;
    label: string;
    team: Pick<Team, "id" | "flagUrl" | "displayName">;
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
        <TeamFlag team={team} size="sm" />
        <span className="font-mono text-[10px] font-semibold">{label}</span>
      </span>
    );
  }

  function renderBar(
    opponent: OpponentPointsObservation,
    index: number,
    teamId: string,
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
            {teamId} vs {opponent.displayName}: {formatFifaPoints(opponent.points)}
          </title>
        </rect>
      </g>
    );
  }

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
          <LegendLineItem
            color={CHART_COLORS.selectedTeam}
            team={seriesA.team}
            label={teamPointsLegend}
          />
          <LegendLineItem
            color={CHART_COLORS.mean}
            dashed
            team={seriesA.team}
            label={avgOpponentLegend}
          />
          <LegendLineItem
            color={CHART_COLORS.comparisonTeam}
            team={seriesB.team}
            label={teamPointsLegend}
          />
          <LegendLineItem
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
            {opponentPathLegend}
          </span>
        </span>
      </figcaption>

      <div className="relative">
        <svg
          className="h-auto w-full"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={ariaLabel}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={MARGIN.left}
                x2={WIDTH - MARGIN.right}
                y1={y(tick)}
                y2={y(tick)}
                className="stroke-white/10"
              />
              <text
                x={MARGIN.left - 9}
                y={y(tick) + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[11px]"
              >
                {Math.round(tick).toLocaleString()}
              </text>
            </g>
          ))}

          {seriesA.teamPoints !== null && (
            <line
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={y(seriesA.teamPoints)}
              y2={y(seriesA.teamPoints)}
              stroke={CHART_COLORS.selectedTeam}
              strokeWidth={1}
            />
          )}
          {seriesB.teamPoints !== null && (
            <line
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={y(seriesB.teamPoints)}
              y2={y(seriesB.teamPoints)}
              stroke={CHART_COLORS.comparisonTeam}
              strokeWidth={1}
            />
          )}
          {seriesA.avgOpponentPoints !== null && (
            <line
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={y(seriesA.avgOpponentPoints)}
              y2={y(seriesA.avgOpponentPoints)}
              stroke={CHART_COLORS.mean}
              strokeWidth={1}
              strokeDasharray="7 5"
            />
          )}
          {seriesB.avgOpponentPoints !== null && (
            <line
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={y(seriesB.avgOpponentPoints)}
              y2={y(seriesB.avgOpponentPoints)}
              stroke={CHART_COLORS.comparisonAvg}
              strokeWidth={1}
              strokeDasharray="7 5"
            />
          )}

          {Array.from({ length: slotCount }, (_, index) => {
            const opponentB = seriesB.opponents[index];
            if (!opponentB) return null;
            return renderBar(
              opponentB,
              index,
              seriesB.team.id,
              CHART_COLORS.comparisonTeam,
              overlapShift,
              `b-bar-${opponentB.teamId}-${index}`,
            );
          })}

          {Array.from({ length: slotCount }, (_, index) => {
            const opponentA = seriesA.opponents[index];
            if (!opponentA) return null;
            return renderBar(
              opponentA,
              index,
              seriesA.team.id,
              CHART_COLORS.selectedTeam,
              -overlapShift,
              `a-bar-${opponentA.teamId}-${index}`,
            );
          })}
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
            const opponentA = seriesA.opponents[index];
            const opponentB = seriesB.opponents[index];

            return (
              <div
                key={`slot-${index}`}
                className="flex flex-1 flex-col items-center justify-start gap-1 pt-2"
              >
                <span className="font-mono text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {matchLabel} {index + 1}
                </span>
                <div className="flex flex-col items-center gap-1">
                  {opponentA ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <TeamFlag
                        team={{
                          id: opponentA.teamId,
                          flagUrl: opponentA.flagUrl,
                          displayName: opponentA.displayName,
                        }}
                        size="sm"
                      />
                      <span
                        className="font-mono text-[9px] font-semibold"
                        style={{ color: CHART_COLORS.selectedTeam }}
                      >
                        {opponentA.teamId}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[9px] text-muted-foreground/50">—</span>
                  )}
                  {opponentB ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <TeamFlag
                        team={{
                          id: opponentB.teamId,
                          flagUrl: opponentB.flagUrl,
                          displayName: opponentB.displayName,
                        }}
                        size="sm"
                      />
                      <span
                        className="font-mono text-[9px] font-semibold"
                        style={{ color: CHART_COLORS.comparisonTeam }}
                      >
                        {opponentB.teamId}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[9px] text-muted-foreground/50">—</span>
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
