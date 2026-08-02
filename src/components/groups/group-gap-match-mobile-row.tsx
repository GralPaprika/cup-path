"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Team } from "@/lib/types";
import { TeamFlag } from "@/components/team/team-flag";
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

function TeamLink({ team }: { team: Team }) {
  return (
    <Link
      href={`/?team=${team.id}`}
      className="inline-flex min-w-0 items-center gap-1 transition-colors hover:text-wc-sky"
    >
      <TeamFlag team={team} size="sm" />
      <span className="truncate font-mono font-semibold">{team.id}</span>
    </Link>
  );
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
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="min-w-0 space-y-0.5">
            <div className="flex min-w-0 flex-nowrap items-center gap-1">
              <TeamLink team={team1} />
              <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
                {scoreLabel}
              </span>
            </div>
            <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
              {formatFifaPoints(team1FifaPoints)}
            </p>
          </div>
          <div className="min-w-0 space-y-0.5">
            <TeamLink team={team2} />
            <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
              {formatFifaPoints(team2FifaPoints)}
            </p>
          </div>
          <span className="sr-only">{vsLabel}</span>
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
