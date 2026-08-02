"use client";

import type { GroupExpectedMatchEntry } from "@/lib/types";
import { TeamFlag } from "@/components/team/team-flag";
import { MatchResultLabel } from "@/components/shared/match-result-label";
import { formatFifaPoints } from "@/lib/format";
import { useTranslations } from "next-intl";

interface GroupMatchPreviewProps {
  match: GroupExpectedMatchEntry;
}

export function GroupMatchPreview({ match }: GroupMatchPreviewProps) {
  const t = useTranslations("home.groupExpectedFinishes");
  const results = useTranslations("results");

  return (
    <div className="mt-2 min-w-0 space-y-1 border-t border-white/8 pt-2 text-xs md:mt-3 md:space-y-2 md:pt-3">
      <p className="font-mono text-[10px] text-muted-foreground">
        {t("groupLabel", { letter: match.groupLetter })}
      </p>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1">
        <div className="flex min-w-0 items-center gap-1">
          <TeamFlag team={match.team1} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-mono text-[11px] font-semibold text-white">
              {match.team1.id}
            </p>
            <p className="truncate font-mono text-[10px] tabular-nums text-muted-foreground">
              {formatFifaPoints(match.team1FifaPoints)}
            </p>
          </div>
        </div>
        <div className="flex min-w-0 shrink-0 items-center justify-center gap-1 font-mono text-[10px] md:gap-1.5 md:text-[11px]">
          <MatchResultLabel
            result={match.team1Actual}
            label={results(match.team1Actual)}
          />
          <span className="shrink-0 tabular-nums text-white">
            {match.scoreLabel}
          </span>
          <MatchResultLabel
            result={match.team2Actual}
            label={results(match.team2Actual)}
          />
        </div>
        <div className="flex min-w-0 items-center justify-end gap-1">
          <div className="min-w-0 text-right">
            <p className="truncate font-mono text-[11px] font-semibold text-white">
              {match.team2.id}
            </p>
            <p className="truncate font-mono text-[10px] tabular-nums text-muted-foreground">
              {formatFifaPoints(match.team2FifaPoints)}
            </p>
          </div>
          <TeamFlag team={match.team2} size="sm" />
        </div>
      </div>
    </div>
  );
}
