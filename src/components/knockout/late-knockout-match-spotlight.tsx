"use client";

import type { LateKnockoutMatchSpotlight, LateKnockoutPathSide } from "@/lib/types";
import { TeamFlag } from "@/components/team/team-flag";
import { MatchResultLabel } from "@/components/shared/match-result-label";
import { MatchScoreBreakdown } from "@/components/path/match-score-breakdown";
import {
  resolveLateFavoriteOutcome,
  type LateFavoriteOutcomeKind,
} from "@/lib/domain/knockout/late-favorite-outcome";
import { formatFifaPoints } from "@/lib/format";
import { getTeamDisplayName } from "@/lib/i18n/team-display-name";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface LateKnockoutMatchSpotlightCardProps {
  spotlight: LateKnockoutMatchSpotlight;
}

function formatGoalDiff(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

function PathSideStats({
  side,
  winner,
  favoriteKind,
}: {
  side: LateKnockoutPathSide;
  winner: boolean;
  favoriteKind: "clear" | "slight" | null;
}) {
  const shared = useTranslations("home.knockoutStage");
  const teamNames = useTranslations("teams");
  const displayName = getTeamDisplayName(teamNames, side.team);

  return (
    <div
      className={cn(
        "space-y-3 rounded-lg border px-3 py-3",
        winner
          ? "border-wc-green/25 bg-wc-green/10"
          : "border-white/8 bg-black/20",
      )}
    >
      <div className="flex items-center gap-2">
        <TeamFlag team={side.team} size="md" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-mono text-sm font-semibold text-white">
              {side.team.id}
            </p>
            {favoriteKind ? (
              <span className="shrink-0 whitespace-nowrap rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                {favoriteKind === "slight"
                  ? shared("lateSlightFavoriteChip")
                  : shared("lateFavoriteChip")}
              </span>
            ) : null}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {displayName}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div>
          <dt className="text-muted-foreground">{shared("lateFifaPoints")}</dt>
          <dd className="font-mono tabular-nums text-white">
            {formatFifaPoints(side.teamFifaPoints)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{shared("lateAvgRivals")}</dt>
          <dd className="font-mono tabular-nums text-white">
            {formatFifaPoints(side.avgOpponentPoints)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{shared("lateGoalsForAgainst")}</dt>
          <dd className="font-mono tabular-nums text-white">
            {side.goalsFor}-{side.goalsAgainst}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{shared("lateGoalDiff")}</dt>
          <dd className="font-mono tabular-nums text-white">
            {formatGoalDiff(side.goalDiff)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function FavoriteOutcomeCallout({
  kind,
  favoriteId,
  underdogId,
  gapPoints,
}: {
  kind: LateFavoriteOutcomeKind;
  favoriteId: string | null;
  underdogId: string | null;
  gapPoints: number;
}) {
  const shared = useTranslations("home.knockoutStage");

  const pillClass =
    kind === "held"
      ? "border-wc-green/40 bg-wc-green/15 text-wc-green"
      : kind === "upset"
        ? "border-wc-orange/40 bg-wc-orange/15 text-wc-orange"
        : "border-white/15 bg-white/5 text-muted-foreground";

  const pillLabel =
    kind === "held"
      ? shared("lateFavoriteHeldPill")
      : kind === "upset"
        ? shared("lateFavoriteUpsetPill")
        : kind === "slight"
          ? shared("lateFavoriteSlightPill")
          : shared("lateFavoriteEvenPill");

  const detail =
    kind === "held" && favoriteId
      ? shared("lateFavoriteHeldDetail", {
          favorite: favoriteId,
          gap: formatFifaPoints(gapPoints),
        })
      : kind === "upset" && favoriteId && underdogId
        ? shared("lateFavoriteUpsetDetail", {
            winner: underdogId,
            favorite: favoriteId,
          })
        : kind === "slight" && favoriteId
          ? shared("lateFavoriteSlightDetail", {
              favorite: favoriteId,
              gap: formatFifaPoints(gapPoints),
            })
          : shared("lateFavoriteEvenDetail");

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span
        className={cn(
          "inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
          pillClass,
        )}
      >
        {pillLabel}
      </span>
      <p className="max-w-[14rem] text-center text-[11px] leading-snug text-muted-foreground">
        {detail}
      </p>
    </div>
  );
}

export function LateKnockoutMatchSpotlightCard({
  spotlight,
}: LateKnockoutMatchSpotlightCardProps) {
  const shared = useTranslations("home.knockoutStage");
  const { fixture, team1Path, team2Path } = spotlight;
  const team1Won = fixture.winnerTeamId === fixture.team1.id;
  const team2Won = fixture.winnerTeamId === fixture.team2.id;
  const favoriteOutcome = resolveLateFavoriteOutcome(fixture);

  function favoriteKindFor(
    teamId: string,
  ): "clear" | "slight" | null {
    if (favoriteOutcome.favoriteTeamId !== teamId) return null;
    if (favoriteOutcome.kind === "slight") return "slight";
    if (favoriteOutcome.kind === "held" || favoriteOutcome.kind === "upset") {
      return "clear";
    }
    return null;
  }

  return (
    <article className="space-y-4 rounded-xl border border-white/8 bg-black/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {fixture.matchNum !== null ? (
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {shared("matchLabel", { num: fixture.matchNum })}
          </p>
        ) : (
          <span />
        )}
        <p className="text-xs text-muted-foreground">{fixture.date}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <PathSideStats
          side={team1Path}
          winner={team1Won}
          favoriteKind={favoriteKindFor(fixture.team1.id)}
        />

        <div className="flex flex-col items-center gap-2 px-2 text-center">
          <div className="flex items-center gap-2 font-mono text-sm">
            <MatchResultLabel
              result={team1Won ? "W" : "L"}
              label={
                team1Won
                  ? shared("outcomeQualified")
                  : shared("outcomeEliminated")
              }
            />
            <MatchScoreBreakdown
              ft={fixture.scoreFt}
              et={fixture.scoreEt}
              pens={fixture.scorePens}
              ftClassName="text-white"
            />
            <MatchResultLabel
              result={team2Won ? "W" : "L"}
              label={
                team2Won
                  ? shared("outcomeQualified")
                  : shared("outcomeEliminated")
              }
            />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {shared("latePointsGap")}
            </p>
            <p className="font-mono text-lg font-semibold tabular-nums text-white">
              {formatFifaPoints(fixture.gapPoints)}
            </p>
          </div>
          <FavoriteOutcomeCallout
            kind={favoriteOutcome.kind}
            favoriteId={favoriteOutcome.favoriteTeamId}
            underdogId={favoriteOutcome.underdogTeamId}
            gapPoints={fixture.gapPoints}
          />
        </div>

        <PathSideStats
          side={team2Path}
          winner={team2Won}
          favoriteKind={favoriteKindFor(fixture.team2.id)}
        />
      </div>
    </article>
  );
}
