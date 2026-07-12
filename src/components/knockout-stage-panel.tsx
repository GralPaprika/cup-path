"use client";

import Link from "next/link";
import type {
  AvgPointsContext,
  KnockoutFixtureEntry,
  KnockoutStageAnalysis,
} from "@/lib/types";
import { TeamFlag, TeamLabel } from "@/components/team-flag";
import { AvgPointsContextHint } from "@/components/avg-points-context";
import { CollapsibleSection } from "@/components/collapsible-section";
import { KnockoutStageTable } from "@/components/knockout-stage-table";
import { KnockoutStageGapChart } from "@/components/knockout-stage-gap-chart";
import { KnockoutStageOpponentDifficultyChart } from "@/components/knockout-stage-opponent-difficulty-chart";
import { MatchResultLabel } from "@/components/match-result-label";
import { MatchScoreBreakdown } from "@/components/match-score-breakdown";
import { formatFifaPoints, formatStatValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export type KnockoutStageTranslationNamespace =
  | "home.roundOf32"
  | "home.roundOf16";

interface KnockoutStagePanelProps {
  analysis: KnockoutStageAnalysis;
  mode: string;
  translationNamespace: KnockoutStageTranslationNamespace;
  wideOpponentDifficultyBars?: boolean;
}

function FixturePreview({
  fixture,
  translationNamespace,
}: {
  fixture: KnockoutFixtureEntry;
  translationNamespace: KnockoutStageTranslationNamespace;
}) {
  const t = useTranslations(translationNamespace);
  const team1Qualified = fixture.winnerTeamId === fixture.team1.id;
  const team2Qualified = fixture.winnerTeamId === fixture.team2.id;

  return (
    <div className="mt-3 space-y-2 border-t border-white/8 pt-3 text-xs">
      {fixture.matchNum !== null ? (
        <p className="font-mono text-[10px] text-muted-foreground">
          {t("matchLabel", { num: fixture.matchNum })}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <TeamFlag team={fixture.team1} size="sm" />
          <span className="font-mono font-semibold text-white">
            {fixture.team1.id}
          </span>
        </div>
        <span className="font-mono tabular-nums text-muted-foreground">
          {formatFifaPoints(fixture.team1FifaPoints)}
        </span>
      </div>
      <div className="flex items-center justify-center gap-2 font-mono text-[11px]">
        <MatchResultLabel
          result={team1Qualified ? "W" : "L"}
          label={
            team1Qualified ? t("outcomeQualified") : t("outcomeEliminated")
          }
        />
        <MatchScoreBreakdown
          ft={fixture.scoreFt}
          et={fixture.scoreEt}
          pens={fixture.scorePens}
          ftClassName="text-white"
        />
        <MatchResultLabel
          result={team2Qualified ? "W" : "L"}
          label={
            team2Qualified ? t("outcomeQualified") : t("outcomeEliminated")
          }
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <TeamFlag team={fixture.team2} size="sm" />
          <span className="font-mono font-semibold text-white">
            {fixture.team2.id}
          </span>
        </div>
        <span className="font-mono tabular-nums text-muted-foreground">
          {formatFifaPoints(fixture.team2FifaPoints)}
        </span>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  secondaryLabel,
  secondaryValue,
  hint,
  fixture,
  pointsContext,
  translationNamespace,
}: {
  label: string;
  value: string;
  secondaryLabel?: string;
  secondaryValue?: string;
  hint?: string;
  fixture?: KnockoutFixtureEntry | null;
  pointsContext?: AvgPointsContext | null;
  translationNamespace: KnockoutStageTranslationNamespace;
}) {
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
      {pointsContext ? (
        <AvgPointsContextHint context={pointsContext} align="left" />
      ) : null}
      {fixture ? (
        <FixturePreview
          fixture={fixture}
          translationNamespace={translationNamespace}
        />
      ) : null}
    </div>
  );
}

export function KnockoutStagePanel({
  analysis,
  mode,
  translationNamespace,
  wideOpponentDifficultyBars = false,
}: KnockoutStagePanelProps) {
  const t = useTranslations(translationNamespace);

  return (
    <>
      <section className="glass-panel space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("subtitle", { count: analysis.participantCount })}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatTile
            label={t("poolAvgFifaPoints")}
            value={formatFifaPoints(analysis.avgParticipantFifaPoints)}
            pointsContext={analysis.avgParticipantFifaPointsContext}
            translationNamespace={translationNamespace}
          />
          <StatTile
            label={t("poolMedianFifaRank")}
            value={
              analysis.medianParticipantFifaRank !== null
                ? `#${formatStatValue(analysis.medianParticipantFifaRank, 0)}`
                : "—"
            }
            translationNamespace={translationNamespace}
          />
          {analysis.lowestRankedQualifier ? (
            <Link
              href={`/team-analysis?team=${analysis.lowestRankedQualifier.team.id}&mode=${mode}`}
              className="block rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 transition-colors hover:border-white/15 hover:bg-white/[0.05]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {t("poolLowestRankedQualifier")}
              </p>
              <div className="mt-2">
                <TeamLabel
                  team={analysis.lowestRankedQualifier.team}
                  showCode
                  flagSize="sm"
                  nameClassName="text-sm font-semibold text-white"
                />
              </div>
              <p className="mt-2 font-mono text-sm tabular-nums text-wc-orange">
                FIFA #
                {formatStatValue(
                  analysis.lowestRankedQualifier.fifaRank,
                  0,
                )}{" "}
                ·{" "}
                {formatFifaPoints(
                  analysis.lowestRankedQualifier.fifaPoints,
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("poolLowestRankedQualifierHint", {
                  opponent: analysis.lowestRankedQualifier.opponent.id,
                })}
              </p>
            </Link>
          ) : (
            <StatTile
              label={t("poolLowestRankedQualifier")}
              value="—"
              translationNamespace={translationNamespace}
            />
          )}
        </div>
      </section>

      <CollapsibleSection
        title={t("deepDiveTitle")}
        subtitle={t("deepDiveSubtitle")}
        contentClassName="space-y-6"
      >
        <div className="space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {t("atGlanceTitle")}
          </p>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {t("qualifiedRow")}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile
                label={t("avgGapQualified")}
                value={formatFifaPoints(analysis.meanGap)}
                secondaryLabel={t("stdGapQualified")}
                secondaryValue={formatFifaPoints(analysis.stdDevGap)}
                hint={t("tieCountHint", { count: analysis.matchCount })}
                translationNamespace={translationNamespace}
              />
              <StatTile
                label={t("highestGapQualified")}
                value={formatFifaPoints(analysis.maxGap)}
                fixture={analysis.highestGapMatch}
                translationNamespace={translationNamespace}
              />
              <StatTile
                label={t("lowestGapQualified")}
                value={formatFifaPoints(analysis.minGap)}
                fixture={analysis.lowestGapMatch}
                translationNamespace={translationNamespace}
              />
              <StatTile
                label={t("biggestUnderdogQualified")}
                value={formatFifaPoints(
                  analysis.biggestUnderdogWin?.gapPoints ?? null,
                )}
                fixture={analysis.biggestUnderdogWin}
                translationNamespace={translationNamespace}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-white/8 pt-6">
          <div>
            <h3 className="text-sm font-semibold text-white">
              {t("storyTitle")}
            </h3>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              {t("storyLead")}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("distributionSummary", {
                count: analysis.matchCount,
                qualified: analysis.qualifiedCount,
                mean: formatFifaPoints(analysis.meanGap),
                stdDev: formatFifaPoints(analysis.stdDevGap),
                min: formatFifaPoints(analysis.minGap),
                max: formatFifaPoints(analysis.maxGap),
              })}
            </p>
          </div>

          <KnockoutStageTable
            fixtures={analysis.fixtures}
            mode={mode}
            translationNamespace={translationNamespace}
          />

          <KnockoutStageGapChart
            fixtures={analysis.fixtures}
            mean={analysis.meanGap}
            stdDev={analysis.stdDevGap}
            translationNamespace={translationNamespace}
          />
        </div>

        {analysis.opponentDifficulty && (
          <div className="space-y-4 border-t border-white/8 pt-6">
            <KnockoutStageOpponentDifficultyChart
              strip={analysis.opponentDifficulty}
              mode={mode}
              translationNamespace={translationNamespace}
              wideBars={wideOpponentDifficultyBars}
            />
          </div>
        )}
      </CollapsibleSection>
    </>
  );
}
