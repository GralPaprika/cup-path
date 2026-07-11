"use client";

import type { NumericStats, Team } from "@/lib/types";
import { TeamFlag } from "@/components/team-flag";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface FifaPointsObservation {
  teamId: string;
  displayName: string;
  flagUrl: string;
  points: number;
}

export interface FifaPointsReferenceLine {
  value: number;
  stroke: string;
  strokeDasharray?: string;
  legendLabel: string;
  legendClassName?: string;
}

interface FifaPointsBarChartProps {
  observations: FifaPointsObservation[];
  stats: NumericStats;
  title: string;
  standardDeviationBandLabel: string;
  meanLegendLabel: string;
  hintLabel: string;
  ariaLabel: string;
  referenceLines?: FifaPointsReferenceLine[];
  selectedTeam?: Pick<Team, "id" | "flagUrl" | "displayName"> | null;
  selectedTeamPoints?: number | null;
  selectedTeamLegend?: string | null;
  className?: string;
}

const WIDTH = 720;
const HEIGHT = 300;
const MARGIN = { top: 24, right: 24, bottom: 40, left: 58 };
const TEAM_LINE_COLOR = "var(--color-wc-sky)";

export function FifaPointsBarChart({
  observations,
  stats,
  title,
  standardDeviationBandLabel,
  meanLegendLabel,
  hintLabel,
  ariaLabel,
  referenceLines = [],
  selectedTeam = null,
  selectedTeamPoints = null,
  selectedTeamLegend = null,
  className = "mt-4",
}: FifaPointsBarChartProps) {
  if (
    observations.length === 0 ||
    stats.mean === null ||
    stats.stdDev === null
  ) {
    return null;
  }

  const chartWidth = WIDTH - MARGIN.left - MARGIN.right;
  const chartHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const upperDeviation = stats.mean + stats.stdDev;
  const lowerDeviation = Math.max(0, stats.mean - stats.stdDev);
  const observedMax = Math.max(...observations.map(({ points }) => points));
  const scaleMax = Math.max(
    observedMax,
    upperDeviation,
    selectedTeamPoints ?? 0,
    ...referenceLines.map((line) => line.value),
  );
  const domainMax = Math.ceil(scaleMax / 250) * 250;
  const y = (value: number) =>
    MARGIN.top + chartHeight - (value / domainMax) * chartHeight;
  const slotWidth = chartWidth / observations.length;
  const barWidth = Math.min(64, slotWidth * 0.58);
  const ticks = [0, domainMax / 2, domainMax];
  const labelInsetLeft = `${(MARGIN.left / WIDTH) * 100}%`;
  const labelInsetRight = `${(MARGIN.right / WIDTH) * 100}%`;
  const labelHeight = `${(MARGIN.bottom / HEIGHT) * 100}%`;

  return (
    <figure
      className={`overflow-hidden rounded-xl border border-white/8 bg-black/10 p-3 ${className}`}
    >
      <figcaption className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
        <span className="text-sm font-semibold text-white">{title}</span>
        <span className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-5 rounded-sm bg-wc-sky/20" />
            {standardDeviationBandLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 border-t border-dashed border-wc-orange" />
            {meanLegendLabel}
          </span>
          {referenceLines.map((line) => (
            <span
              key={line.legendLabel}
              className={cn(
                "flex items-center gap-1.5",
                line.legendClassName,
              )}
            >
              <span
                className="inline-block w-5 border-t"
                style={{
                  borderColor: line.stroke,
                  borderTopStyle: line.strokeDasharray ? "dashed" : "solid",
                }}
              />
              {line.legendLabel}
            </span>
          ))}
          {selectedTeam && selectedTeamPoints !== null && selectedTeamLegend && (
            <span className="flex items-center gap-1.5 text-wc-sky">
              <span className="inline-block w-5 border-t border-wc-sky" />
              <TeamFlag team={selectedTeam} size="sm" />
              <span className="font-mono font-semibold">{selectedTeamLegend}</span>
            </span>
          )}
        </span>
      </figcaption>

      <div className="relative">
        <svg
          className="h-auto w-full"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={ariaLabel}
        >
          <rect
            x={MARGIN.left}
            y={y(upperDeviation)}
            width={chartWidth}
            height={y(lowerDeviation) - y(upperDeviation)}
            className="fill-wc-sky/15"
          />

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

          {observations.map((observation, index) => {
            const x = MARGIN.left + slotWidth * index + (slotWidth - barWidth) / 2;
            const barTop = y(observation.points);
            const barBottom = y(0);
            const labelY = barBottom - 12;

            return (
              <g key={`${observation.teamId}-${index}`}>
                <rect
                  x={x}
                  y={barTop}
                  width={barWidth}
                  height={barBottom - barTop}
                  rx={5}
                  className="fill-wc-lavender/70"
                >
                  <title>
                    {observation.displayName}: {formatFifaPoints(observation.points)}
                  </title>
                </rect>
                <text
                  x={x + barWidth / 2}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white font-mono text-[9px] font-semibold"
                >
                  {formatFifaPoints(observation.points)}
                </text>
              </g>
            );
          })}

          <line
            x1={MARGIN.left}
            x2={WIDTH - MARGIN.right}
            y1={y(stats.mean)}
            y2={y(stats.mean)}
            className="stroke-wc-orange"
            strokeWidth={1}
            strokeDasharray="7 5"
          />
          {referenceLines.map((line) => (
            <line
              key={line.legendLabel}
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={y(line.value)}
              y2={y(line.value)}
              stroke={line.stroke}
              strokeWidth={1}
              strokeDasharray={line.strokeDasharray}
            />
          ))}
          {selectedTeamPoints !== null && (
            <line
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={y(selectedTeamPoints)}
              y2={y(selectedTeamPoints)}
              stroke={TEAM_LINE_COLOR}
              strokeWidth={1}
            />
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
          {observations.map((observation, index) => (
            <div
              key={`${observation.teamId}-label-${index}`}
              className="flex flex-1 flex-col items-center justify-start gap-0.5 pt-3"
            >
              <TeamFlag
                team={{
                  id: observation.teamId,
                  flagUrl: observation.flagUrl,
                  displayName: observation.displayName,
                }}
                size="sm"
              />
              <span className="font-mono text-[10px] font-semibold tracking-wide text-muted-foreground">
                {observation.teamId}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="px-1 text-xs leading-relaxed text-muted-foreground">
        {hintLabel}
      </p>
    </figure>
  );
}
