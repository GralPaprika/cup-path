"use client";

import Link from "next/link";
import type {
  GroupStageDifficultyInsights,
  GroupStageDifficultySpotlight,
} from "@/lib/types";
import { TeamFlag } from "@/components/team/team-flag";
import { QualificationInsightsPanel } from "@/components/facts/qualification-insights-panel";
import { formatFifaPoints } from "@/lib/format";
import { useTranslations } from "next-intl";

interface GroupStageDifficultyInsightsProps {
  insights: GroupStageDifficultyInsights;
  meanAvgOpponentPoints: number | null;
  mode: string;
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

  const atMeanNote =
    meanAvgOpponentPoints !== null && insights.atMean.total > 0
      ? t("groupDifficultyAtMeanNote", {
          count: insights.atMean.total,
          qualified: insights.atMean.qualified,
          mean: formatFifaPoints(meanAvgOpponentPoints),
        })
      : undefined;

  return (
    <QualificationInsightsPanel
      insights={{
        aboveMean: insights.aboveMean,
        belowMean: insights.belowMean,
        atMean: insights.atMean,
        medianQualified: insights.medianQualifiedAvg,
        medianEliminated: insights.medianEliminatedAvg,
        qualificationRateGap: insights.qualificationRateGap,
      }}
      labels={{
        aboveMean: t("groupDifficultyAboveMean"),
        aboveMeanHint: t("groupDifficultyAboveMeanHint"),
        belowMean: t("groupDifficultyBelowMean"),
        belowMeanHint: t("groupDifficultyBelowMeanHint"),
        qualifiedCount: t("groupDifficultyQualifiedCount"),
        qualificationRate: t("groupDifficultyQualificationRate"),
        medianRivals: t("groupDifficultyMedianRivals"),
        medianQualified: t("groupDifficultyMedianQualified"),
        medianEliminated: t("groupDifficultyMedianEliminated"),
      }}
      rateGapHint={rateGapHint}
      atMeanNote={atMeanNote}
      hardestSpotlight={
        insights.hardestDrawSurvivor ? (
          <SpotlightCard
            title={t("groupDifficultyHardestSurvivor")}
            spotlight={insights.hardestDrawSurvivor}
            mode={mode}
            sdOutlierLabel={t("groupDifficultySdOutlier")}
          />
        ) : undefined
      }
      easiestSpotlight={
        insights.easiestDrawCasualty ? (
          <SpotlightCard
            title={t("groupDifficultyEasiestCasualty")}
            spotlight={insights.easiestDrawCasualty}
            mode={mode}
            sdOutlierLabel={t("groupDifficultySdOutlier")}
          />
        ) : undefined
      }
    />
  );
}
