"use client";

import type { Team } from "@/lib/types";
import { TeamFlag } from "@/components/team/team-flag";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";

interface OpponentDifficultyPointTooltipProps {
  team: Team;
  teamFifaPoints: number;
  rivalDifficultyPoints: number;
  won: boolean;
  statusLabel: string;
  rivalDifficultyLabel: string;
  subtitle?: string;
  rival?: Team;
  rivalLabel?: string;
  rivalPointsLabel?: string;
  gapLabel?: string;
}

const OUTCOME_BORDER_CLASS = {
  won: "border-wc-green/35 shadow-wc-green/10",
  lost: "border-wc-red/35 shadow-wc-red/10",
} as const;

const OUTCOME_BADGE_CLASS = {
  won: "border-wc-green/35 bg-wc-green/15 text-wc-green",
  lost: "border-wc-red/35 bg-wc-red/15 text-wc-red",
} as const;

function TeamPointsRow({
  team,
  points,
}: {
  team: Team;
  points: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <TeamFlag team={team} size="sm" />
        <span className="font-mono text-sm font-semibold text-white">
          {team.id}
        </span>
      </div>
      <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
        {formatFifaPoints(points)}
      </span>
    </div>
  );
}

function RivalPointsRow({
  label,
  team,
  points,
}: {
  label: string;
  team: Team;
  points: number;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <TeamPointsRow team={team} points={points} />
    </div>
  );
}

function StatRow({
  label,
  value,
  mutedValue = false,
}: {
  label: string;
  value: string;
  mutedValue?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-mono text-xs tabular-nums",
          mutedValue
            ? "text-muted-foreground"
            : "font-semibold text-white",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function formatSignedGap(gap: number): string {
  const formatted = formatFifaPoints(Math.abs(gap));
  if (gap > 0) return `+${formatted}`;
  if (gap < 0) return `-${formatted}`;
  return formatted;
}

export function OpponentDifficultyPointTooltip({
  team,
  teamFifaPoints,
  rivalDifficultyPoints,
  won,
  statusLabel,
  rivalDifficultyLabel,
  subtitle,
  rival,
  rivalLabel,
  rivalPointsLabel,
  gapLabel,
}: OpponentDifficultyPointTooltipProps) {
  const outcome = won ? "won" : "lost";
  const isKnockoutLayout = rivalPointsLabel !== undefined && gapLabel !== undefined;
  const pointsGap = rivalDifficultyPoints - teamFifaPoints;

  return (
    <div
      className={cn(
        "relative min-w-[220px] max-w-[280px] rounded-xl border bg-[#070b14]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-md",
        OUTCOME_BORDER_CLASS[outcome],
      )}
    >
      {subtitle ? (
        <p className="text-[11px] font-medium text-muted-foreground">
          {subtitle}
        </p>
      ) : null}

      <div className={cn("space-y-2", subtitle && "mt-3")}>
        <TeamPointsRow team={team} points={teamFifaPoints} />

        {isKnockoutLayout ? (
          <div className="space-y-2 border-t border-white/8 pt-2">
            {rival ? (
              <RivalPointsRow
                label={rivalLabel ?? rivalPointsLabel ?? "Rival"}
                team={rival}
                points={rivalDifficultyPoints}
              />
            ) : (
              <StatRow
                label={rivalPointsLabel}
                value={formatFifaPoints(rivalDifficultyPoints)}
              />
            )}
            <StatRow label={gapLabel} value={formatSignedGap(pointsGap)} />
          </div>
        ) : (
          <div className="space-y-2 border-t border-white/8 pt-2">
            <StatRow
              label={rivalDifficultyLabel}
              value={formatFifaPoints(rivalDifficultyPoints)}
              mutedValue
            />
            {gapLabel ? (
              <StatRow label={gapLabel} value={formatSignedGap(pointsGap)} />
            ) : null}
          </div>
        )}
      </div>

      <div className="mt-3 flex justify-end border-t border-white/8 pt-3">
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            OUTCOME_BADGE_CLASS[outcome],
          )}
        >
          {statusLabel}
        </span>
      </div>

      <div
        aria-hidden
        className={cn(
          "absolute left-0 top-1/2 h-0 w-0 -translate-x-full -translate-y-1/2 border-y-[7px] border-r-[7px] border-y-transparent",
          won ? "border-r-wc-green/35" : "border-r-wc-red/35",
        )}
      />
    </div>
  );
}
