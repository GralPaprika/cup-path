"use client";

import type { PathStage, TeamPathSummary } from "@/lib/types";
import { getMatchStage, PATH_STAGES } from "@/lib/domain/match-stages";
import { useTranslations } from "next-intl";
import { TeamLabel } from "@/components/team-flag";
import { DifficultyGauge } from "@/components/difficulty-gauge";
import { Badge } from "@/components/ui/badge";
import { formatFifaPoints, formatWholeNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  summary: TeamPathSummary;
  hardestPathRank: number | null;
  cohortSize: number;
  cohortStage: PathStage;
  includedStages?: Set<PathStage>;
}

const COHORT_STAGE_KEYS: Record<PathStage, string> = {
  group: "groupStage",
  r32: "round32",
  r16: "round16",
  qf: "quarterFinal",
  sf: "semiFinal",
  final: "final",
};

function StatTile({
  label,
  value,
  className,
  valueClassName,
}: {
  label: string;
  value: string;
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
    </div>
  );
}

export function SummaryCard({
  summary,
  hardestPathRank,
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

  return (
    <div className="glass-panel">
      <div className="border-b border-white/8 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-4">
          <TeamLabel
            team={summary.team}
            showCode
            flagSize="lg"
            nameClassName="text-xl font-bold text-white sm:text-2xl"
          />
          <Badge
            variant="outline"
            className="border-wc-sky/30 bg-wc-sky/10 text-wc-sky"
          >
            {common("group", { group: summary.team.group })}
          </Badge>
          <Badge
            variant="outline"
            className="border-white/15 bg-white/5 text-muted-foreground"
          >
            {summary.team.confederation}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("matchesPlayed")}: {summary.playedCount}/{summary.totalCount}
          {!allStagesSelected && (
            <span> · {t("averagesFrom", { count: includedMatches.length })}</span>
          )}
        </p>
      </div>

      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(17.5rem,1fr)_auto_minmax(14rem,1fr)] lg:items-center lg:gap-8">
        <div className="grid min-w-[17.5rem] grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)] gap-3 sm:min-w-[19rem]">
          <StatTile
            label={t("fifaRank")}
            value={formatWholeNumber(summary.teamRank)}
            valueClassName="tabular-nums"
          />
          <StatTile
            label={t("fifaPoints")}
            value={formatFifaPoints(summary.teamPoints)}
            className="px-5"
            valueClassName="tabular-nums"
          />
          <StatTile
            label={t("avgRank")}
            value={formatWholeNumber(summary.avgOpponentRank)}
            valueClassName="tabular-nums"
          />
          <StatTile
            label={t("status")}
            value={summary.isEliminated ? t("eliminated") : t("active")}
            className="px-5"
            valueClassName={
              summary.isEliminated ? "text-wc-red" : "text-wc-green"
            }
          />
        </div>

        <div className="order-first flex min-w-0 flex-col items-center justify-center lg:order-none lg:min-w-[320px]">
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
                ? stages(COHORT_STAGE_KEYS[cohortStage])
                : undefined
            }
          />
        </div>

        <div className="glass-panel-subtle flex min-h-[9.5rem] flex-col justify-center px-6 py-5 sm:px-7 sm:py-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {t("nextOpponent")}
          </p>
          <div className="mt-2">
            {summary.nextOpponent ? (
              <TeamLabel
                team={summary.nextOpponent}
                showCode
                flagSize="md"
                nameClassName="text-lg font-semibold text-white"
              />
            ) : (
              <p className="text-2xl font-bold text-white/40">
                {t("noNextOpponent")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
