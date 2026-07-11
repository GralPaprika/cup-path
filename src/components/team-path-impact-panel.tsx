"use client";

import type {
  AvgPointsContext,
  PathDiffRow,
  Team,
  TeamPathSummary,
} from "@/lib/types";
import { getTeamDisplayName } from "@/lib/i18n/team-display-name";
import { useTranslations } from "next-intl";
import { TeamFlag } from "@/components/team-flag";
import {
  AvgPointsContextFootnote,
  AvgPointsContextHint,
} from "@/components/avg-points-context";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";

interface TeamPathImpactPanelProps {
  teams: Team[];
  actualSummary: TeamPathSummary;
  simulatedSummary: TeamPathSummary;
  actualAvgPointsContext: AvgPointsContext | null;
  simulatedAvgPointsContext: AvgPointsContext | null;
  pathDiff: PathDiffRow[];
  hasOverrides: boolean;
  onReset: () => void;
}

function DifficultyTile({
  label,
  summary,
  context,
  highlight,
}: {
  label: string;
  summary: TeamPathSummary;
  context: AvgPointsContext | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/[0.03] p-5",
        highlight && "border-wc-orange/30",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-wc-orange">
        {formatFifaPoints(summary.avgOpponentPoints)}
      </p>
      <AvgPointsContextHint context={context} align="left" />
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
  pathDiff,
  hasOverrides,
  onReset,
}: TeamPathImpactPanelProps) {
  const t = useTranslations("simulate");
  const changedRows = pathDiff.filter((row) => row.opponentChanged);

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
        {hasOverrides && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-white/20 hover:text-white"
          >
            {t("reset")}
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DifficultyTile
          label={t("actualPath")}
          summary={actualSummary}
          context={actualAvgPointsContext}
        />
        <DifficultyTile
          label={t("simulatedPath")}
          summary={simulatedSummary}
          context={simulatedAvgPointsContext}
          highlight={hasOverrides}
        />
      </div>

      {pointsDelta !== null && hasOverrides && pointsDelta !== 0 && (
        <p className="text-sm text-muted-foreground">
          {pointsDelta > 0
            ? t("harderBy", { gap: formatFifaPoints(Math.abs(pointsDelta)) })
            : t("easierBy", {
                gap: formatFifaPoints(Math.abs(pointsDelta)),
              })}
        </p>
      )}

      {(actualAvgPointsContext || simulatedAvgPointsContext) && (
        <AvgPointsContextFootnote />
      )}

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
                      {row.round}
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
