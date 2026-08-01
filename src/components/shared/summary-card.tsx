"use client";

import Link from "next/link";
import type {
  AvgPointsContext,
  PathStage,
  PodiumFinish,
  TeamPathSummary,
} from "@/lib/types";
import { getMatchStage, isThirdPlaceMatch, PATH_STAGES } from "@/lib/domain/match/match-stages";
import { getPodiumFinish } from "@/lib/domain/path/path-outcome";
import { useTranslations } from "next-intl";
import { TeamLabel } from "@/components/team/team-flag";
import { TeamTierBadge } from "@/components/team/team-tier-badge";
import { DifficultyGauge } from "@/components/shared/difficulty-gauge";
import {
  AvgPointsContextFootnote,
  AvgPointsContextHint,
} from "@/components/shared/avg-points-context";
import { KNOCKOUT_SECTION_IDS } from "@/components/facts/facts-section-nav";
import {
  ACTIVE_BADGE_STYLE,
  ELIMINATED_BADGE_HOVER_STYLE,
  ELIMINATED_BADGE_STYLE,
  PODIUM_BADGE_HOVER_STYLES,
  PODIUM_BADGE_STYLES,
  PODIUM_LABEL_KEYS,
} from "@/components/shared/path-outcome-styles";
import { Badge } from "@/components/ui/badge";
import { StatTile } from "@/components/shared/stat-tile";
import { formatFifaPoints, formatStatValue, formatWholeNumber } from "@/lib/format";
import { getRoundDisplayName } from "@/lib/i18n/round-display-name";
import { COMPARE_STAGE_I18N_KEYS } from "@/lib/i18n/stage-keys";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  summary: TeamPathSummary;
  avgPointsContext?: AvgPointsContext | null;
  hardestPathRank: number | null;
  hardestPathRankByAvgRank?: number | null;
  cohortSize: number;
  cohortStage: PathStage;
  includedStages?: Set<PathStage>;
}

type PathOutcome =
  | { kind: PodiumFinish }
  | { kind: "eliminated"; round: string }
  | { kind: "active" };

function getPathOutcome(summary: TeamPathSummary): PathOutcome {
  const podium = getPodiumFinish(summary.matches);
  if (podium) return { kind: podium };

  if (summary.isEliminated) {
    const loss = [...summary.matches]
      .reverse()
      .find(
        (match) =>
          match.isPlayed &&
          match.result === "L" &&
          !isThirdPlaceMatch(match.round),
      );
    return {
      kind: "eliminated",
      round: loss?.round ?? summary.matches.at(-1)?.round ?? "",
    };
  }

  return { kind: "active" };
}

function getOverviewHrefForOutcome(outcome: PathOutcome): string | null {
  if (outcome.kind === "champion" || outcome.kind === "runnerUp") {
    return `/overview#${KNOCKOUT_SECTION_IDS.final}`;
  }
  if (outcome.kind === "thirdPlace") {
    return `/overview#${KNOCKOUT_SECTION_IDS.sf}`;
  }
  if (outcome.kind === "eliminated") {
    const stage = getMatchStage(outcome.round);
    if (stage === "group") return "/overview#group-round";
    if (
      stage === "r32" ||
      stage === "r16" ||
      stage === "qf" ||
      stage === "sf" ||
      stage === "final"
    ) {
      return `/overview#${KNOCKOUT_SECTION_IDS[stage]}`;
    }
  }
  return null;
}

function getOverviewRoundPrompt(
  outcome: PathOutcome,
  overviewRound: (key: string) => string,
): string | null {
  if (outcome.kind === "champion" || outcome.kind === "runnerUp") {
    return overviewRound("final");
  }
  if (outcome.kind === "thirdPlace") {
    return overviewRound("semiFinal");
  }
  if (outcome.kind === "eliminated") {
    const stage = getMatchStage(outcome.round);
    if (stage === null) return null;
    return overviewRound(COMPARE_STAGE_I18N_KEYS[stage]);
  }
  return null;
}

export function SummaryCard({
  summary,
  avgPointsContext,
  hardestPathRank,
  hardestPathRankByAvgRank,
  cohortSize,
  cohortStage,
  includedStages,
}: SummaryCardProps) {
  const t = useTranslations("summary");
  const stages = useTranslations("compare.stages");
  const overviewRound = useTranslations("summary.overviewRound");
  const common = useTranslations("common");

  const includedMatches = includedStages
    ? summary.matches.filter((match) => {
        const stage = getMatchStage(match.round);
        return stage !== null && includedStages.has(stage);
      })
    : summary.matches;

  const allStagesSelected =
    !includedStages || includedStages.size === PATH_STAGES.length;

  const showAltRankByAvgRank =
    hardestPathRank !== null &&
    hardestPathRankByAvgRank !== null &&
    hardestPathRankByAvgRank !== undefined &&
    hardestPathRankByAvgRank !== hardestPathRank;

  const outcome = getPathOutcome(summary);
  const eliminatedRoundLabel =
    outcome.kind === "eliminated"
      ? getMatchStage(outcome.round) === "group"
        ? t("outcomeGroupStage")
        : getRoundDisplayName(stages, outcome.round)
      : null;
  const outcomeLabel =
    outcome.kind === "eliminated"
      ? eliminatedRoundLabel != null
        ? t("outcomeEliminatedIn", { round: eliminatedRoundLabel })
        : t("active")
      : outcome.kind === "active"
        ? t("active")
        : t(PODIUM_LABEL_KEYS[outcome.kind]);
  const outcomeClassName =
    outcome.kind === "eliminated"
      ? ELIMINATED_BADGE_STYLE
      : outcome.kind === "active"
        ? ACTIVE_BADGE_STYLE
        : PODIUM_BADGE_STYLES[outcome.kind];

  const outcomeChipHoverClassName =
    outcome.kind === "eliminated"
      ? ELIMINATED_BADGE_HOVER_STYLE
      : outcome.kind === "active"
        ? ""
        : PODIUM_BADGE_HOVER_STYLES[outcome.kind];

  const overviewHref = getOverviewHrefForOutcome(outcome);
  const overviewRoundPrompt = getOverviewRoundPrompt(outcome, overviewRound);
  const overviewLinkLabel =
    overviewRoundPrompt != null
      ? t("outcomeSeeRoundOnOverview", { round: overviewRoundPrompt })
      : null;

  const outcomeChip =
    overviewHref && overviewLinkLabel ? (
      <Link
        href={overviewHref}
        aria-label={overviewLinkLabel}
        className={cn(
          "inline-flex w-fit max-w-full shrink-0 flex-row flex-wrap items-baseline gap-x-2 gap-y-0.5 self-start rounded-2xl border px-3.5 py-2 transition-colors",
          outcomeClassName,
          outcomeChipHoverClassName,
        )}
      >
        <span className="whitespace-nowrap text-sm font-semibold leading-tight">
          {outcomeLabel}
        </span>
        <span className="whitespace-nowrap text-xs font-medium leading-tight opacity-80">
          {overviewLinkLabel} →
        </span>
      </Link>
    ) : (
      <Badge variant="outline" className={cn("h-auto px-3 py-1.5", outcomeClassName)}>
        {outcomeLabel}
      </Badge>
    );

  return (
    <div className="glass-panel">
      <div className="border-b border-white/8 px-5 py-5 sm:px-6">
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-10">
          <div className="flex min-w-0 flex-col items-center justify-center">
            <DifficultyGauge
              value={summary.avgOpponentPoints}
              hardestPathRank={hardestPathRank}
              cohortSize={cohortSize}
              label={t("avgDifficulty")}
              rankTitle={hardestPathRank ? t("hardestPathRank") : undefined}
              rankValue={
                hardestPathRank
                  ? t("hardestPathRankOf", {
                      rank: hardestPathRank,
                      total: cohortSize,
                    })
                  : undefined
              }
              rankMeta={
                hardestPathRank
                  ? stages(COMPARE_STAGE_I18N_KEYS[cohortStage])
                  : undefined
              }
              rankAltNote={
                showAltRankByAvgRank
                  ? t("hardestPathRankAltByAvgRank", {
                      rank: hardestPathRankByAvgRank,
                    })
                  : undefined
              }
            />
            {hardestPathRank !== null && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                <Link href="/compare" className="text-wc-sky hover:underline">
                  {t("seeFullRanking")}
                </Link>
              </p>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <TeamLabel
                team={summary.team}
                showCode
                flagSize="xl"
                nameClassName="text-3xl font-bold leading-snug text-white sm:text-4xl"
              />
              <div className="flex flex-wrap items-center gap-2">
                {summary.teamPoints !== null ? (
                  <TeamTierBadge points={summary.teamPoints} />
                ) : null}
                <Link
                  href={`/groups?group=${summary.team.group}&team=${summary.team.id}`}
                  className="inline-flex"
                >
                  <Badge
                    variant="outline"
                    className="border-wc-sky/30 bg-wc-sky/10 text-wc-sky transition-colors hover:border-wc-sky/50 hover:bg-wc-sky/20"
                  >
                    {common("group", { group: summary.team.group })}
                  </Badge>
                </Link>
                <Badge
                  variant="outline"
                  className="border-white/15 bg-white/5 text-muted-foreground"
                >
                  {summary.team.confederation}
                </Badge>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {t("matchesPlayed")}: {summary.playedCount}/{summary.totalCount}
              {!allStagesSelected && (
                <span>
                  {" "}
                  · {t("averagesFrom", { count: includedMatches.length })}
                </span>
              )}
            </p>

            {outcomeChip}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-5 sm:p-6 lg:grid-cols-4">
        <StatTile
          label={t("fifaPoints")}
          value={formatFifaPoints(summary.teamPoints)}
          size="lg"
          className="glass-panel-subtle"
          valueClassName="tabular-nums"
        />
        <StatTile
          label={t("fifaRank")}
          value={formatWholeNumber(summary.teamRank)}
          size="lg"
          className="glass-panel-subtle"
          valueClassName="tabular-nums"
        />
        <StatTile
          label={t("avgDifficulty")}
          value={formatFifaPoints(summary.avgOpponentPoints)}
          size="lg"
          className="glass-panel-subtle"
          hint={
            <AvgPointsContextHint context={avgPointsContext} align="left" />
          }
          valueClassName="tabular-nums text-wc-orange"
        />
        <StatTile
          label={t("avgRank")}
          value={formatStatValue(summary.avgOpponentRank, 1)}
          size="lg"
          className="glass-panel-subtle"
          valueClassName="tabular-nums"
        />
      </div>

      {avgPointsContext && (
        <div className="border-t border-white/8 px-5 py-4 sm:px-6">
          <AvgPointsContextFootnote />
        </div>
      )}
    </div>
  );
}
