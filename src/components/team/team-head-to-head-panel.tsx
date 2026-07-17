"use client";

import { useEffect, useState } from "react";
import type { ComparisonEntry, PathStage, RankingMode, Team } from "@/lib/types";
import type { TeamAnalysisResult } from "@/lib/services/analysis-service";
import { useTranslations } from "next-intl";
import { TeamSelector } from "@/components/team/team-selector";
import { TeamLabel } from "@/components/team/team-flag";
import {
  AvgPointsContextFootnote,
  AvgPointsContextHint,
} from "@/components/shared/avg-points-context";
import {
  HeadToHeadPointsChart,
  type HeadToHeadPathSeries,
} from "@/components/path/head-to-head-points-chart";
import { serializePathStages } from "@/components/path/path-stage-filters";
import { Badge } from "@/components/ui/badge";
import { formatFifaPoints, formatStatValue } from "@/lib/format";
import { COMPARE_STAGE_I18N_KEYS } from "@/lib/i18n/stage-keys";
import { cn } from "@/lib/utils";

interface TeamHeadToHeadPanelProps {
  teams: Team[];
  entries: ComparisonEntry[];
  teamAId: string;
  teamBId: string;
  onTeamAChange: (teamId: string) => void;
  onTeamBChange: (teamId: string) => void;
  cohortStage: PathStage;
  cohortSize: number;
  mode: RankingMode;
  stages: Set<PathStage>;
}

function buildPathSeries(analysis: TeamAnalysisResult): HeadToHeadPathSeries {
  return {
    team: analysis.summary.team,
    teamPoints: analysis.summary.teamPoints,
    avgOpponentPoints: analysis.summary.avgOpponentPoints,
    opponents: analysis.advanced.pathStats.opponentPointsObservations,
  };
}

function findEntry(
  entries: ComparisonEntry[],
  teamId: string,
): ComparisonEntry | undefined {
  if (!teamId) return undefined;
  return entries.find((entry) => entry.team.id === teamId);
}

function formatPointsDelta(a: number | null, b: number | null): string | null {
  if (a === null || b === null) return null;
  const delta = a - b;
  if (delta === 0) return "0";
  const sign = delta > 0 ? "+" : "-";
  return `${sign}${formatFifaPoints(Math.abs(delta))}`;
}

function formatRankDelta(a: number | null, b: number | null): string | null {
  if (a === null || b === null) return null;
  const delta = a - b;
  if (delta === 0) return "0";
  const sign = delta > 0 ? "+" : "-";
  return `${sign}${formatStatValue(Math.abs(delta), 1)}`;
}

function StatRow({
  label,
  valueA,
  valueB,
  delta,
  hintA,
  hintB,
  valueClassName,
}: {
  label: string;
  valueA: string;
  valueB: string;
  delta: string | null;
  hintA?: React.ReactNode;
  hintB?: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)] items-center gap-3 border-b border-white/6 px-4 py-3 last:border-b-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-right">
        <p
          className={cn(
            "font-mono text-sm font-semibold tabular-nums text-white",
            valueClassName,
          )}
        >
          {valueA}
        </p>
        {hintA}
      </div>
      <div className="text-right">
        <p
          className={cn(
            "font-mono text-sm font-semibold tabular-nums text-white",
            valueClassName,
          )}
        >
          {valueB}
        </p>
        {hintB}
      </div>
      <p className="text-right font-mono text-xs tabular-nums text-muted-foreground">
        {delta ?? "—"}
      </p>
    </div>
  );
}

export function TeamHeadToHeadPanel({
  teams,
  entries,
  teamAId,
  teamBId,
  onTeamAChange,
  onTeamBChange,
  cohortStage,
  cohortSize,
  mode,
  stages,
}: TeamHeadToHeadPanelProps) {
  const t = useTranslations("compare.headToHead");
  const summary = useTranslations("summary");
  const stageLabels = useTranslations("compare.stages");
  const [analysisA, setAnalysisA] = useState<TeamAnalysisResult | null>(null);
  const [analysisB, setAnalysisB] = useState<TeamAnalysisResult | null>(null);
  const [chartLoading, setChartLoading] = useState(false);

  const entryA = findEntry(entries, teamAId);
  const entryB = findEntry(entries, teamBId);
  const showComparison =
    Boolean(entryA && entryB) && teamAId !== teamBId;

  useEffect(() => {
    if (!showComparison) {
      setAnalysisA(null);
      setAnalysisB(null);
      return;
    }

    let cancelled = false;
    setChartLoading(true);

    const requestAnalysis = (team: string) =>
      fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team,
          mode,
          stages: serializePathStages(stages),
        }),
      }).then((res) =>
        res.ok ? (res.json() as Promise<TeamAnalysisResult>) : null,
      );

    Promise.all([
      requestAnalysis(teamAId),
      requestAnalysis(teamBId),
    ])
      .then(([nextA, nextB]) => {
        if (cancelled) return;
        setAnalysisA(nextA);
        setAnalysisB(nextB);
      })
      .finally(() => {
        if (!cancelled) setChartLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showComparison, teamAId, teamBId, mode, stages]);

  const pointsDelta = formatPointsDelta(
    entryA?.avgOpponentPoints ?? null,
    entryB?.avgOpponentPoints ?? null,
  );
  const rankDelta = formatRankDelta(
    entryA?.avgOpponentRank ?? null,
    entryB?.avgOpponentRank ?? null,
  );

  const harderTeam =
    entryA &&
    entryB &&
    entryA.avgOpponentPoints !== null &&
    entryB.avgOpponentPoints !== null
      ? entryA.avgOpponentPoints > entryB.avgOpponentPoints
        ? entryA.team
        : entryB.avgOpponentPoints > entryA.avgOpponentPoints
          ? entryB.team
          : null
      : null;

  const pointsGap =
    entryA?.avgOpponentPoints !== null &&
    entryB?.avgOpponentPoints !== null &&
    entryA &&
    entryB
      ? Math.abs(entryA.avgOpponentPoints - entryB.avgOpponentPoints)
      : null;

  return (
    <section className="mb-6 space-y-5 rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div>
        <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
        <TeamSelector
          teams={teams}
          value={teamAId}
          onChange={onTeamAChange}
          label={t("teamA")}
          placeholder={t("pickTeam")}
        />
        <p className="hidden pb-3 text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground lg:block">
          {t("versus")}
        </p>
        <TeamSelector
          teams={teams}
          value={teamBId}
          onChange={onTeamBChange}
          label={t("teamB")}
          placeholder={t("pickTeam")}
        />
      </div>

      {showComparison && entryA && entryB && (
        <div className="overflow-hidden rounded-xl border border-white/8">
          <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)] gap-3 border-b border-white/8 bg-white/[0.03] px-4 py-3">
            <span />
            <div className="flex justify-end">
              <TeamLabel
                team={entryA.team}
                showCode
                flagSize="sm"
                nameClassName="text-sm font-semibold text-white"
              />
            </div>
            <div className="flex justify-end">
              <TeamLabel
                team={entryB.team}
                showCode
                flagSize="sm"
                nameClassName="text-sm font-semibold text-white"
              />
            </div>
            <p className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t("delta")}
            </p>
          </div>

          <StatRow
            label={t("avgOpponentPoints")}
            valueA={formatFifaPoints(entryA.avgOpponentPoints)}
            valueB={formatFifaPoints(entryB.avgOpponentPoints)}
            delta={pointsDelta}
            hintA={<AvgPointsContextHint context={entryA.avgPointsContext} />}
            hintB={<AvgPointsContextHint context={entryB.avgPointsContext} />}
            valueClassName="text-wc-orange"
          />
          <StatRow
            label={t("avgOpponentRank")}
            valueA={
              entryA.avgOpponentRank !== null
                ? formatStatValue(entryA.avgOpponentRank, 1)
                : "—"
            }
            valueB={
              entryB.avgOpponentRank !== null
                ? formatStatValue(entryB.avgOpponentRank, 1)
                : "—"
            }
            delta={rankDelta}
          />
          <StatRow
            label={t("pathRank")}
            valueA={
              entryA.rankAmongTeams !== null
                ? `#${entryA.rankAmongTeams} / ${cohortSize}`
                : "—"
            }
            valueB={
              entryB.rankAmongTeams !== null
                ? `#${entryB.rankAmongTeams} / ${cohortSize}`
                : "—"
            }
            delta={
              entryA.rankAmongTeams !== null && entryB.rankAmongTeams !== null
                ? formatRankDelta(
                    entryA.rankAmongTeams,
                    entryB.rankAmongTeams,
                  )
                : null
            }
          />
          <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)] items-center gap-3 px-4 py-3">
            <p className="text-sm text-muted-foreground">{t("status")}</p>
            <div className="flex justify-end">
              <Badge
                variant="outline"
                className={cn(
                  "min-w-[5.5rem] justify-center",
                  entryA.isEliminated
                    ? "border-wc-red/30 bg-wc-red/20 text-wc-red"
                    : "border-wc-green/30 bg-wc-green/20 text-wc-green",
                )}
              >
                {entryA.isEliminated
                  ? summary("eliminated")
                  : summary("active")}
              </Badge>
            </div>
            <div className="flex justify-end">
              <Badge
                variant="outline"
                className={cn(
                  "min-w-[5.5rem] justify-center",
                  entryB.isEliminated
                    ? "border-wc-red/30 bg-wc-red/20 text-wc-red"
                    : "border-wc-green/30 bg-wc-green/20 text-wc-green",
                )}
              >
                {entryB.isEliminated
                  ? summary("eliminated")
                  : summary("active")}
              </Badge>
            </div>
            <span />
          </div>
        </div>
      )}

      {showComparison && chartLoading && (
        <div className="rounded-xl border border-white/8 bg-black/10 px-4 py-8 text-center text-sm text-muted-foreground">
          {t("chartLoading")}
        </div>
      )}

      {showComparison &&
        !chartLoading &&
        analysisA &&
        analysisB &&
        (analysisA.advanced.pathStats.opponentPointsObservations.length > 0 ||
          analysisB.advanced.pathStats.opponentPointsObservations.length > 0) && (
          <HeadToHeadPointsChart
            seriesA={buildPathSeries(analysisA)}
            seriesB={buildPathSeries(analysisB)}
            title={t("chartTitle")}
            teamPointsLegend={t("teamPointsLegend")}
            avgOpponentLegend={t("avgOpponentLegend")}
            opponentPathLegend={t("opponentPathLegend")}
            matchLabel={t("matchLabel")}
            ariaLabel={t("chartAria", {
              teamA: analysisA.summary.team.id,
              teamB: analysisB.summary.team.id,
            })}
          />
        )}

      {showComparison && harderTeam && pointsGap !== null && pointsGap > 0 && (
        <p className="text-sm text-muted-foreground">
          {t("harderPathSummary", {
            team: harderTeam.displayName,
            gap: formatFifaPoints(pointsGap),
          })}
        </p>
      )}

      {showComparison &&
        entryA &&
        entryB &&
        entryA.rankAmongTeams === null &&
        entryB.rankAmongTeams === null && (
          <p className="text-xs text-muted-foreground">{t("rankUnavailable")}</p>
        )}

      {!showComparison && teamAId && teamBId && teamAId === teamBId && (
        <p className="text-sm text-wc-orange">{t("sameTeam")}</p>
      )}

      {!showComparison &&
        (teamAId || teamBId) &&
        !(teamAId && teamBId && teamAId === teamBId) && (
        <p className="text-sm text-muted-foreground">{t("pickBoth")}</p>
      )}

      {showComparison && (entryA?.avgPointsContext || entryB?.avgPointsContext) && (
        <AvgPointsContextFootnote />
      )}

      {showComparison && (
        <p className="text-xs text-muted-foreground">
          {t("rankCohortNote", {
            stage: stageLabels(COMPARE_STAGE_I18N_KEYS[cohortStage]),
          })}
        </p>
      )}
    </section>
  );
}
