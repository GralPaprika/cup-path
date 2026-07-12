"use client";

import type { GroupExpectedAnalysis, GroupExpectedMatchEntry } from "@/lib/types";
import { CollapsibleSection } from "@/components/collapsible-section";
import { GroupDrawsTable } from "@/components/group-draws-table";
import { GroupDrawsGapChart } from "@/components/group-draws-gap-chart";
import { GroupWinLossTable } from "@/components/group-win-loss-table";
import { GroupWinLossGapChart } from "@/components/group-win-loss-gap-chart";
import { GroupPaperPositionCards } from "@/components/group-paper-position-cards";
import { GroupStageDifficultyChart } from "@/components/group-stage-difficulty-chart";
import type { GroupStageDifficultyStrip } from "@/lib/types";
import { GroupMatchPreview } from "@/components/facts/group-match-preview";
import { StatTile } from "@/components/facts/stat-tile";
import { StorySection } from "@/components/facts/story-section";
import { formatFifaPoints } from "@/lib/format";
import { useTranslations } from "next-intl";

interface GroupExpectedFinishesPanelProps {
  analysis: GroupExpectedAnalysis;
  groupStageDifficulty: GroupStageDifficultyStrip | null;
  mode: string;
}

function AtGlanceStatTile({
  label,
  value,
  secondaryLabel,
  secondaryValue,
  hint,
  match,
}: {
  label: string;
  value: string;
  secondaryLabel?: string;
  secondaryValue?: string;
  hint?: string;
  match?: GroupExpectedMatchEntry | null;
}) {
  return (
    <StatTile
      label={label}
      value={value}
      secondaryLabel={secondaryLabel}
      secondaryValue={secondaryValue}
      hint={hint}
      preview={match ? <GroupMatchPreview match={match} /> : null}
    />
  );
}

export function GroupExpectedFinishesPanel({
  analysis,
  groupStageDifficulty,
  mode,
}: GroupExpectedFinishesPanelProps) {
  const t = useTranslations("home.groupExpectedFinishes");

  const positionMisses = analysis.expectedFinishes.filter(
    (finish) => finish.positionDelta > 0,
  );
  const hasStandingsStory =
    positionMisses.length > 0 ||
    analysis.eliminatedUnderperformers.length > 0;

  return (
    <CollapsibleSection title={t("title")} subtitle={t("subtitle")}>
      <div className="space-y-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {t("atGlanceTitle")}
        </p>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {t("winLossRow")}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <AtGlanceStatTile
              label={t("avgGapOnWinLoss")}
              value={formatFifaPoints(analysis.meanPointsGapOnWinLoss)}
              secondaryLabel={t("stdGapOnWinLoss")}
              secondaryValue={formatFifaPoints(analysis.stdDevPointsGapOnWinLoss)}
              hint={t("winLossCountHint", {
                count: analysis.actualWinLossCount,
              })}
            />
            <AtGlanceStatTile
              label={t("highestGapOnWinLoss")}
              value={formatFifaPoints(analysis.maxPointsGapOnWinLoss)}
              match={analysis.highestGapWinLossMatch}
            />
            <AtGlanceStatTile
              label={t("lowestGapOnWinLoss")}
              value={formatFifaPoints(analysis.minPointsGapOnWinLoss)}
              match={analysis.lowestGapWinLossMatch}
            />
            <AtGlanceStatTile
              label={t("biggestUnderdogWin")}
              value={formatFifaPoints(
                analysis.biggestUnderdogWinMatch?.gapPoints ?? null,
              )}
              match={analysis.biggestUnderdogWinMatch}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {t("drawsRow")}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <AtGlanceStatTile
              label={t("avgGapOnDraw")}
              value={formatFifaPoints(analysis.meanPointsGapOnDraws)}
              secondaryLabel={t("stdGapOnDraw")}
              secondaryValue={formatFifaPoints(analysis.stdDevPointsGapOnDraws)}
              hint={t("drawCountHint", { count: analysis.actualDrawCount })}
            />
            <AtGlanceStatTile
              label={t("highestGapOnDraw")}
              value={formatFifaPoints(analysis.maxPointsGapOnDraw)}
              match={analysis.highestGapDrawMatch}
            />
            <AtGlanceStatTile
              label={t("lowestGapOnDraw")}
              value={formatFifaPoints(analysis.minPointsGapOnDraw)}
              match={analysis.lowestGapDrawMatch}
            />
            <AtGlanceStatTile
              label={t("biggestUnderdogDraw")}
              value={formatFifaPoints(
                analysis.biggestUnderdogDrawMatch?.gapPoints ?? null,
              )}
              match={analysis.biggestUnderdogDrawMatch}
            />
          </div>
        </div>
      </div>

      {analysis.winLossMatches.length > 0 && (
        <StorySection title={t("storyWinLossTitle")} lead={t("storyWinLossLead")}>
          <p className="text-sm text-muted-foreground">
            {t("winLossDistributionSummary", {
              count: analysis.actualWinLossCount,
              mean: formatFifaPoints(analysis.meanPointsGapOnWinLoss),
              stdDev: formatFifaPoints(analysis.stdDevPointsGapOnWinLoss),
              min: formatFifaPoints(analysis.minPointsGapOnWinLoss),
              max: formatFifaPoints(analysis.maxPointsGapOnWinLoss),
            })}
          </p>

          <GroupWinLossTable
            winLossMatches={analysis.winLossMatches}
            mode={mode}
          />

          <GroupWinLossGapChart
            winLossMatches={analysis.winLossMatches}
            mean={analysis.meanPointsGapOnWinLoss}
            stdDev={analysis.stdDevPointsGapOnWinLoss}
          />
        </StorySection>
      )}

      {analysis.drawMatches.length > 0 && (
        <StorySection title={t("storyDrawsTitle")} lead={t("storyDrawsLead")}>
          <p className="text-sm text-muted-foreground">
            {t("drawsDistributionSummary", {
              count: analysis.actualDrawCount,
              mean: formatFifaPoints(analysis.meanPointsGapOnDraws),
              stdDev: formatFifaPoints(analysis.stdDevPointsGapOnDraws),
              min: formatFifaPoints(analysis.minPointsGapOnDraw),
              max: formatFifaPoints(analysis.maxPointsGapOnDraw),
            })}
          </p>

          <GroupDrawsTable
            drawMatches={analysis.drawMatches}
            meanGap={analysis.meanPointsGapOnDraws}
            mode={mode}
          />

          <GroupDrawsGapChart
            drawMatches={analysis.drawMatches}
            mean={analysis.meanPointsGapOnDraws}
            stdDev={analysis.stdDevPointsGapOnDraws}
          />
        </StorySection>
      )}

      {hasStandingsStory && (
        <StorySection
          title={t("storyStandingsTitle")}
          lead={t("storyStandingsLead")}
        >
          <p className="text-xs text-muted-foreground">{t("tiebreakerFootnote")}</p>
          <GroupPaperPositionCards
            positionMisses={positionMisses}
            eliminatedUnderperformers={analysis.eliminatedUnderperformers}
            mode={mode}
          />
        </StorySection>
      )}

      {groupStageDifficulty && (
        <StorySection
          title={t("storyDifficultyTitle")}
          lead={t("storyDifficultyLead")}
        >
          <GroupStageDifficultyChart
            strip={groupStageDifficulty}
            mode={mode}
          />
        </StorySection>
      )}

      {!hasStandingsStory && (
        <p className="text-xs text-muted-foreground">{t("tiebreakerFootnote")}</p>
      )}
    </CollapsibleSection>
  );
}
