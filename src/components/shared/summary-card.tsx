"use client";

import Link from "next/link";
import type { AvgPointsContext, PathStage, TeamPathSummary } from "@/lib/types";
import { getMatchStage, isThirdPlaceMatch, PATH_STAGES } from "@/lib/domain/match/match-stages";
import { useTranslations } from "next-intl";
import { TeamLabel } from "@/components/team/team-flag";
import { TeamTierBadge } from "@/components/team/team-tier-badge";
import { DifficultyGauge } from "@/components/shared/difficulty-gauge";
import {
  AvgPointsContextFootnote,
  AvgPointsContextHint,
} from "@/components/shared/avg-points-context";
import { KNOCKOUT_SECTION_IDS } from "@/components/facts/facts-section-nav";
import { Badge } from "@/components/ui/badge";
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
  | { kind: "champion" }
  | { kind: "runnerUp" }
  | { kind: "thirdPlace" }
  | { kind: "eliminated"; round: string }
  | { kind: "active" };

function getPathOutcome(summary: TeamPathSummary): PathOutcome {
  const finalMatch = summary.matches.find(
    (match) => match.isPlayed && getMatchStage(match.round) === "final",
  );
  if (finalMatch?.result === "W") return { kind: "champion" };
  if (finalMatch?.result === "L") return { kind: "runnerUp" };

  const thirdPlaceMatch = summary.matches.find(
    (match) => match.isPlayed && isThirdPlaceMatch(match.round),
  );
  if (thirdPlaceMatch?.result === "W") return { kind: "thirdPlace" };

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

function StatTile({
  label,
  value,
  hint,
  className,
  valueClassName,
}: {
  label: string;
  value: string;
  hint?: React.ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn("glass-panel-subtle px-4 py-3", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-xl font-bold leading-tight text-white",
          valueClassName,
        )}
      >
        {value}
      </p>
      {hint}
    </div>
  );
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
    outcome.kind === "champion"
      ? t("outcomeChampion")
      : outcome.kind === "runnerUp"
        ? t("outcomeRunnerUp")
        : outcome.kind === "thirdPlace"
          ? t("outcomeThirdPlace")
          : outcome.kind === "eliminated" && eliminatedRoundLabel != null
            ? t("outcomeEliminatedIn", { round: eliminatedRoundLabel })
            : t("active");
  const outcomeClassName =
    outcome.kind === "champion"
      ? "border-wc-orange/40 bg-wc-orange/15 text-wc-orange"
      : outcome.kind === "runnerUp"
        ? "border-white/20 bg-white/10 text-white"
        : outcome.kind === "thirdPlace"
          ? "border-amber-500/40 bg-amber-500/15 text-amber-200"
          : outcome.kind === "eliminated"
            ? "border-wc-red/30 bg-wc-red/20 text-wc-red"
            : "border-wc-green/30 bg-wc-green/20 text-wc-green";

  const outcomeChipHoverClassName =
    outcome.kind === "champion"
      ? "hover:border-wc-orange/60 hover:bg-wc-orange/25"
      : outcome.kind === "runnerUp"
        ? "hover:border-white/35 hover:bg-white/15"
        : outcome.kind === "thirdPlace"
          ? "hover:border-amber-500/60 hover:bg-amber-500/25"
          : outcome.kind === "eliminated"
            ? "hover:border-wc-red/50 hover:bg-wc-red/30"
            : "";

  const overviewHref = getOverviewHrefForOutcome(outcome);
  const overviewRoundPrompt =
    outcome.kind === "eliminated"
      ? eliminatedRoundLabel
      : outcome.kind === "champion" || outcome.kind === "runnerUp"
        ? getRoundDisplayName(stages, "Final")
        : outcome.kind === "thirdPlace"
          ? getRoundDisplayName(stages, "Semi-final")
          : null;
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
          valueClassName="tabular-nums"
        />
        <StatTile
          label={t("fifaRank")}
          value={formatWholeNumber(summary.teamRank)}
          valueClassName="tabular-nums"
        />
        <StatTile
          label={t("avgDifficulty")}
          value={formatFifaPoints(summary.avgOpponentPoints)}
          hint={
            <AvgPointsContextHint context={avgPointsContext} align="left" />
          }
          valueClassName="tabular-nums text-wc-orange"
        />
        <StatTile
          label={t("avgRank")}
          value={formatStatValue(summary.avgOpponentRank, 1)}
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
