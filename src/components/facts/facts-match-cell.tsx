"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Team } from "@/lib/types";
import { TeamFlag } from "@/components/team/team-flag";

interface FactsMatchCellProps {
  team1: Team;
  team2: Team;
  mode: string;
  score: ReactNode;
  vsLabel: string;
}

function TeamLink({ team, mode }: { team: Team; mode: string }) {
  return (
    <Link
      href={`/team-analysis?team=${team.id}&mode=${mode}`}
      className="inline-flex items-center gap-1 transition-colors hover:text-wc-sky"
    >
      <TeamFlag team={team} size="sm" />
      <span className="font-mono font-semibold">{team.id}</span>
    </Link>
  );
}

export function FactsMatchCell({
  team1,
  team2,
  mode,
  score,
  vsLabel,
}: FactsMatchCellProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <TeamLink team={team1} mode={mode} />
      {score}
      <TeamLink team={team2} mode={mode} />
      <span className="sr-only">{vsLabel}</span>
    </div>
  );
}
