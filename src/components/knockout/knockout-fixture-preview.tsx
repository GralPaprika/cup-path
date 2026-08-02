"use client";

import type { KnockoutFixtureEntry } from "@/lib/types";
import {
  FixturePreviewTeamRow,
  splitScoreLabel,
} from "@/components/shared/fixture-preview-teams";
import { resolveFinalScoreLabel } from "@/components/path/match-score-breakdown";
import { useTranslations } from "next-intl";

interface KnockoutFixturePreviewProps {
  fixture: KnockoutFixtureEntry;
}

function formatTeamGoals(goals: string, pensGoals: string | null): string {
  return pensGoals ? `${goals} (${pensGoals})` : goals;
}

export function KnockoutFixturePreview({ fixture }: KnockoutFixturePreviewProps) {
  const shared = useTranslations("home.knockoutStage");
  const common = useTranslations("common");

  const finalScore = resolveFinalScoreLabel(fixture.scoreFt, fixture.scoreEt);
  const [team1Goals, team2Goals] = splitScoreLabel(finalScore);
  const [team1Pens, team2Pens] = fixture.scorePens
    ? splitScoreLabel(fixture.scorePens)
    : [null, null];
  const decisionLabel = fixture.scorePens
    ? common("scorePens")
    : fixture.scoreEt
      ? common("scoreEt")
      : null;

  return (
    <div className="mt-2 min-w-0 space-y-1 border-t border-white/8 pt-2 text-xs md:mt-3 md:space-y-2 md:pt-3">
      <div className="flex items-center justify-between gap-2">
        {fixture.matchNum !== null ? (
          <p className="font-mono text-[10px] text-muted-foreground">
            {shared("matchLabel", { num: fixture.matchNum })}
          </p>
        ) : (
          <span />
        )}
        {decisionLabel ? (
          <p className="font-mono text-[10px] text-muted-foreground">
            {decisionLabel}
          </p>
        ) : null}
      </div>
      <FixturePreviewTeamRow
        team={fixture.team1}
        fifaPoints={fixture.team1FifaPoints}
        goals={formatTeamGoals(team1Goals, team1Pens)}
      />
      <FixturePreviewTeamRow
        team={fixture.team2}
        fifaPoints={fixture.team2FifaPoints}
        goals={formatTeamGoals(team2Goals, team2Pens)}
      />
    </div>
  );
}
