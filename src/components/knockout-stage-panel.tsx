"use client";

import type {
  AvgPointsContext,
  KnockoutFactsRoundDefinition,
  KnockoutFixtureEntry,
  KnockoutStageAnalysis,
} from "@/lib/types";
import { CollapsibleSection } from "@/components/collapsible-section";
import { ParticipantPoolSection } from "@/components/facts/participant-pool-section";
import { KnockoutFixturePreview } from "@/components/facts/knockout-fixture-preview";
import { StatTile } from "@/components/facts/stat-tile";
import { KnockoutStageTable } from "@/components/knockout-stage-table";
import { KnockoutStageGapChart } from "@/components/knockout-stage-gap-chart";
import { KnockoutStageOpponentDifficultyChart } from "@/components/knockout-stage-opponent-difficulty-chart";
import { formatFifaPoints } from "@/lib/format";
import { useTranslations } from "next-intl";

interface KnockoutStagePanelProps {
  round: KnockoutFactsRoundDefinition;
  analysis: KnockoutStageAnalysis;
  mode: string;
}

function AtGlanceStatTile({
  label,
  value,
  secondaryLabel,
  secondaryValue,
  hint,
  fixture,
}: {
  label: string;
  value: string;
  secondaryLabel?: string;
  secondaryValue?: string;
  hint?: string;
  fixture?: KnockoutFixtureEntry | null;
}) {
  return (
    <StatTile
      label={label}
      value={value}
      secondaryLabel={secondaryLabel}
      secondaryValue={secondaryValue}
      hint={hint}
      preview={fixture ? <KnockoutFixturePreview fixture={fixture} /> : null}
    />
  );
}

export function KnockoutStagePanel({
  round,
  analysis,
  mode,
}: KnockoutStagePanelProps) {
  const shared = useTranslations("home.knockoutStage");
  const stage = useTranslations(round.translationNamespace);

  return (
    <>
      <ParticipantPoolSection
        title={stage("title")}
        subtitle={stage("subtitle", { count: analysis.participantCount })}
        avgFifaPointsLabel={shared("poolAvgFifaPoints")}
        medianFifaRankLabel={shared("poolMedianFifaRank")}
        lowestRankedQualifierLabel={shared("poolLowestRankedQualifier")}
        avgFifaPoints={analysis.avgParticipantFifaPoints}
        avgFifaPointsContext={analysis.avgParticipantFifaPointsContext}
        medianFifaRank={analysis.medianParticipantFifaRank}
        lowestRankedQualifier={
          analysis.lowestRankedQualifier
            ? {
                team: analysis.lowestRankedQualifier.team,
                fifaRank: analysis.lowestRankedQualifier.fifaRank,
                fifaPoints: analysis.lowestRankedQualifier.fifaPoints,
                hint: stage("poolLowestRankedQualifierHint", {
                  opponent: analysis.lowestRankedQualifier.opponent.id,
                }),
              }
            : null
        }
        mode={mode}
      />

      <CollapsibleSection
        title={stage("deepDiveTitle")}
        contentClassName="space-y-6"
      >
        <div className="space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {shared("atGlanceTitle")}
          </p>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {shared("qualifiedRow")}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <AtGlanceStatTile
                label={shared("avgGapQualified")}
                value={formatFifaPoints(analysis.meanGap)}
                secondaryLabel={shared("stdGapQualified")}
                secondaryValue={formatFifaPoints(analysis.stdDevGap)}
                hint={shared("tieCountHint", { count: analysis.matchCount })}
              />
              <AtGlanceStatTile
                label={shared("highestGapQualified")}
                value={formatFifaPoints(analysis.maxGap)}
                fixture={analysis.highestGapMatch}
              />
              <AtGlanceStatTile
                label={shared("lowestGapQualified")}
                value={formatFifaPoints(analysis.minGap)}
                fixture={analysis.lowestGapMatch}
              />
              <AtGlanceStatTile
                label={shared("biggestUnderdogQualified")}
                value={formatFifaPoints(
                  analysis.biggestUnderdogWin?.gapPoints ?? null,
                )}
                fixture={analysis.biggestUnderdogWin}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-white/8 pt-6">
          <div>
            <h3 className="text-sm font-semibold text-white">
              {stage("storyTitle")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {stage("distributionSummary", {
                count: analysis.matchCount,
                qualified: analysis.qualifiedCount,
                mean: formatFifaPoints(analysis.meanGap),
                stdDev: formatFifaPoints(analysis.stdDevGap),
                min: formatFifaPoints(analysis.minGap),
                max: formatFifaPoints(analysis.maxGap),
              })}
            </p>
          </div>

          <KnockoutStageTable fixtures={analysis.fixtures} mode={mode} />

          <KnockoutStageGapChart
            fixtures={analysis.fixtures}
            mean={analysis.meanGap}
            stdDev={analysis.stdDevGap}
            gapChartCaption={stage("gapChartCaption")}
          />
        </div>

        {analysis.opponentDifficulty && (
          <div className="space-y-4 border-t border-white/8 pt-6">
            <KnockoutStageOpponentDifficultyChart
              strip={analysis.opponentDifficulty}
              mode={mode}
              wideBars={round.wideOpponentDifficultyBars}
              opponentDifficultyTitle={stage("opponentDifficultyTitle")}
              opponentDifficultySubtitle={stage("opponentDifficultySubtitle", {
                count: analysis.opponentDifficulty.entries.length,
              })}
              opponentDifficultyCaption={stage("opponentDifficultyCaption")}
              opponentDifficultyFootnote={stage("opponentDifficultyFootnote")}
            />
          </div>
        )}
      </CollapsibleSection>
    </>
  );
}
