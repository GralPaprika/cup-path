"use client";

import { ChevronDown } from "lucide-react";
import type { PathStage } from "@/lib/types";
import type { CohortOrderingCorrelation } from "@/lib/domain/rank-correlation";
import type { PathOpponentStats } from "@/lib/domain/path-opponent-stats";
import { useTranslations } from "next-intl";
import { StatsBlock } from "@/components/stats-block";
import { formatStatValue } from "@/lib/format";
import { cn } from "@/lib/utils";

const COHORT_STAGE_KEYS: Record<PathStage, string> = {
  group: "groupStage",
  r32: "round32",
  r16: "round16",
  qf: "quarterFinal",
  sf: "semiFinal",
  final: "final",
};

interface AdvancedStatsPanelProps {
  pathStats: PathOpponentStats;
  cohortCorrelation: CohortOrderingCorrelation;
  hardestPathRank: number | null;
  hardestPathRankByAvgRank: number | null;
  cohortSize: number;
  cohortStage: PathStage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CorrelationTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="glass-panel-subtle px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-xl font-bold tabular-nums text-white">
        {value}
      </p>
    </div>
  );
}

export function AdvancedStatsPanel({
  pathStats,
  cohortCorrelation,
  hardestPathRank,
  hardestPathRankByAvgRank,
  cohortSize,
  cohortStage,
  open,
  onOpenChange,
}: AdvancedStatsPanelProps) {
  const t = useTranslations("analysis.advanced");
  const stages = useTranslations("compare.stages");
  const stageLabel = stages(COHORT_STAGE_KEYS[cohortStage]);

  const formatCorrelation = (value: number | null) =>
    value === null ? "—" : formatStatValue(value, 3);

  return (
    <details
      className="glass-panel group overflow-hidden"
      open={open}
      onToggle={(event) => {
        onOpenChange(event.currentTarget.open);
      }}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-white/8 bg-white/[0.03] px-5 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
        <div>
          <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </summary>

      <div className="space-y-6 px-5 py-5">
        <section>
          <h3 className="mb-1 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {t("cohortOrderingTitle")}
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">
            {t("cohortOrderingHint", {
              count: cohortCorrelation.comparableTeamCount,
              stage: stageLabel,
            })}
          </p>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <CorrelationTile
              label={t("spearmanRho")}
              value={formatCorrelation(cohortCorrelation.spearmanRho)}
            />
            <CorrelationTile
              label={t("kendallTau")}
              value={formatCorrelation(cohortCorrelation.kendallTau)}
            />
            <CorrelationTile
              label={t("rankByPoints")}
              value={
                hardestPathRank !== null
                  ? t("rankValue", { rank: hardestPathRank, total: cohortSize })
                  : "—"
              }
            />
            <CorrelationTile
              label={t("rankByAvgRank")}
              value={
                hardestPathRankByAvgRank !== null
                  ? t("rankValue", {
                      rank: hardestPathRankByAvgRank,
                      total: cohortSize,
                    })
                  : "—"
              }
            />
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {t("opponentDistributionTitle")}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatsBlock
              title={t("opponentPointsStats")}
              stats={pathStats.opponentPointsStats}
              isRank={false}
              variant="compact"
            />
            <StatsBlock
              title={t("opponentRankStats")}
              stats={pathStats.opponentRankStats}
              isRank
              variant="compact"
            />
          </div>
        </section>

        <div className="space-y-3 border-t border-white/8 pt-4 text-xs leading-relaxed text-muted-foreground">
          <p>{t("footnoteOpponentStats")}</p>
          <div>
            <p className="mb-2 font-semibold text-white/80">
              {t("correlationSectionTitle")}
            </p>
            <p className="mb-2">{t("spearmanBody")}</p>
            <p className="mb-2">{t("kendallBody")}</p>
            <p>{t("correlationWhyItMatters")}</p>
          </div>
          <p>{t("footnotePrimary")}</p>
        </div>
      </div>
    </details>
  );
}
