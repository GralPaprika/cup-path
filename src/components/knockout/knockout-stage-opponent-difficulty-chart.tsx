"use client";

import { OpponentDifficultyPointTooltip } from "@/components/facts/opponent-difficulty-point-tooltip";
import { OpponentDifficultyScatterChart } from "@/components/facts/opponent-difficulty-scatter-chart";
import type { KnockoutOpponentDifficultyStrip } from "@/lib/types";
import { CHART_COLORS } from "@/lib/chart-colors";
import { useTranslations } from "next-intl";

interface KnockoutStageOpponentDifficultyChartProps {
  strip: KnockoutOpponentDifficultyStrip;
  mode: string;
  opponentDifficultyTitle: string;
  opponentDifficultySubtitle: string;
  opponentDifficultyCaption: string;
  opponentDifficultyFootnote: string;
}

export function KnockoutStageOpponentDifficultyChart({
  strip,
  mode,
  opponentDifficultyTitle,
  opponentDifficultySubtitle,
  opponentDifficultyCaption,
  opponentDifficultyFootnote,
}: KnockoutStageOpponentDifficultyChartProps) {
  const shared = useTranslations("home.knockoutStage");

  const { entries } = strip;
  if (entries.length === 0) return null;

  const referenceLines = [
    {
      value: strip.meanOpponentPoints,
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

  const points = entries.map((entry) => ({
    id: `${entry.team.id}-${entry.opponent.id}-${entry.matchNum ?? "na"}`,
    teamFifaPoints: entry.teamFifaPoints,
    rivalDifficultyPoints: entry.opponentFifaPoints,
    won: entry.qualified,
    href: `/team-analysis?team=${entry.team.id}&mode=${mode}`,
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
  }));

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-white">
          {opponentDifficultyTitle}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {opponentDifficultySubtitle}
        </p>
      </div>

      <OpponentDifficultyScatterChart
        points={points}
        referenceLines={referenceLines}
        ariaLabel={opponentDifficultyCaption}
        xAxisLabel={shared("opponentDifficultyAxisTeamPoints")}
        yAxisLabel={shared("opponentDifficultyAxisRivalDifficulty")}
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
        legend={
          <>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-wc-green/85" />
              {shared("opponentDifficultyLegendVictory")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-wc-red/80" />
              {shared("opponentDifficultyLegendDefeat")}
            </span>
            {referenceLines.map((line) => (
              <span
                key={line.label}
                className={`flex items-center gap-1.5 ${line.className}`}
              >
                <span
                  className="inline-block w-5 border-t"
                  style={{
                    borderColor: line.stroke,
                    borderTopStyle: "dashed",
                  }}
                />
                {line.label}
              </span>
            ))}
          </>
        }
      />
    </div>
  );
}
