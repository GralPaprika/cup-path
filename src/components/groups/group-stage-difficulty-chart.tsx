"use client";

import { useState } from "react";
import { OpponentDifficultyPointTooltip } from "@/components/charts/opponent-difficulty-point-tooltip";
import { OpponentDifficultyScatterChart } from "@/components/charts/opponent-difficulty-scatter-chart";
import type { GroupStageDifficultyStrip } from "@/lib/types";
import { CHART_COLORS } from "@/lib/chart-colors";
import {
  DEFAULT_OVERVIEW_SCATTER_PREFS,
  OVERVIEW_SCATTER_STORAGE_KEY,
} from "@/lib/client/overview-ui-preference";
import { filterOpponentDifficultyScatterPoints } from "@/lib/domain/match/opponent-difficulty-scatter-filter";
import { getTeamDisplayName } from "@/lib/i18n/team-display-name";
import { usePersistedUiState } from "@/hooks/use-persisted-ui-state";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface GroupStageDifficultyChartProps {
  strip: GroupStageDifficultyStrip;
}

export function GroupStageDifficultyChart({
  strip,
}: GroupStageDifficultyChartProps) {
  const t = useTranslations("home.groupExpectedFinishes");
  const scatter = useTranslations("home.opponentDifficultyScatter");
  const teamNames = useTranslations("teams");

  const [scatterPrefs, setScatterPrefs] = usePersistedUiState(
    OVERVIEW_SCATTER_STORAGE_KEY,
    DEFAULT_OVERVIEW_SCATTER_PREFS,
  );
  const { showWon, showLost, showFifaLabels } = scatterPrefs;
  const [query, setQuery] = useState("");

  const { entries } = strip;
  if (entries.length === 0) return null;

  const meanPoints = strip.meanAvgOpponentPoints;

  const referenceLines = [
    {
      value: meanPoints,
      stroke: CHART_COLORS.mean,
      dash: "4 4",
      label: t("groupDifficultyLegendMean"),
      className: "text-wc-orange",
    },
    {
      value: strip.maxAvgOpponentPoints,
      stroke: "var(--color-wc-red)",
      dash: "2 3",
      label: t("groupDifficultyLegendHighest"),
      className: "text-wc-red",
    },
    {
      value: strip.minAvgOpponentPoints,
      stroke: "var(--color-wc-sky)",
      dash: "2 3",
      label: t("groupDifficultyLegendLowest"),
      className: "text-wc-sky",
    },
  ].filter(
    (line): line is typeof line & { value: number } => line.value !== null,
  );

  // Same tournament-average value on both axes so the cross reads as
  // one shared reference, not two different averages.
  const verticalReferenceLines =
    meanPoints === null
      ? []
      : [
          {
            value: meanPoints,
            stroke: CHART_COLORS.mean,
            dash: "4 4",
            label: t("groupDifficultyLegendMean"),
            className: "text-wc-orange",
          },
        ];

  const allPoints = entries.map((entry) => {
    const displayName = getTeamDisplayName(teamNames, entry.team);
    return {
      id: entry.team.id,
      fifaCode: entry.team.id,
      teamId: entry.team.id,
      displayName,
      teamFifaPoints: entry.teamFifaPoints,
      rivalDifficultyPoints: entry.avgOpponentPoints,
      won: entry.qualified,
      href: `/?team=${entry.team.id}`,
      tooltipData: {
        team: entry.team,
        teamFifaPoints: entry.teamFifaPoints,
        rivalDifficultyPoints: entry.avgOpponentPoints,
        won: entry.qualified,
        statusLabel: entry.qualified
          ? t("groupDifficultyQualified")
          : t("groupDifficultyEliminated"),
        rivalDifficultyLabel: t("groupDifficultyAxisRivalDifficulty"),
        gapLabel: t("groupDifficultyTooltipGap"),
        subtitle: t("groupDifficultyTooltipGroup", {
          letter: entry.groupLetter,
        }),
      },
    };
  });

  const points = filterOpponentDifficultyScatterPoints(allPoints, {
    showWon,
    showLost,
    query,
  });

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-white">
          {t("groupDifficultyTitle")}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("groupDifficultySubtitle", { count: points.length })}
        </p>
      </div>

      <OpponentDifficultyScatterChart
        points={points}
        domainPoints={allPoints}
        referenceLines={referenceLines}
        verticalReferenceLines={verticalReferenceLines}
        ariaLabel={t("groupDifficultyCaption")}
        xAxisLabel={t("groupDifficultyAxisTeamPoints")}
        yAxisLabel={t("groupDifficultyAxisRivalDifficulty")}
        wonLabel={t("groupDifficultyLegendVictory")}
        lostLabel={t("groupDifficultyLegendDefeat")}
        showWon={showWon}
        showLost={showLost}
        onToggleWon={() =>
          setScatterPrefs((prefs) => ({ ...prefs, showWon: !prefs.showWon }))
        }
        onToggleLost={() =>
          setScatterPrefs((prefs) => ({ ...prefs, showLost: !prefs.showLost }))
        }
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder={scatter("searchPlaceholder")}
        searchLabel={scatter("searchLabel")}
        showFifaLabels={showFifaLabels}
        onShowFifaLabelsChange={(value) =>
          setScatterPrefs((prefs) => ({ ...prefs, showFifaLabels: value }))
        }
        fifaLabelsLabel={scatter("showFifaCodes")}
        emptyFilteredMessage={scatter("emptyFiltered")}
        footnote={
          <>
            <p className="text-xs text-muted-foreground">
              {t("groupDifficultyFootnote")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("groupDifficultyReadingFootnote")}
            </p>
            <p className="text-xs text-muted-foreground">
              <Link href="/groups" className="text-wc-sky hover:underline">
                {t("groupDifficultyGroupsLink")}
              </Link>
            </p>
          </>
        }
        renderPointTooltip={(data) => (
          <OpponentDifficultyPointTooltip {...data} />
        )}
        referenceLegend={
          <>
            {referenceLines.map((line) => (
              <span
                key={line.label}
                className={`flex items-center gap-1.5 ${line.className}`}
              >
                {line.value === meanPoints ? (
                  <span className="relative inline-flex h-3 w-3 items-center justify-center">
                    <span
                      className="absolute h-3 border-l"
                      style={{
                        borderColor: line.stroke,
                        borderLeftStyle: "dashed",
                      }}
                    />
                    <span
                      className="absolute w-3 border-t"
                      style={{
                        borderColor: line.stroke,
                        borderTopStyle: "dashed",
                      }}
                    />
                  </span>
                ) : (
                  <span
                    className="inline-block w-5 border-t"
                    style={{
                      borderColor: line.stroke,
                      borderTopStyle: "dashed",
                    }}
                  />
                )}
                {line.label}
              </span>
            ))}
          </>
        }
      />
    </div>
  );
}
