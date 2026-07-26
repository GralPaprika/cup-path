"use client";

import type {
  AvgPointsContext,
  PathChartData,
  PathDiffRow,
  Team,
  TeamPathSummary,
} from "@/lib/types";
import { getTeamDisplayName } from "@/lib/i18n/team-display-name";
import { getRoundDisplayName } from "@/lib/i18n/round-display-name";
import { useTranslations } from "next-intl";
import { TeamFlag } from "@/components/team/team-flag";
import {
  AvgPointsContextFootnote,
  AvgPointsContextHint,
} from "@/components/shared/avg-points-context";
import { StatTile } from "@/components/shared/stat-tile";
import { TeamSelector } from "@/components/team/team-selector";
import { formatFifaPoints, formatStatValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CHART_COLORS } from "@/lib/chart-colors";
import { SimulatedPathPointsChart } from "@/components/path/simulated-path-points-chart";

interface TeamPathImpactPanelProps {
  teams: Team[];
  teamId: string;
  onTeamChange: (teamId: string) => void;
  actualSummary: TeamPathSummary;
  simulatedSummary: TeamPathSummary;
  actualAvgPointsContext: AvgPointsContext | null;
  simulatedAvgPointsContext: AvgPointsContext | null;
  comparisonSummary: TeamPathSummary | null;
  comparisonAvgPointsContext: AvgPointsContext | null;
  comparisonTeamId: string;
  onComparisonTeamChange: (teamId: string) => void;
  pathDiff: PathDiffRow[];
  hasOverrides: boolean;
  actualPathChart: PathChartData;
  simulatedPathChart: PathChartData;
  comparisonPathChart: PathChartData | null;
  /** When true, omit the outer glass panel and page title. */
  embedded?: boolean;
}

function formatPointsDelta(
  baseline: number | null,
  simulated: number | null,
): string | null {
  if (baseline === null || simulated === null) return null;
  const delta = simulated - baseline;
  if (delta === 0) return "0";
  const sign = delta > 0 ? "+" : "-";
  return `${sign}${formatFifaPoints(Math.abs(delta))}`;
}

function formatRankDelta(
  baseline: number | null,
  simulated: number | null,
): string | null {
  if (baseline === null || simulated === null) return null;
  const delta = simulated - baseline;
  if (delta === 0) return "0";
  const sign = delta > 0 ? "+" : "-";
  return `${sign}${formatStatValue(Math.abs(delta), 1)}`;
}

function deltaToneFromPoints(
  delta: number | null,
): "positive" | "negative" | "neutral" {
  if (delta === null || delta === 0) return "neutral";
  return delta > 0 ? "negative" : "positive";
}

function PathSummaryCard({
  title,
  team,
  avgPoints,
  avgRank,
  avgPointsContext,
  delta,
  deltaTone,
  basis,
  accentClassName,
  banner,
  bannerTone,
}: {
  title: string;
  team: Team;
  avgPoints: number | null;
  avgRank: number | null;
  avgPointsContext: AvgPointsContext | null;
  delta?: string | null;
  deltaTone?: "positive" | "negative" | "neutral";
  basis?: string;
  accentClassName?: string;
  banner?: string | null;
  bannerTone?: "positive" | "negative" | "neutral";
}) {
  const summary = useTranslations("summary");
  const teamNames = useTranslations("teams");

  return (
    <div
      className={cn(
        "glass-panel-subtle flex flex-col gap-3 p-4",
        accentClassName,
      )}
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <TeamFlag team={team} size="sm" />
          <p className="truncate text-sm font-semibold text-white">
            {getTeamDisplayName(teamNames, team)}
          </p>
        </div>
      </div>
      {banner && (
        <p
          className={cn(
            "rounded-lg border px-3 py-2 text-xs font-medium sm:text-sm",
            bannerTone === "negative"
              ? "border-wc-orange/35 bg-wc-orange/10 text-wc-orange"
              : bannerTone === "positive"
                ? "border-wc-sky/35 bg-wc-sky/10 text-wc-sky"
                : "border-white/10 bg-white/5 text-muted-foreground",
          )}
        >
          {banner}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <StatTile
          label={summary("avgDifficulty")}
          value={formatFifaPoints(avgPoints)}
          size="md"
          delta={delta}
          deltaTone={deltaTone}
          basis={basis}
          hint={
            <AvgPointsContextHint context={avgPointsContext} align="left" />
          }
          valueClassName="text-wc-orange"
          className="border-white/6 bg-white/[0.02] px-3 py-2.5"
        />
        <StatTile
          label={summary("avgRank")}
          value={avgRank !== null ? formatStatValue(avgRank, 1) : "—"}
          size="md"
          className="border-white/6 bg-white/[0.02] px-3 py-2.5"
        />
      </div>
    </div>
  );
}

function ValueCell({
  value,
  hint,
  valueClassName,
}: {
  value: string;
  hint?: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="text-right">
      <p
        className={cn(
          "font-mono text-sm font-semibold tabular-nums text-white",
          valueClassName,
        )}
      >
        {value}
      </p>
      {hint}
    </div>
  );
}

function StatRow({
  label,
  focusValue,
  simulatedValue,
  comparisonValue,
  deltaVsFocus,
  deltaVsComparison,
  hintFocus,
  hintSimulated,
  hintComparison,
  valueClassName,
  gridTemplateColumns,
}: {
  label: string;
  focusValue: string;
  simulatedValue: string;
  comparisonValue?: string;
  deltaVsFocus: string | null;
  deltaVsComparison?: string | null;
  hintFocus?: React.ReactNode;
  hintSimulated?: React.ReactNode;
  hintComparison?: React.ReactNode;
  valueClassName?: string;
  gridTemplateColumns: string;
}) {
  return (
    <div
      className="grid items-center gap-3 border-b border-white/6 px-4 py-3 last:border-b-0"
      style={{ gridTemplateColumns }}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <ValueCell
        value={focusValue}
        hint={hintFocus}
        valueClassName={valueClassName}
      />
      <ValueCell
        value={simulatedValue}
        hint={hintSimulated}
        valueClassName={valueClassName}
      />
      <p className="text-right font-mono text-xs tabular-nums text-muted-foreground">
        {deltaVsFocus ?? "—"}
      </p>
      {comparisonValue !== undefined && (
        <>
          <ValueCell
            value={comparisonValue}
            hint={hintComparison}
            valueClassName={valueClassName}
          />
          <p className="text-right font-mono text-xs tabular-nums text-muted-foreground">
            {deltaVsComparison ?? "—"}
          </p>
        </>
      )}
    </div>
  );
}

function OpponentCell({
  teamId,
  teams,
  changed,
}: {
  teamId: string | null;
  teams: Team[];
  changed?: boolean;
}) {
  const teamNames = useTranslations("teams");
  const team = teamId ? teams.find((entry) => entry.id === teamId) : null;
  const name = team ? getTeamDisplayName(teamNames, team) : null;

  if (!team || !name) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        changed && "text-wc-orange",
      )}
    >
      <TeamFlag team={team} size="sm" />
      <span className="text-sm font-medium">{name}</span>
    </span>
  );
}

export function TeamPathImpactPanel({
  teams,
  teamId,
  onTeamChange,
  actualSummary,
  simulatedSummary,
  actualAvgPointsContext,
  simulatedAvgPointsContext,
  comparisonSummary,
  comparisonAvgPointsContext,
  comparisonTeamId,
  onComparisonTeamChange,
  pathDiff,
  hasOverrides,
  actualPathChart,
  simulatedPathChart,
  comparisonPathChart,
  embedded = false,
}: TeamPathImpactPanelProps) {
  const t = useTranslations("simulate");
  const summary = useTranslations("summary");
  const stages = useTranslations("compare.stages");
  const teamNames = useTranslations("teams");
  const changedRows = pathDiff.filter((row) => row.opponentChanged);
  const showComparison = Boolean(comparisonTeamId && comparisonSummary);
  const focusTeamName = getTeamDisplayName(teamNames, actualSummary.team);
  const comparisonTeamName = comparisonSummary
    ? getTeamDisplayName(teamNames, comparisonSummary.team)
    : "";
  const comparisonTeams = teams.filter((team) => team.id !== teamId);

  const gridTemplateColumns = showComparison
    ? "minmax(0,1fr) minmax(0,0.85fr) minmax(0,0.85fr) minmax(0,0.55fr) minmax(0,0.85fr) minmax(0,0.55fr)"
    : "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,0.65fr)";

  const pointsDelta =
    actualSummary.avgOpponentPoints !== null &&
    simulatedSummary.avgOpponentPoints !== null
      ? simulatedSummary.avgOpponentPoints - actualSummary.avgOpponentPoints
      : null;

  const comparisonPointsDelta =
    showComparison &&
    comparisonSummary &&
    comparisonSummary.avgOpponentPoints !== null &&
    simulatedSummary.avgOpponentPoints !== null
      ? simulatedSummary.avgOpponentPoints -
        comparisonSummary.avgOpponentPoints
      : null;

  const actualChart = actualPathChart;
  const simulatedChart = simulatedPathChart;
  const comparisonChart = comparisonPathChart;
  const showPathChart =
    actualChart.opponents.length > 0 ||
    simulatedChart.opponents.length > 0 ||
    (comparisonChart?.opponents.length ?? 0) > 0;

  const verdict =
    pointsDelta !== null && hasOverrides
      ? pointsDelta > 0
        ? t("harderBy", { gap: formatFifaPoints(Math.abs(pointsDelta)) })
        : pointsDelta < 0
          ? t("easierBy", { gap: formatFifaPoints(Math.abs(pointsDelta)) })
          : t("pathUnchanged")
      : null;

  return (
    <div className={cn("space-y-5", !embedded && "glass-panel p-5 sm:p-6")}>
      {!embedded && (
        <h2 className="text-lg font-semibold text-white">
          {t("pathComparison")}
        </h2>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TeamSelector
          teams={teams}
          value={teamId}
          onChange={onTeamChange}
          size="compact"
          hideLabel
          className="max-w-xs shrink-0"
          triggerClassName="glass-panel-subtle"
        />
        <TeamSelector
          teams={comparisonTeams}
          value={comparisonTeamId}
          onChange={onComparisonTeamChange}
          label={t("compareTo")}
          allowNone
          noneLabel={t("compareToNone")}
          size="compact"
          className="flex shrink-0 flex-row items-center gap-2 space-y-0"
        />
      </div>

      <div
        className={cn(
          "grid gap-3",
          showComparison ? "lg:grid-cols-3" : "sm:grid-cols-2",
        )}
      >
        <PathSummaryCard
          title={t("actualPath")}
          team={actualSummary.team}
          avgPoints={actualSummary.avgOpponentPoints}
          avgRank={actualSummary.avgOpponentRank}
          avgPointsContext={actualAvgPointsContext}
          basis={t("summaryCardActualBasis")}
        />
        <PathSummaryCard
          title={t("simulatedPath")}
          team={simulatedSummary.team}
          avgPoints={simulatedSummary.avgOpponentPoints}
          avgRank={simulatedSummary.avgOpponentRank}
          avgPointsContext={simulatedAvgPointsContext}
          delta={formatPointsDelta(
            actualSummary.avgOpponentPoints,
            simulatedSummary.avgOpponentPoints,
          )}
          deltaTone={deltaToneFromPoints(pointsDelta)}
          basis={t("summaryCardSimulatedBasis")}
          accentClassName={hasOverrides ? "border-wc-orange/30" : undefined}
          banner={verdict}
          bannerTone={deltaToneFromPoints(pointsDelta)}
        />
        {showComparison && comparisonSummary ? (
          <PathSummaryCard
            title={t("comparisonActualPath")}
            team={comparisonSummary.team}
            avgPoints={comparisonSummary.avgOpponentPoints}
            avgRank={comparisonSummary.avgOpponentRank}
            avgPointsContext={comparisonAvgPointsContext}
            delta={formatPointsDelta(
              comparisonSummary.avgOpponentPoints,
              simulatedSummary.avgOpponentPoints,
            )}
            deltaTone={deltaToneFromPoints(comparisonPointsDelta)}
            basis={t("summaryCardComparisonBasis")}
          />
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/8">
        <div
          className="grid min-w-[640px] gap-3 border-b border-white/8 bg-white/[0.03] px-4 py-3"
          style={{ gridTemplateColumns }}
        >
          <span />
          <p className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {focusTeamName}
          </p>
          <p
            className={cn(
              "text-right text-[10px] font-semibold uppercase tracking-widest",
              hasOverrides ? "text-wc-orange" : "text-muted-foreground",
            )}
          >
            {t("simulatedPath")}
          </p>
          <p className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {t("pathCompareDeltaSimulated")}
          </p>
          {showComparison && (
            <>
              <p className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {comparisonTeamName}
              </p>
              <p className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {t("pathCompareDeltaComparison")}
              </p>
            </>
          )}
        </div>

        <StatRow
          label={summary("avgDifficulty")}
          focusValue={formatFifaPoints(actualSummary.avgOpponentPoints)}
          simulatedValue={formatFifaPoints(simulatedSummary.avgOpponentPoints)}
          comparisonValue={
            showComparison && comparisonSummary
              ? formatFifaPoints(comparisonSummary.avgOpponentPoints)
              : undefined
          }
          deltaVsFocus={formatPointsDelta(
            actualSummary.avgOpponentPoints,
            simulatedSummary.avgOpponentPoints,
          )}
          deltaVsComparison={
            showComparison && comparisonSummary
              ? formatPointsDelta(
                  comparisonSummary.avgOpponentPoints,
                  simulatedSummary.avgOpponentPoints,
                )
              : undefined
          }
          hintFocus={
            <AvgPointsContextHint context={actualAvgPointsContext} align="right" />
          }
          hintSimulated={
            <AvgPointsContextHint
              context={simulatedAvgPointsContext}
              align="right"
            />
          }
          hintComparison={
            showComparison ? (
              <AvgPointsContextHint
                context={comparisonAvgPointsContext}
                align="right"
              />
            ) : undefined
          }
          valueClassName="text-wc-orange"
          gridTemplateColumns={gridTemplateColumns}
        />
        <StatRow
          label={summary("avgRank")}
          focusValue={
            actualSummary.avgOpponentRank !== null
              ? formatStatValue(actualSummary.avgOpponentRank, 1)
              : "—"
          }
          simulatedValue={
            simulatedSummary.avgOpponentRank !== null
              ? formatStatValue(simulatedSummary.avgOpponentRank, 1)
              : "—"
          }
          comparisonValue={
            showComparison && comparisonSummary
              ? comparisonSummary.avgOpponentRank !== null
                ? formatStatValue(comparisonSummary.avgOpponentRank, 1)
                : "—"
              : undefined
          }
          deltaVsFocus={formatRankDelta(
            actualSummary.avgOpponentRank,
            simulatedSummary.avgOpponentRank,
          )}
          deltaVsComparison={
            showComparison && comparisonSummary
              ? formatRankDelta(
                  comparisonSummary.avgOpponentRank,
                  simulatedSummary.avgOpponentRank,
                )
              : undefined
          }
          gridTemplateColumns={gridTemplateColumns}
        />
      </div>

      {showPathChart && (
        <SimulatedPathPointsChart
          focusTeam={actualSummary.team}
          teamPoints={actualSummary.teamPoints}
          actual={{
            opponents: actualChart.opponents,
            avgOpponentPoints: actualChart.avgOpponentPoints,
            barColor: CHART_COLORS.selectedTeam,
            avgColor: CHART_COLORS.selectedTeam,
            legendLabel: t("actualPath"),
          }}
          simulated={{
            opponents: simulatedChart.opponents,
            avgOpponentPoints: simulatedChart.avgOpponentPoints,
            barColor: CHART_COLORS.simulatedPath,
            avgColor: CHART_COLORS.simulatedPath,
            legendLabel: t("simulatedPath"),
          }}
          comparison={
            showComparison && comparisonSummary && comparisonChart
              ? {
                  team: comparisonSummary.team,
                  opponents: comparisonChart.opponents,
                  avgOpponentPoints: comparisonChart.avgOpponentPoints,
                  barColor: CHART_COLORS.pathComparisonTeam,
                  avgColor: CHART_COLORS.pathComparisonTeam,
                  legendLabel: t("pathChartComparisonLegend", {
                    team: comparisonTeamName,
                  }),
                }
              : undefined
          }
          title={t("pathChartTitle")}
          teamPointsLegend={t("pathChartTeamPointsLegend")}
          opponentPathLegend={t("pathChartOpponentLegend")}
          matchLabel={t("pathChartMatchLabel")}
          ariaLabel={
            showComparison
              ? t("pathChartAriaWithComparison", { team: focusTeamName })
              : t("pathChartAria", { team: focusTeamName })
          }
        />
      )}

      <p className="text-xs text-muted-foreground">
        {showComparison ? t("pathCompareFootnoteWithComparison") : t("pathCompareFootnote")}
      </p>
      <p className="text-xs text-muted-foreground">
        {t("averagesIncludeScheduled")}
      </p>

      {(actualAvgPointsContext ||
        simulatedAvgPointsContext ||
        comparisonAvgPointsContext) && <AvgPointsContextFootnote />}

      {changedRows.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {t("pathChanges")}
          </h3>
          <div className="overflow-x-auto rounded-xl border border-white/8">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/[0.02]">
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">
                    {t("pathChangeRound")}
                  </th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">
                    {t("pathChangeActual")}
                  </th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">
                    {t("pathChangeSimulated")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {changedRows.map((row) => (
                  <tr
                    key={`${row.round}-${row.date}`}
                    className="border-b border-white/6 last:border-b-0"
                  >
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {getRoundDisplayName(stages, row.round)}
                    </td>
                    <td className="px-4 py-2.5">
                      <OpponentCell
                        teamId={row.actualOpponentId}
                        teams={teams}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <OpponentCell
                        teamId={row.simulatedOpponentId}
                        teams={teams}
                        changed
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {hasOverrides && changedRows.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("noPathChanges")}</p>
      )}
    </div>
  );
}
