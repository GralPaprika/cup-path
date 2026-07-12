"use client";

import type { GroupExpectedMatchEntry } from "@/lib/types";
import { TeamFlag } from "@/components/team-flag";
import { MatchResultLabel } from "@/components/match-result-label";
import { formatFifaPoints } from "@/lib/format";
import { useTranslations } from "next-intl";

interface GroupMatchPreviewProps {
  match: GroupExpectedMatchEntry;
}

export function GroupMatchPreview({ match }: GroupMatchPreviewProps) {
  const t = useTranslations("home.groupExpectedFinishes");
  const results = useTranslations("results");

  return (
    <div className="mt-3 space-y-2 border-t border-white/8 pt-3 text-xs">
      <p className="font-mono text-[10px] text-muted-foreground">
        {t("groupLabel", { letter: match.groupLetter })}
      </p>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <TeamFlag team={match.team1} size="sm" />
          <span className="font-mono font-semibold text-white">
            {match.team1.id}
          </span>
        </div>
        <span className="font-mono tabular-nums text-muted-foreground">
          {formatFifaPoints(match.team1FifaPoints)}
        </span>
      </div>
      <div className="flex items-center justify-center gap-2 font-mono text-[11px]">
        <MatchResultLabel
          result={match.team1Actual}
          label={results(match.team1Actual)}
        />
        <span className="tabular-nums text-white">{match.scoreLabel}</span>
        <MatchResultLabel
          result={match.team2Actual}
          label={results(match.team2Actual)}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <TeamFlag team={match.team2} size="sm" />
          <span className="font-mono font-semibold text-white">
            {match.team2.id}
          </span>
        </div>
        <span className="font-mono tabular-nums text-muted-foreground">
          {formatFifaPoints(match.team2FifaPoints)}
        </span>
      </div>
    </div>
  );
}
