"use client";

import type { GroupMatchResult, Team } from "@/lib/types";
import { TeamFlag } from "@/components/team/team-flag";
import { matchResultBadgeClass } from "@/components/shared/match-result-label";
import { classifyTeamTier } from "@/lib/domain/team/team-tiers";
import {
  hasClearFavorite,
  isSlightFavoriteGap,
} from "@/lib/domain/match/paper-favorite";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

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
  slightFavoriteLostLabel: string;
  gapLabel: string;
  favoriteLine: string;
  slightFavoriteLine: string;
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
  entry: GapMatchTooltipEntry,
  labels: {
    favoriteWinLabel: string;
    drawLabel: string;
    upsetLabel: string;
    slightFavoriteLostLabel: string;
  },
) {
  if (entry.favoriteResult === "W") return labels.favoriteWinLabel;
  if (entry.favoriteResult === "D") return labels.drawLabel;
  if (isSlightFavoriteGap(entry.favoriteTeamId, entry.gapPoints)) {
    return labels.slightFavoriteLostLabel;
  }
  return labels.upsetLabel;
}

function TeamColumn({
  team,
  points,
  align,
}: {
  team: Team;
  points: number | null;
  align: "left" | "right";
}) {
  const tiers = useTranslations("teamTiers");
  const tier = points !== null ? classifyTeamTier(points) : null;

  return (
    <div
      className={cn(
        "min-w-0 flex-1 space-y-1",
        align === "right" ? "text-right" : "text-left",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1.5",
          align === "right" && "flex-row-reverse",
        )}
      >
        <TeamFlag team={team} size="sm" />
        <span className="font-mono text-sm font-semibold text-white">
          {team.id}
        </span>
      </div>
      <p className="font-mono text-xs tabular-nums text-white">
        {points !== null ? formatFifaPoints(points) : "—"}
      </p>
      {tier ? (
        <p className="truncate text-[10px] text-muted-foreground">
          {tiers(tier)}
        </p>
      ) : null}
    </div>
  );
}

export function MatchOutcomeGapMatchTooltip({
  entry,
  roundLabel,
  favoriteWinLabel,
  drawLabel,
  upsetLabel,
  slightFavoriteLostLabel,
  gapLabel,
  favoriteLine,
  slightFavoriteLine,
  evenlyMatchedLabel,
  outlierLabel,
  groupLabel,
}: MatchOutcomeGapMatchTooltipProps) {
  const result = resultLabel(entry, {
    favoriteWinLabel,
    drawLabel,
    upsetLabel,
    slightFavoriteLostLabel,
  });

  const slight = isSlightFavoriteGap(entry.favoriteTeamId, entry.gapPoints);
  const clear =
    entry.favoriteTeamId !== null && hasClearFavorite(entry.gapPoints);

  const favoriteStatus =
    entry.isEqualRating
      ? evenlyMatchedLabel
      : slight && entry.favoriteTeamId
        ? slightFavoriteLine
        : clear && entry.favoriteTeamId
          ? favoriteLine
          : null;

  return (
    <div
      className={cn(
        "relative min-w-[240px] max-w-[300px] rounded-xl border bg-[#070b14]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-md",
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
          <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-wc-orange">
            {outlierLabel}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <TeamColumn
          team={entry.team1}
          points={entry.team1FifaPoints}
          align="left"
        />

        <div className="shrink-0 px-1 text-center">
          <span className="font-mono text-base font-semibold tabular-nums text-white">
            {entry.scoreLabel}
          </span>
        </div>

        <TeamColumn
          team={entry.team2}
          points={entry.team2FifaPoints}
          align="right"
        />
      </div>

      <div className="mt-3 space-y-1.5 border-t border-white/8 pt-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] text-muted-foreground">
            <span>{gapLabel}</span>
            <span className="ml-1.5 font-mono font-semibold tabular-nums text-white">
              {formatFifaPoints(entry.gapPoints)}
            </span>
          </div>
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              matchResultBadgeClass(entry.favoriteResult),
            )}
          >
            {result}
          </span>
        </div>

        {favoriteStatus ? (
          <p className="text-[10px] leading-snug text-muted-foreground">
            {favoriteStatus}
          </p>
        ) : null}
      </div>

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
