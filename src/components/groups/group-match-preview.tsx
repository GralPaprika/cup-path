"use client";

import type { GroupExpectedMatchEntry, Team } from "@/lib/types";
import { TeamFlag } from "@/components/team/team-flag";
import { formatFifaPoints } from "@/lib/format";
import { useTranslations } from "next-intl";

interface GroupMatchPreviewProps {
  match: GroupExpectedMatchEntry;
}

function splitScoreLabel(scoreLabel: string): [string, string] {
  const [home = "—", away = "—"] = scoreLabel.split("-");
  return [home, away];
}

function TeamRow({
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
  const [team1Goals, team2Goals] = splitScoreLabel(match.scoreLabel);

  return (
    <div className="mt-2 min-w-0 space-y-1 border-t border-white/8 pt-2 text-xs md:mt-3 md:space-y-2 md:pt-3">
      <p className="text-right font-mono text-[10px] text-muted-foreground">
        {t("groupLabel", { letter: match.groupLetter })}
      </p>
      <TeamRow
        team={match.team1}
        fifaPoints={match.team1FifaPoints}
        goals={team1Goals}
      />
      <TeamRow
        team={match.team2}
        fifaPoints={match.team2FifaPoints}
        goals={team2Goals}
      />
    </div>
  );
}
