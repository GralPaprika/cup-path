"use client";

import Link from "next/link";
import type { AvgPointsContext, Team } from "@/lib/types";
import { TeamLabel } from "@/components/team/team-flag";
import { AvgPointsContextHint } from "@/components/shared/avg-points-context";
import { StatTile } from "@/components/facts/stat-tile";
import { formatFifaPoints, formatStatValue } from "@/lib/format";

interface ParticipantPoolSectionProps {
  title?: string;
  subtitle?: string;
  avgFifaPointsLabel: string;
  medianFifaRankLabel: string;
  lowestRankedQualifierLabel: string;
  avgFifaPoints: number | null;
  avgFifaPointsContext: AvgPointsContext | null;
  medianFifaRank: number | null;
  lowestRankedQualifier: {
    team: Team;
    fifaRank: number;
    fifaPoints: number | null;
    hint: string;
  } | null;
  /** Renders only the stat tiles, for embedding inside a parent panel. */
  embedded?: boolean;
}

export function ParticipantPoolSection({
  title,
  subtitle,
  avgFifaPointsLabel,
  medianFifaRankLabel,
  lowestRankedQualifierLabel,
  avgFifaPoints,
  avgFifaPointsContext,
  medianFifaRank,
  lowestRankedQualifier,
  embedded = false,
}: ParticipantPoolSectionProps) {
  return (
    <section
      className={
        embedded ? "space-y-4" : "glass-panel space-y-4 p-5 sm:p-6"
      }
    >
      {(title || subtitle) && (
        <div>
          {title && (
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile
          label={avgFifaPointsLabel}
          value={formatFifaPoints(avgFifaPoints)}
          footer={
            <AvgPointsContextHint context={avgFifaPointsContext} align="left" />
          }
        />
        <StatTile
          label={medianFifaRankLabel}
          value={
            medianFifaRank !== null
              ? `#${formatStatValue(medianFifaRank, 0)}`
              : "—"
          }
        />
        {lowestRankedQualifier ? (
          <Link
            href={`/team-analysis?team=${lowestRankedQualifier.team.id}`}
            className="block rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 transition-colors hover:border-white/15 hover:bg-white/[0.05]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {lowestRankedQualifierLabel}
            </p>
            <div className="mt-2">
              <TeamLabel
                team={lowestRankedQualifier.team}
                showCode
                flagSize="sm"
                nameClassName="text-sm font-semibold text-white"
              />
            </div>
            <p className="mt-2 font-mono text-sm tabular-nums text-wc-orange">
              FIFA #{formatStatValue(lowestRankedQualifier.fifaRank, 0)} ·{" "}
              {formatFifaPoints(lowestRankedQualifier.fifaPoints)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {lowestRankedQualifier.hint}
            </p>
          </Link>
        ) : (
          <StatTile label={lowestRankedQualifierLabel} value="—" />
        )}
      </div>
    </section>
  );
}
