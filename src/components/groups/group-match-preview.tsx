"use client";

import type { GroupExpectedMatchEntry, Team } from "@/lib/types";
import { TeamFlag } from "@/components/team/team-flag";
import { MatchResultLabel } from "@/components/shared/match-result-label";
import { formatFifaPoints } from "@/lib/format";
import { useTranslations } from "next-intl";

interface GroupMatchPreviewProps {
  match: GroupExpectedMatchEntry;
}

function splitScoreLabel(scoreLabel: string): [string, string] {
  const [home = "—", away = "—"] = scoreLabel.split("-");
  return [home, away];
}

function MobileTeamRow({
  team,
  fifaPoints,
  goals,
}: {
  team: Team;
  fifaPoints: number | null;
  goals: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <TeamFlag team={team} size="sm" />
      <p className="min-w-0 truncate font-mono text-[11px] font-semibold text-white">
        {team.id}
      </p>
      <p className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
        {formatFifaPoints(fifaPoints)}
      </p>
      <span className="ml-auto shrink-0 font-mono text-[11px] font-semibold tabular-nums text-white">
        {goals}
      </span>
    </div>
  );
}

export function GroupMatchPreview({ match }: GroupMatchPreviewProps) {
  const t = useTranslations("home.groupExpectedFinishes");
  const results = useTranslations("results");
  const [team1Goals, team2Goals] = splitScoreLabel(match.scoreLabel);

  return (
    <div className="mt-2 min-w-0 space-y-1 border-t border-white/8 pt-2 text-xs md:mt-3 md:space-y-2 md:pt-3">
      {/* Mobile: stacked team rows per wireframe */}
      <div className="space-y-1 lg:hidden">
        <p className="text-right font-mono text-[10px] text-muted-foreground">
          {t("groupLabel", { letter: match.groupLetter })}
        </p>
        <MobileTeamRow
          team={match.team1}
          fifaPoints={match.team1FifaPoints}
          goals={team1Goals}
        />
        <MobileTeamRow
          team={match.team2}
          fifaPoints={match.team2FifaPoints}
          goals={team2Goals}
        />
      </div>

      {/* Desktop: existing horizontal match row */}
      <div className="hidden space-y-1 lg:block md:space-y-2">
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
    </div>
  );
}
