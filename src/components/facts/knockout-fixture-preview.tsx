"use client";

import type { KnockoutFixtureEntry } from "@/lib/types";
import { TeamFlag } from "@/components/team/team-flag";
import { MatchResultLabel } from "@/components/shared/match-result-label";
import { MatchScoreBreakdown } from "@/components/path/match-score-breakdown";
import { formatFifaPoints } from "@/lib/format";
import { useTranslations } from "next-intl";

interface KnockoutFixturePreviewProps {
  fixture: KnockoutFixtureEntry;
}

export function KnockoutFixturePreview({ fixture }: KnockoutFixturePreviewProps) {
  const shared = useTranslations("home.knockoutStage");
  const team1Qualified = fixture.winnerTeamId === fixture.team1.id;
  const team2Qualified = fixture.winnerTeamId === fixture.team2.id;

  return (
    <div className="mt-3 space-y-2 border-t border-white/8 pt-3 text-xs">
      {fixture.matchNum !== null ? (
        <p className="font-mono text-[10px] text-muted-foreground">
          {shared("matchLabel", { num: fixture.matchNum })}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <TeamFlag team={fixture.team1} size="sm" />
          <span className="font-mono font-semibold text-white">
            {fixture.team1.id}
          </span>
        </div>
        <span className="font-mono tabular-nums text-muted-foreground">
          {formatFifaPoints(fixture.team1FifaPoints)}
        </span>
      </div>
      <div className="flex items-center justify-center gap-2 font-mono text-[11px]">
        <MatchResultLabel
          result={team1Qualified ? "W" : "L"}
          label={
            team1Qualified ? shared("outcomeQualified") : shared("outcomeEliminated")
          }
        />
        <MatchScoreBreakdown
          ft={fixture.scoreFt}
          et={fixture.scoreEt}
          pens={fixture.scorePens}
          ftClassName="text-white"
        />
        <MatchResultLabel
          result={team2Qualified ? "W" : "L"}
          label={
            team2Qualified ? shared("outcomeQualified") : shared("outcomeEliminated")
          }
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <TeamFlag team={fixture.team2} size="sm" />
          <span className="font-mono font-semibold text-white">
            {fixture.team2.id}
          </span>
        </div>
        <span className="font-mono tabular-nums text-muted-foreground">
          {formatFifaPoints(fixture.team2FifaPoints)}
        </span>
      </div>
    </div>
  );
}
