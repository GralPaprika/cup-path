"use client";

import type { GroupStageDifficultyCohort } from "@/lib/types";
import { formatFifaPoints } from "@/lib/format";

export interface QualificationInsightsData {
  aboveMean: GroupStageDifficultyCohort;
  belowMean: GroupStageDifficultyCohort;
  atMean: GroupStageDifficultyCohort;
  medianQualified: number | null;
  medianEliminated: number | null;
  qualificationRateGap: number | null;
}

export interface QualificationInsightsLabels {
  aboveMean: string;
  aboveMeanHint: string;
  belowMean: string;
  belowMeanHint: string;
  qualifiedCount: string;
  qualificationRate: string;
  medianRivals: string;
  medianQualified: string;
  medianEliminated: string;
}

interface QualificationInsightsPanelProps {
  insights: QualificationInsightsData;
  labels: QualificationInsightsLabels;
  rateGapHint?: string;
  atMeanNote?: string;
  hardestSpotlight?: React.ReactNode;
  easiestSpotlight?: React.ReactNode;
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
        {cohort.total === 0 ? "—" : `${cohort.qualified}/${cohort.total}`}
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

export function QualificationInsightsPanel({
  insights,
  labels,
  rateGapHint,
  atMeanNote,
  hardestSpotlight,
  easiestSpotlight,
}: QualificationInsightsPanelProps) {
  const showSpotlights = hardestSpotlight || easiestSpotlight;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <CohortTile
          label={labels.aboveMean}
          cohort={insights.aboveMean}
          countLabel={labels.qualifiedCount}
          rateLabel={labels.qualificationRate}
          hint={labels.aboveMeanHint}
        />
        <CohortTile
          label={labels.belowMean}
          cohort={insights.belowMean}
          countLabel={labels.qualifiedCount}
          rateLabel={labels.qualificationRate}
          hint={labels.belowMeanHint}
        />
        <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {labels.medianRivals}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {labels.medianQualified}
          </p>
          <p className="font-mono text-lg font-semibold tabular-nums text-wc-green">
            {formatFifaPoints(insights.medianQualified)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {labels.medianEliminated}
          </p>
          <p className="font-mono text-lg font-semibold tabular-nums text-wc-red">
            {formatFifaPoints(insights.medianEliminated)}
          </p>
          {rateGapHint ? (
            <p className="mt-2 text-xs text-muted-foreground">{rateGapHint}</p>
          ) : null}
        </div>
      </div>

      {showSpotlights ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {hardestSpotlight}
          {easiestSpotlight}
        </div>
      ) : null}

      {atMeanNote ? (
        <p className="text-xs text-muted-foreground">{atMeanNote}</p>
      ) : null}
    </div>
  );
}
