"use client";

import type { GroupExpectedMatchEntry } from "@/lib/types";
import {
  FixturePreviewTeamRow,
  splitScoreLabel,
} from "@/components/shared/fixture-preview-teams";
import { useTranslations } from "next-intl";

interface GroupMatchPreviewProps {
  match: GroupExpectedMatchEntry;
}

export function GroupMatchPreview({ match }: GroupMatchPreviewProps) {
  const t = useTranslations("home.groupExpectedFinishes");
  const [team1Goals, team2Goals] = splitScoreLabel(match.scoreLabel);

  return (
    <div className="mt-2 min-w-0 space-y-1 border-t border-white/8 pt-2 text-xs md:mt-3 md:space-y-2 md:pt-3">
      <p className="text-right font-mono text-[10px] text-muted-foreground">
        {t("groupLabel", { letter: match.groupLetter })}
      </p>
      <FixturePreviewTeamRow
        team={match.team1}
        fifaPoints={match.team1FifaPoints}
        goals={team1Goals}
      />
      <FixturePreviewTeamRow
        team={match.team2}
        fifaPoints={match.team2FifaPoints}
        goals={team2Goals}
      />
    </div>
  );
}
