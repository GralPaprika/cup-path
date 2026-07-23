"use client";

import Link from "next/link";
import type {
  KnockoutOpponentDifficultyInsights,
  KnockoutOpponentDifficultySpotlight,
} from "@/lib/types";
import { TeamFlag } from "@/components/team/team-flag";
import { QualificationInsightsPanel } from "@/components/facts/qualification-insights-panel";
import { formatFifaPoints } from "@/lib/format";
import { useTranslations } from "next-intl";

interface KnockoutStageOpponentDifficultyInsightsProps {
  insights: KnockoutOpponentDifficultyInsights;
  meanOpponentPoints: number | null;
}

function SpotlightCard({
  title,
  spotlight,
  sdOutlierLabel,
}: {
  title: string;
  spotlight: KnockoutOpponentDifficultySpotlight;
  sdOutlierLabel: string;
}) {
  const shared = useTranslations("home.knockoutStage");
  const deltaPrefix = spotlight.deltaFromMean >= 0 ? "+" : "";

  return (
    <Link
      href={`/team-analysis?team=${spotlight.team.id}`}
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
          {shared("opponentDifficultyVs", { opponent: spotlight.opponent.id })}
        </span>
      </div>

      <p className="mt-2 font-mono text-lg font-semibold tabular-nums text-white">
        {formatFifaPoints(spotlight.opponentFifaPoints)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {shared("opponentDifficultyDeltaFromMean", {
          delta: `${deltaPrefix}${formatFifaPoints(spotlight.deltaFromMean)}`,
        })}
      </p>
    </Link>
  );
}

export function KnockoutStageOpponentDifficultyInsightsPanel({
  insights,
  meanOpponentPoints,
}: KnockoutStageOpponentDifficultyInsightsProps) {
  const shared = useTranslations("home.knockoutStage");

  const rateGapHint =
    insights.qualificationRateGap !== null &&
    insights.aboveMean.total > 0 &&
    insights.belowMean.total > 0
      ? shared("opponentDifficultyRateGapHint", {
          gap: Math.round(Math.abs(insights.qualificationRateGap) * 100),
          direction:
            insights.qualificationRateGap > 0
              ? shared("opponentDifficultyRateGapEasier")
              : shared("opponentDifficultyRateGapHarder"),
        })
      : undefined;

  const atMeanNote =
    meanOpponentPoints !== null && insights.atMean.total > 0
      ? shared("opponentDifficultyAtMeanNote", {
          count: insights.atMean.total,
          qualified: insights.atMean.qualified,
          mean: formatFifaPoints(meanOpponentPoints),
        })
      : undefined;

  return (
    <QualificationInsightsPanel
      insights={{
        aboveMean: insights.aboveMean,
        belowMean: insights.belowMean,
        atMean: insights.atMean,
        medianQualified: insights.medianQualifiedOpponent,
        medianEliminated: insights.medianEliminatedOpponent,
        qualificationRateGap: insights.qualificationRateGap,
      }}
      labels={{
        aboveMean: shared("opponentDifficultyAboveMean"),
        aboveMeanHint: shared("opponentDifficultyAboveMeanHint"),
        belowMean: shared("opponentDifficultyBelowMean"),
        belowMeanHint: shared("opponentDifficultyBelowMeanHint"),
        qualifiedCount: shared("opponentDifficultyQualifiedCount"),
        qualificationRate: shared("opponentDifficultyQualificationRate"),
        medianRivals: shared("opponentDifficultyMedianRivals"),
        medianQualified: shared("opponentDifficultyMedianQualified"),
        medianEliminated: shared("opponentDifficultyMedianEliminated"),
      }}
      rateGapHint={rateGapHint}
      atMeanNote={atMeanNote}
      hardestSpotlight={
        insights.hardestOpponentQualifier ? (
          <SpotlightCard
            title={shared("opponentDifficultyHardestQualifier")}
            spotlight={insights.hardestOpponentQualifier}
            sdOutlierLabel={shared("opponentDifficultySdOutlier")}
          />
        ) : undefined
      }
      easiestSpotlight={
        insights.easiestOpponentEliminated ? (
          <SpotlightCard
            title={shared("opponentDifficultyEasiestEliminated")}
            spotlight={insights.easiestOpponentEliminated}
            sdOutlierLabel={shared("opponentDifficultySdOutlier")}
          />
        ) : undefined
      }
    />
  );
}
