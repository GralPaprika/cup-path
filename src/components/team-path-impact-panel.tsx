"use client";

import type {
  AvgPointsContext,
  PathDiffRow,
  PathDifficultyRank,
  Team,
  TeamPathSummary,
} from "@/lib/types";
import { getTeamDisplayName } from "@/lib/i18n/team-display-name";
import { getRoundDisplayName } from "@/lib/i18n/round-display-name";
import { useTranslations } from "next-intl";
import { TeamFlag } from "@/components/team-flag";
import {
  AvgPointsContextFootnote,
  AvgPointsContextHint,
} from "@/components/avg-points-context";
import { TeamSelector } from "@/components/team-selector";
import { formatFifaPoints, formatStatValue } from "@/lib/format";
import { cn } from "@/lib/utils";

interface TeamPathImpactPanelProps {
  teams: Team[];
  actualSummary: TeamPathSummary;
  simulatedSummary: TeamPathSummary;
  actualAvgPointsContext: AvgPointsContext | null;
  simulatedAvgPointsContext: AvgPointsContext | null;
  comparisonSummary: TeamPathSummary | null;
  comparisonAvgPointsContext: AvgPointsContext | null;
  comparisonTeamId: string;
  onComparisonTeamChange: (teamId: string) => void;
  pathDiff: PathDiffRow[];
  pathRanks: {
    actual: PathDifficultyRank;
    simulated: PathDifficultyRank;
    comparison: PathDifficultyRank | null;
  };
  hasOverrides: boolean;
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

function formatPathRank(
  rank: number | null,
  cohortSize: number,
): string {
  return rank !== null ? `#${rank} / ${cohortSize}` : "—";
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
  actualSummary,
  simulatedSummary,
  actualAvgPointsContext,
  simulatedAvgPointsContext,
  comparisonSummary,
  comparisonAvgPointsContext,
  comparisonTeamId,
  onComparisonTeamChange,
  pathDiff,
  pathRanks,
  hasOverrides,
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
  const firstOtherTeam =
    teams.find((team) => team.id !== actualSummary.team.id)?.id ?? "";

  const gridTemplateColumns = showComparison
    ? "minmax(0,1fr) minmax(0,0.85fr) minmax(0,0.85fr) minmax(0,0.55fr) minmax(0,0.85fr) minmax(0,0.55fr)"
    : "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,0.65fr)";

  const pointsDelta =
    actualSummary.avgOpponentPoints !== null &&
    simulatedSummary.avgOpponentPoints !== null
      ? simulatedSummary.avgOpponentPoints - actualSummary.avgOpponentPoints
      : null;

  return (
    <div className="glass-panel space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">
          {t("pathComparison")}
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              onComparisonTeamChange(comparisonTeamId ? "" : firstOtherTeam)
            }
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-white/20 hover:text-white"
          >
            {comparisonTeamId
              ? t("hideComparisonTeam")
              : t("addComparisonTeam")}
          </button>
        </div>
      </div>

      {comparisonTeamId && (
        <div className="max-w-xl">
          <TeamSelector
            teams={teams}
            value={comparisonTeamId}
            onChange={onComparisonTeamChange}
            label={t("comparisonTeam")}
          />
        </div>
      )}

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
        <StatRow
          label={t("pathRankByPoints")}
          focusValue={formatPathRank(
            pathRanks.actual.rankByPoints,
            pathRanks.actual.cohortSize,
          )}
          simulatedValue={formatPathRank(
            pathRanks.simulated.rankByPoints,
            pathRanks.simulated.cohortSize,
          )}
          comparisonValue={
            showComparison && pathRanks.comparison
              ? formatPathRank(
                  pathRanks.comparison.rankByPoints,
                  pathRanks.comparison.cohortSize,
                )
              : undefined
          }
          deltaVsFocus={formatRankDelta(
            pathRanks.actual.rankByPoints,
            pathRanks.simulated.rankByPoints,
          )}
          deltaVsComparison={
            showComparison && pathRanks.comparison
              ? formatRankDelta(
                  pathRanks.comparison.rankByPoints,
                  pathRanks.simulated.rankByPoints,
                )
              : undefined
          }
          gridTemplateColumns={gridTemplateColumns}
        />
        <StatRow
          label={t("pathRankByAvgRank")}
          focusValue={formatPathRank(
            pathRanks.actual.rankByAvgRank,
            pathRanks.actual.cohortSize,
          )}
          simulatedValue={formatPathRank(
            pathRanks.simulated.rankByAvgRank,
            pathRanks.simulated.cohortSize,
          )}
          comparisonValue={
            showComparison && pathRanks.comparison
              ? formatPathRank(
                  pathRanks.comparison.rankByAvgRank,
                  pathRanks.comparison.cohortSize,
                )
              : undefined
          }
          deltaVsFocus={formatRankDelta(
            pathRanks.actual.rankByAvgRank,
            pathRanks.simulated.rankByAvgRank,
          )}
          deltaVsComparison={
            showComparison && pathRanks.comparison
              ? formatRankDelta(
                  pathRanks.comparison.rankByAvgRank,
                  pathRanks.simulated.rankByAvgRank,
                )
              : undefined
          }
          gridTemplateColumns={gridTemplateColumns}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {showComparison ? t("pathCompareFootnoteWithComparison") : t("pathCompareFootnote")}
      </p>

      {pointsDelta !== null && hasOverrides && pointsDelta !== 0 && (
        <p className="text-sm text-muted-foreground">
          {pointsDelta > 0
            ? t("harderBy", { gap: formatFifaPoints(Math.abs(pointsDelta)) })
            : t("easierBy", {
                gap: formatFifaPoints(Math.abs(pointsDelta)),
              })}
        </p>
      )}

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
