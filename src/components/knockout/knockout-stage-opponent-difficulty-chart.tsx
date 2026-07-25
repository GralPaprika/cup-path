"use client";

import { useState } from "react";
import { OpponentDifficultyPointTooltip } from "@/components/charts/opponent-difficulty-point-tooltip";
import { OpponentDifficultyScatterChart } from "@/components/charts/opponent-difficulty-scatter-chart";
import type { KnockoutOpponentDifficultyStrip } from "@/lib/types";
import { CHART_COLORS } from "@/lib/chart-colors";
import {
  DEFAULT_OVERVIEW_SCATTER_PREFS,
  OVERVIEW_SCATTER_STORAGE_KEY,
} from "@/lib/client/overview-ui-preference";
import { filterOpponentDifficultyScatterPoints } from "@/lib/domain/match/opponent-difficulty-scatter-filter";
import { getTeamDisplayName } from "@/lib/i18n/team-display-name";
import { usePersistedUiState } from "@/hooks/use-persisted-ui-state";
import { useTranslations } from "next-intl";

interface KnockoutStageOpponentDifficultyChartProps {
  strip: KnockoutOpponentDifficultyStrip;
  opponentDifficultyTitle: string;
  opponentDifficultySubtitle: (count: number) => string;
  opponentDifficultyCaption: string;
  opponentDifficultyFootnote: string;
}

export function KnockoutStageOpponentDifficultyChart({
  strip,
  opponentDifficultyTitle,
  opponentDifficultySubtitle,
  opponentDifficultyCaption,
  opponentDifficultyFootnote,
}: KnockoutStageOpponentDifficultyChartProps) {
  const shared = useTranslations("home.knockoutStage");
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

  const meanPoints = strip.meanOpponentPoints;

  const referenceLines = [
    {
      value: meanPoints,
      stroke: CHART_COLORS.mean,
      dash: "4 4",
      label: shared("opponentDifficultyLegendMean"),
      className: "text-wc-orange",
    },
    {
      value: strip.maxOpponentPoints,
      stroke: "var(--color-wc-red)",
      dash: "2 3",
      label: shared("opponentDifficultyLegendHighest"),
      className: "text-wc-red",
    },
    {
      value: strip.minOpponentPoints,
      stroke: "var(--color-wc-sky)",
      dash: "2 3",
      label: shared("opponentDifficultyLegendLowest"),
      className: "text-wc-sky",
    },
  ].filter(
    (line): line is typeof line & { value: number } => line.value !== null,
  );

  // Same round-average value on both axes (team pts and opponent pts
  // are the same multiset in a complete knockout round).
  const verticalReferenceLines =
    meanPoints === null
      ? []
      : [
          {
            value: meanPoints,
            stroke: CHART_COLORS.mean,
            dash: "4 4",
            label: shared("opponentDifficultyLegendMean"),
            className: "text-wc-orange",
          },
        ];

  const allPoints = entries.map((entry) => {
    const displayName = getTeamDisplayName(teamNames, entry.team);
    return {
      id: `${entry.team.id}-${entry.opponent.id}-${entry.matchNum ?? "na"}`,
      fifaCode: entry.team.id,
      teamId: entry.team.id,
      displayName,
      teamFifaPoints: entry.teamFifaPoints,
      rivalDifficultyPoints: entry.opponentFifaPoints,
      won: entry.qualified,
      href: `/?team=${entry.team.id}`,
      tooltipData: {
        team: entry.team,
        teamFifaPoints: entry.teamFifaPoints,
        rivalDifficultyPoints: entry.opponentFifaPoints,
        won: entry.qualified,
        statusLabel: entry.qualified
          ? shared("opponentDifficultyVictory")
          : shared("opponentDifficultyDefeat"),
        rivalDifficultyLabel: shared("opponentDifficultyAxisRivalDifficulty"),
        rival: entry.opponent,
        rivalLabel: shared("opponentDifficultyTooltipRival"),
        rivalPointsLabel: shared("opponentDifficultyTooltipRivalPoints"),
        gapLabel: shared("opponentDifficultyTooltipGap"),
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
          {opponentDifficultyTitle}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {opponentDifficultySubtitle(points.length)}
        </p>
      </div>

      <OpponentDifficultyScatterChart
        points={points}
        domainPoints={allPoints}
        referenceLines={referenceLines}
        verticalReferenceLines={verticalReferenceLines}
        ariaLabel={opponentDifficultyCaption}
        xAxisLabel={shared("opponentDifficultyAxisTeamPoints")}
        yAxisLabel={shared("opponentDifficultyAxisRivalDifficulty")}
        wonLabel={shared("opponentDifficultyLegendVictory")}
        lostLabel={shared("opponentDifficultyLegendDefeat")}
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
              {opponentDifficultyFootnote}
            </p>
            <p className="text-xs text-muted-foreground">
              {shared("opponentDifficultyReadingFootnote")}
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
