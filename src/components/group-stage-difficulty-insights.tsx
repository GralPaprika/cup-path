"use client";

import Link from "next/link";
import type {
  GroupStageDifficultyCohort,
  GroupStageDifficultyInsights,
  GroupStageDifficultySpotlight,
} from "@/lib/types";
import { TeamFlag } from "@/components/team-flag";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface GroupStageDifficultyInsightsProps {
  insights: GroupStageDifficultyInsights;
  meanAvgOpponentPoints: number | null;
  mode: string;
}

function formatQualificationRate(cohort: GroupStageDifficultyCohort): string {
  if (cohort.total === 0) return "—";
  const rate = Math.round((cohort.qualified / cohort.total) * 100);
  return `${rate}%`;
}

function CohortTile({
  label,
  cohort,
  countLabel,
  rateLabel,
  hint,
}: {
  label: string;
  cohort: GroupStageDifficultyCohort;
  countLabel: string;
  rateLabel: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{countLabel}</p>
      <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">
        {cohort.total === 0
          ? "—"
          : `${cohort.qualified}/${cohort.total}`}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{rateLabel}</p>
      <p className="mt-0.5 font-mono text-sm tabular-nums text-wc-sky">
        {formatQualificationRate(cohort)}
      </p>
      {hint ? (
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function SpotlightCard({
  title,
  spotlight,
  mode,
  sdOutlierLabel,
}: {
  title: string;
  spotlight: GroupStageDifficultySpotlight;
  mode: string;
  sdOutlierLabel: string;
}) {
  const t = useTranslations("home.groupExpectedFinishes");
  const deltaPrefix = spotlight.deltaFromMean >= 0 ? "+" : "";

  return (
    <Link
      href={`/team-analysis?team=${spotlight.team.id}&mode=${mode}`}
      className="group block rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 transition-colors hover:border-white/15 hover:bg-white/[0.05]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        {spotlight.isSdOutlier ? (
          <span className="shrink-0 rounded-full bg-wc-orange/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-wc-orange">
            {sdOutlierLabel}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <TeamFlag team={spotlight.team} size="sm" />
        <span className="font-mono text-sm font-semibold text-white group-hover:text-wc-sky">
          {spotlight.team.id}
        </span>
        <span className="text-xs text-muted-foreground">
          {t("groupLabel", { letter: spotlight.groupLetter })}
        </span>
      </div>

      <p className="mt-2 font-mono text-lg font-semibold tabular-nums text-white">
        {formatFifaPoints(spotlight.avgOpponentPoints)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {t("groupDifficultyDeltaFromMean", {
          delta: `${deltaPrefix}${formatFifaPoints(spotlight.deltaFromMean)}`,
        })}
      </p>
    </Link>
  );
}

export function GroupStageDifficultyInsightsPanel({
  insights,
  meanAvgOpponentPoints,
  mode,
}: GroupStageDifficultyInsightsProps) {
  const t = useTranslations("home.groupExpectedFinishes");

  const rateGapHint =
    insights.qualificationRateGap !== null &&
    insights.aboveMean.total > 0 &&
    insights.belowMean.total > 0
      ? t("groupDifficultyRateGapHint", {
          gap: Math.round(Math.abs(insights.qualificationRateGap) * 100),
          direction:
            insights.qualificationRateGap > 0
              ? t("groupDifficultyRateGapEasier")
              : t("groupDifficultyRateGapHarder"),
        })
      : undefined;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <CohortTile
          label={t("groupDifficultyAboveMean")}
          cohort={insights.aboveMean}
          countLabel={t("groupDifficultyQualifiedCount")}
          rateLabel={t("groupDifficultyQualificationRate")}
          hint={t("groupDifficultyAboveMeanHint")}
        />
        <CohortTile
          label={t("groupDifficultyBelowMean")}
          cohort={insights.belowMean}
          countLabel={t("groupDifficultyQualifiedCount")}
          rateLabel={t("groupDifficultyQualificationRate")}
          hint={t("groupDifficultyBelowMeanHint")}
        />
        <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {t("groupDifficultyMedianRivals")}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("groupDifficultyMedianQualified")}
          </p>
          <p className="font-mono text-lg font-semibold tabular-nums text-wc-green">
            {formatFifaPoints(insights.medianQualifiedAvg)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("groupDifficultyMedianEliminated")}
          </p>
          <p className="font-mono text-lg font-semibold tabular-nums text-wc-red">
            {formatFifaPoints(insights.medianEliminatedAvg)}
          </p>
          {rateGapHint ? (
            <p className={cn("mt-2 text-xs text-muted-foreground")}>
              {rateGapHint}
            </p>
          ) : null}
        </div>
      </div>

      {(insights.hardestDrawSurvivor || insights.easiestDrawCasualty) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {insights.hardestDrawSurvivor ? (
            <SpotlightCard
              title={t("groupDifficultyHardestSurvivor")}
              spotlight={insights.hardestDrawSurvivor}
              mode={mode}
              sdOutlierLabel={t("groupDifficultySdOutlier")}
            />
          ) : null}
          {insights.easiestDrawCasualty ? (
            <SpotlightCard
              title={t("groupDifficultyEasiestCasualty")}
              spotlight={insights.easiestDrawCasualty}
              mode={mode}
              sdOutlierLabel={t("groupDifficultySdOutlier")}
            />
          ) : null}
        </div>
      )}

      {meanAvgOpponentPoints !== null &&
      insights.atMean.total > 0 ? (
        <p className="text-xs text-muted-foreground">
          {t("groupDifficultyAtMeanNote", {
            count: insights.atMean.total,
            qualified: insights.atMean.qualified,
            mean: formatFifaPoints(meanAvgOpponentPoints),
          })}
        </p>
      ) : null}
    </div>
  );
}
