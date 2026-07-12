"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { PathStage } from "@/lib/types";
import { GroupExpectedFinishesPanel } from "@/components/group-expected-finishes-panel";
import { KnockoutStagePanel } from "@/components/knockout-stage-panel";
import { ParticipantPoolSection } from "@/components/facts/participant-pool-section";
import { HighlightCard } from "@/components/facts/highlight-card";
import {
  formatStageDelta,
  TeamHighlightBody,
  UpsetHighlightBody,
} from "@/components/facts/facts-highlight-bodies";
import { KNOCKOUT_FACTS_ROUNDS } from "@/lib/domain/knockout-facts-round-config";
import { PageShellSkeleton } from "@/components/loading-skeletons";
import { RankingModeToggle } from "@/components/ranking-mode-toggle";
import { useApiQuery } from "@/hooks/use-api-query";
import { useUrlParamsSync } from "@/hooks/use-url-params-sync";
import { useSyncedRankingMode } from "@/hooks/use-synced-ranking-mode";
import type { TournamentFacts } from "@/lib/api/responses";
import { formatFifaPoints } from "@/lib/format";
import { getRoundDisplayName } from "@/lib/i18n/round-display-name";
import { COMPARE_STAGE_I18N_KEYS } from "@/lib/i18n/stage-keys";
import { useTranslations } from "next-intl";

export function FactsPageClient() {
  const t = useTranslations("home");
  const common = useTranslations("common");
  const stages = useTranslations("compare.stages");
  const searchParams = useSearchParams();
  const [mode, setMode] = useSyncedRankingMode(searchParams);

  const { data: facts, loading, error } = useApiQuery<TournamentFacts>(
    `/api/facts?mode=${mode}`,
    [mode],
    { errorMessage: common("error") },
  );

  useUrlParamsSync(
    "/",
    () => new URLSearchParams({ mode }),
    [mode],
  );

  const stageLabel = (stage: PathStage) => stages(COMPARE_STAGE_I18N_KEYS[stage]);

  if (loading && !facts) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <PageShellSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{t("title")}</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground sm:text-base">
          {t("subtitle")}
        </p>
      </header>

      <div className="glass-panel mb-6 p-5 sm:p-6">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {t("rankingSnapshot")}
        </p>
        <RankingModeToggle value={mode} onChange={setMode} variant="compact" />
      </div>

      {error && (
        <div className="glass-panel mb-6 border-wc-red/30 bg-wc-red/10 p-6 text-wc-red">
          {error}
        </div>
      )}

      {facts && (
        <div className="space-y-6">
          <ParticipantPoolSection
            title={t("groupStagePool.title")}
            subtitle={t("groupStagePool.subtitle", {
              count: facts.groupStagePool.teamCount,
            })}
            avgFifaPointsLabel={t("groupStagePool.avgFifaPoints")}
            medianFifaRankLabel={t("groupStagePool.medianFifaRank")}
            lowestRankedQualifierLabel={t("groupStagePool.lowestRankedQualifier")}
            avgFifaPoints={facts.groupStagePool.avgFifaPoints}
            avgFifaPointsContext={facts.groupStagePool.avgFifaPointsContext}
            medianFifaRank={facts.groupStagePool.medianFifaRank}
            lowestRankedQualifier={
              facts.groupStagePool.lowestRankedQualifier
                ? {
                    team: facts.groupStagePool.lowestRankedQualifier.team,
                    fifaRank: facts.groupStagePool.lowestRankedQualifier.fifaRank,
                    fifaPoints: facts.groupStagePool.lowestRankedQualifier.fifaPoints,
                    hint: t("groupStagePool.lowestRankedQualifierHint", {
                      group:
                        facts.groupStagePool.lowestRankedQualifier.groupLetter,
                    }),
                  }
                : null
            }
            mode={mode}
          />

          {facts.groupExpectedAnalysis && (
            <GroupExpectedFinishesPanel
              analysis={facts.groupExpectedAnalysis}
              groupStageDifficulty={facts.groupStageDifficulty}
              mode={mode}
            />
          )}

          {KNOCKOUT_FACTS_ROUNDS.map((round) => {
            const analysis = facts.knockoutAnalyses[round.id];
            if (!analysis) return null;
            return (
              <KnockoutStagePanel
                key={round.id}
                round={round}
                analysis={analysis}
                mode={mode}
              />
            );
          })}

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              {t("highlights.title")}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {facts.highlights.overPerformer && (
                <HighlightCard
                  title={t("highlights.overPerformer")}
                  footnote={t("highlights.overPerformerFootnote")}
                  href={`/team-analysis?team=${facts.highlights.overPerformer.team.id}&mode=${mode}`}
                  body={
                    <TeamHighlightBody
                      highlight={facts.highlights.overPerformer}
                      stageLabel={stageLabel(
                        facts.highlights.overPerformer.maxStageReached,
                      )}
                      valueLabel={formatStageDelta(
                        facts.highlights.overPerformer.value,
                        t,
                      )}
                    />
                  }
                />
              )}
              {facts.highlights.underPerformer && (
                <HighlightCard
                  title={t("highlights.underPerformer")}
                  footnote={t("highlights.underPerformerFootnote")}
                  href={`/team-analysis?team=${facts.highlights.underPerformer.team.id}&mode=${mode}`}
                  body={
                    <TeamHighlightBody
                      highlight={facts.highlights.underPerformer}
                      stageLabel={stageLabel(
                        facts.highlights.underPerformer.maxStageReached,
                      )}
                      valueLabel={formatStageDelta(
                        facts.highlights.underPerformer.value,
                        t,
                      )}
                    />
                  }
                />
              )}
              {facts.highlights.biggestGiantKilling && (
                <HighlightCard
                  title={t("highlights.biggestGiantKilling")}
                  footnote={t("highlights.upsetFootnote")}
                  href={`/team-analysis?team=${facts.highlights.biggestGiantKilling.team.id}&mode=${mode}`}
                  body={
                    <UpsetHighlightBody
                      upset={facts.highlights.biggestGiantKilling}
                      roundLabel={getRoundDisplayName(
                        stages,
                        facts.highlights.biggestGiantKilling.round,
                      )}
                      pointsGapLabel={t("highlights.pointsGap", {
                        points: formatFifaPoints(
                          Math.abs(facts.highlights.biggestGiantKilling.pointsGap),
                        ),
                      })}
                    />
                  }
                />
              )}
              {facts.highlights.biggestFavoriteUpset && (
                <HighlightCard
                  title={t("highlights.biggestFavoriteUpset")}
                  footnote={t("highlights.upsetFootnote")}
                  href={`/team-analysis?team=${facts.highlights.biggestFavoriteUpset.team.id}&mode=${mode}`}
                  body={
                    <UpsetHighlightBody
                      upset={facts.highlights.biggestFavoriteUpset}
                      roundLabel={getRoundDisplayName(
                        stages,
                        facts.highlights.biggestFavoriteUpset.round,
                      )}
                      pointsGapLabel={t("highlights.pointsGap", {
                        points: formatFifaPoints(
                          Math.abs(facts.highlights.biggestFavoriteUpset.pointsGap),
                        ),
                      })}
                    />
                  }
                />
              )}
              {facts.highlights.giantKillerLeader && (
                <HighlightCard
                  title={t("highlights.giantKillerLeader")}
                  footnote={t("highlights.giantKillerFootnote")}
                  href={`/team-analysis?team=${facts.highlights.giantKillerLeader.team.id}&mode=${mode}`}
                  body={
                    <TeamHighlightBody
                      highlight={facts.highlights.giantKillerLeader}
                      stageLabel={stageLabel(
                        facts.highlights.giantKillerLeader.maxStageReached,
                      )}
                      valueLabel={t("highlights.pointsOvercome", {
                        points: formatFifaPoints(
                          facts.highlights.giantKillerLeader.value,
                        ),
                      })}
                    />
                  }
                />
              )}
              {facts.highlights.hardestRemainingPath && (
                <HighlightCard
                  title={t("highlights.hardestRemainingPath")}
                  href={`/team-analysis?team=${facts.highlights.hardestRemainingPath.team.id}&mode=${mode}`}
                  body={
                    <TeamHighlightBody
                      highlight={facts.highlights.hardestRemainingPath}
                      stageLabel={stageLabel(
                        facts.highlights.hardestRemainingPath.maxStageReached,
                      )}
                      valueLabel={formatFifaPoints(
                        facts.highlights.hardestRemainingPath.value,
                      )}
                    />
                  }
                />
              )}
              {facts.highlights.easiestRemainingPath && (
                <HighlightCard
                  title={t("highlights.easiestRemainingPath")}
                  href={`/team-analysis?team=${facts.highlights.easiestRemainingPath.team.id}&mode=${mode}`}
                  body={
                    <TeamHighlightBody
                      highlight={facts.highlights.easiestRemainingPath}
                      stageLabel={stageLabel(
                        facts.highlights.easiestRemainingPath.maxStageReached,
                      )}
                      valueLabel={formatFifaPoints(
                        facts.highlights.easiestRemainingPath.value,
                      )}
                    />
                  }
                />
              )}
              {facts.highlights.groupOfDeath && (
                <HighlightCard
                  title={t("highlights.groupOfDeath")}
                  footnote={t("highlights.groupOfDeathFootnote")}
                  href={`/groups?group=${facts.highlights.groupOfDeath.groupLetter}&mode=${mode}`}
                  body={
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-white">
                        {t("highlights.groupLabel", {
                          letter: facts.highlights.groupOfDeath.groupLetter,
                        })}
                      </p>
                      <p className="font-mono text-sm font-semibold tabular-nums text-wc-orange">
                        {formatFifaPoints(
                          facts.highlights.groupOfDeath.avgFifaPoints,
                        )}{" "}
                        {t("highlights.avgGroupPoints")}
                      </p>
                    </div>
                  }
                />
              )}
            </div>
          </section>

          <p className="text-xs text-muted-foreground">
            {t("methodologyNote")}{" "}
            <Link href="/about" className="text-wc-sky hover:underline">
              {t("methodologyLink")}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
