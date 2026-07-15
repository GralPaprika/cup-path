"use client";

import type { GroupMatchResult, Team } from "@/lib/types";
import { TeamFlag } from "@/components/team/team-flag";
import { matchResultBadgeClass } from "@/components/shared/match-result-label";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface GapMatchTooltipEntry {
  team1: Team;
  team2: Team;
  team1FifaPoints: number | null;
  team2FifaPoints: number | null;
  gapPoints: number;
  favoriteTeamId: string | null;
  favoriteResult: GroupMatchResult;
  isEqualRating: boolean;
  scoreLabel: string;
  isOutlier: boolean;
  groupLetter: string | null;
}

interface MatchOutcomeGapMatchTooltipProps {
  entry: GapMatchTooltipEntry;
  roundLabel: string;
  favoriteWinLabel: string;
  drawLabel: string;
  upsetLabel: string;
  gapLabel: string;
  favoriteLabel: string;
  evenlyMatchedLabel: string;
  outlierLabel: string;
  groupLabel?: string;
}

const RESULT_BORDER_CLASS = {
  W: "border-wc-green/35 shadow-wc-green/10",
  D: "border-wc-sky/35 shadow-wc-sky/10",
  L: "border-wc-red/35 shadow-wc-red/10",
} as const;

function resultLabel(
  result: GroupMatchResult,
  labels: {
    favoriteWinLabel: string;
    drawLabel: string;
    upsetLabel: string;
  },
) {
  if (result === "W") return labels.favoriteWinLabel;
  if (result === "L") return labels.upsetLabel;
  return labels.drawLabel;
}

function TeamRow({
  team,
  points,
  isFavorite,
  favoriteLabel,
}: {
  team: Team;
  points: number | null;
  isFavorite: boolean;
  favoriteLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <TeamFlag team={team} size="sm" />
        <span className="font-mono text-sm font-semibold text-white">
          {team.id}
        </span>
        {isFavorite ? (
          <span className="rounded-full border border-wc-orange/30 bg-wc-orange/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-wc-orange">
            {favoriteLabel}
          </span>
        ) : null}
      </div>
      <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
        {points !== null ? formatFifaPoints(points) : "—"}
      </span>
    </div>
  );
}

export function MatchOutcomeGapMatchTooltip({
  entry,
  roundLabel,
  favoriteWinLabel,
  drawLabel,
  upsetLabel,
  gapLabel,
  favoriteLabel,
  evenlyMatchedLabel,
  outlierLabel,
  groupLabel,
}: MatchOutcomeGapMatchTooltipProps) {
  const result = resultLabel(entry.favoriteResult, {
    favoriteWinLabel,
    drawLabel,
    upsetLabel,
  });

  const favoriteIsTeam1 = entry.favoriteTeamId === entry.team1.id;
  const favoriteIsTeam2 = entry.favoriteTeamId === entry.team2.id;

  return (
    <div
      className={cn(
        "relative min-w-[220px] max-w-[280px] rounded-xl border bg-[#070b14]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-md",
        RESULT_BORDER_CLASS[entry.favoriteResult],
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium text-muted-foreground">
          {roundLabel}
          {entry.groupLetter && groupLabel ? (
            <span className="text-white/70"> · {groupLabel}</span>
          ) : null}
        </p>
        {entry.isOutlier ? (
          <span className="shrink-0 rounded-full border border-wc-orange/35 bg-wc-orange/15 px-2 py-0.5 text-[10px] font-medium text-wc-orange">
            {outlierLabel}
          </span>
        ) : null}
      </div>

      <div className="mt-3 space-y-2">
        <TeamRow
          team={entry.team1}
          points={entry.team1FifaPoints}
          isFavorite={favoriteIsTeam1}
          favoriteLabel={favoriteLabel}
        />

        <div className="flex items-center justify-center gap-2 py-0.5">
          <span className="font-mono text-base font-semibold tabular-nums text-white">
            {entry.scoreLabel}
          </span>
        </div>

        <TeamRow
          team={entry.team2}
          points={entry.team2FifaPoints}
          isFavorite={favoriteIsTeam2}
          favoriteLabel={favoriteLabel}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/8 pt-3">
        <div className="text-[11px] text-muted-foreground">
          <span>{gapLabel}</span>
          <span className="ml-1.5 font-mono font-semibold tabular-nums text-white">
            {formatFifaPoints(entry.gapPoints)}
          </span>
        </div>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            matchResultBadgeClass(entry.favoriteResult),
          )}
        >
          {result}
        </span>
      </div>

      {entry.isEqualRating ? (
        <p className="mt-2 text-[10px] text-muted-foreground">
          {evenlyMatchedLabel}
        </p>
      ) : null}

      <div
        aria-hidden
        className={cn(
          "absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[7px] border-t-[7px] border-x-transparent",
          entry.favoriteResult === "W" && "border-t-wc-green/35",
          entry.favoriteResult === "D" && "border-t-wc-sky/35",
          entry.favoriteResult === "L" && "border-t-wc-red/35",
        )}
      />
    </div>
  );
}
