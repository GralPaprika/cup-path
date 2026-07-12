"use client";

import type { GroupExpectedAnalysis, GroupExpectedMatchEntry } from "@/lib/types";
import { TeamFlag } from "@/components/team-flag";
import { CollapsibleSection } from "@/components/collapsible-section";
import { GroupDrawsTable } from "@/components/group-draws-table";
import { GroupDrawsGapChart } from "@/components/group-draws-gap-chart";
import { GroupWinLossTable } from "@/components/group-win-loss-table";
import { GroupWinLossGapChart } from "@/components/group-win-loss-gap-chart";
import { GroupPaperPositionCards } from "@/components/group-paper-position-cards";
import { GroupStageDifficultyChart } from "@/components/group-stage-difficulty-chart";
import type { GroupStageDifficultyStrip } from "@/lib/types";
import { MatchResultLabel } from "@/components/match-result-label";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface GroupExpectedFinishesPanelProps {
  analysis: GroupExpectedAnalysis;
  groupStageDifficulty: GroupStageDifficultyStrip | null;
  mode: string;
}

function StorySection({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border-t border-white/8 pt-6 first:border-t-0 first:pt-0">
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{lead}</p>
      </div>
      {children}
    </section>
  );
}

function StatTile({
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
  const t = useTranslations("home.groupExpectedFinishes");
  const results = useTranslations("results");

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">
        {value}
      </p>
      {secondaryLabel && secondaryValue ? (
        <>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {secondaryLabel}
          </p>
          <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">
            {secondaryValue}
          </p>
        </>
      ) : null}
      {hint ? (
        <p
          className={cn(
            "text-xs text-muted-foreground",
            secondaryLabel ? "mt-2" : "mt-1",
          )}
        >
          {hint}
        </p>
      ) : null}
      {match ? (
        <div className="mt-3 space-y-2 border-t border-white/8 pt-3 text-xs">
          <p className="font-mono text-[10px] text-muted-foreground">
            {t("groupLabel", { letter: match.groupLetter })}
          </p>
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <TeamFlag team={match.team1} size="sm" />
              <span className="font-mono font-semibold text-white">
                {match.team1.id}
              </span>
            </div>
            <span className="font-mono tabular-nums text-muted-foreground">
              {formatFifaPoints(match.team1FifaPoints)}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 font-mono text-[11px]">
            <MatchResultLabel
              result={match.team1Actual}
              label={results(match.team1Actual)}
            />
            <span className="tabular-nums text-white">{match.scoreLabel}</span>
            <MatchResultLabel
              result={match.team2Actual}
              label={results(match.team2Actual)}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <TeamFlag team={match.team2} size="sm" />
              <span className="font-mono font-semibold text-white">
                {match.team2.id}
              </span>
            </div>
            <span className="font-mono tabular-nums text-muted-foreground">
              {formatFifaPoints(match.team2FifaPoints)}
            </span>
          </div>
        </div>
      ) : null}
    </div>
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
            <StatTile
              label={t("avgGapOnWinLoss")}
              value={formatFifaPoints(analysis.meanPointsGapOnWinLoss)}
              secondaryLabel={t("stdGapOnWinLoss")}
              secondaryValue={formatFifaPoints(analysis.stdDevPointsGapOnWinLoss)}
              hint={t("winLossCountHint", {
                count: analysis.actualWinLossCount,
              })}
            />
            <StatTile
              label={t("highestGapOnWinLoss")}
              value={formatFifaPoints(analysis.maxPointsGapOnWinLoss)}
              match={analysis.highestGapWinLossMatch}
            />
            <StatTile
              label={t("lowestGapOnWinLoss")}
              value={formatFifaPoints(analysis.minPointsGapOnWinLoss)}
              match={analysis.lowestGapWinLossMatch}
            />
            <StatTile
              label={t("biggestUnderdogWin")}
              value={formatFifaPoints(
                analysis.biggestUnderdogWinMatch?.gapPoints ?? null,
              )}
              match={analysis.biggestUnderdogWinMatch}
              hint={t("biggestUnderdogWinHint")}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {t("drawsRow")}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile
              label={t("avgGapOnDraw")}
              value={formatFifaPoints(analysis.meanPointsGapOnDraws)}
              secondaryLabel={t("stdGapOnDraw")}
              secondaryValue={formatFifaPoints(analysis.stdDevPointsGapOnDraws)}
              hint={t("drawCountHint", { count: analysis.actualDrawCount })}
            />
            <StatTile
              label={t("highestGapOnDraw")}
              value={formatFifaPoints(analysis.maxPointsGapOnDraw)}
              match={analysis.highestGapDrawMatch}
            />
            <StatTile
              label={t("lowestGapOnDraw")}
              value={formatFifaPoints(analysis.minPointsGapOnDraw)}
              match={analysis.lowestGapDrawMatch}
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
