"use client";

import type { ReactNode } from "react";
import type { Team } from "@/lib/types";
import { FactsMatchCell } from "@/components/tables/facts-match-cell";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";

interface GroupGapMatchMobileRowProps {
  team1: Team;
  team2: Team;
  scoreLabel: string;
  team1FifaPoints: number | null;
  team2FifaPoints: number | null;
  gapPoints: number | null;
  groupLetter: string;
  vsLabel: string;
  gapLabel: string;
  badge?: ReactNode;
  highlightClassName?: string;
}

export function GroupGapMatchMobileRow({
  team1,
  team2,
  scoreLabel,
  team1FifaPoints,
  team2FifaPoints,
  gapPoints,
  groupLetter,
  vsLabel,
  gapLabel,
  badge,
  highlightClassName,
}: GroupGapMatchMobileRowProps) {
  return (
    <li className={cn("px-2 py-1.5", highlightClassName)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-0.5">
          <FactsMatchCell
            team1={team1}
            team2={team2}
            vsLabel={vsLabel}
            score={
              <span className="font-mono tabular-nums text-muted-foreground">
                {scoreLabel}
              </span>
            }
          />
          <div className="flex gap-3 font-mono text-[11px] tabular-nums text-muted-foreground">
            <span>{formatFifaPoints(team1FifaPoints)}</span>
            <span>{formatFifaPoints(team2FifaPoints)}</span>
          </div>
        </div>

        <div className="shrink-0 space-y-0.5 text-right text-[11px]">
          <p className="font-mono text-xs text-muted-foreground">
            {groupLetter}
          </p>
          <p className="text-muted-foreground">{gapLabel}</p>
          <p className="font-mono tabular-nums text-wc-orange">
            {formatFifaPoints(gapPoints)}
          </p>
          {badge}
        </div>
      </div>
    </li>
  );
}
