"use client";

import Link from "next/link";
import { GroupExpectedFinishesPanel } from "@/components/groups/group-expected-finishes-panel";
import { KnockoutStagePanel } from "@/components/knockout/knockout-stage-panel";
import { ParticipantPoolSection } from "@/components/facts/participant-pool-section";
import { MatchOutcomeGapPanel } from "@/components/facts/match-outcome-gap-panel";
import { KNOCKOUT_FACTS_ROUNDS } from "@/lib/domain/knockout/knockout-facts-round-config";
import { FactsPageSkeleton } from "@/components/loading-skeletons";
import { useRankingMode } from "@/components/layout/ranking-mode-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import { useRankingModeUrlSync } from "@/hooks/use-ranking-mode-url-sync";
import type { TournamentFacts } from "@/lib/api/responses";
import { useTranslations } from "next-intl";

export function FactsPageClient() {
  const t = useTranslations("home");
  const common = useTranslations("common");
  const { mode } = useRankingMode();

  const { data: facts, loading, error } = useApiQuery<TournamentFacts>(
    `/api/facts?mode=${mode}`,
    [mode],
    { errorMessage: common("error") },
  );

  useRankingModeUrlSync("/");

  if (loading && !facts) {
    return <FactsPageSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{t("title")}</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground sm:text-base">
          {t("subtitle")}
        </p>
      </header>

      {error && (
        <div className="glass-panel mb-6 border-wc-red/30 bg-wc-red/10 p-6 text-wc-red">
          {error}
        </div>
      )}

      {facts && (
        <div className="space-y-6">
          {facts.matchOutcomeGap && facts.matchOutcomeGap.matches.length > 0 && (
            <MatchOutcomeGapPanel dataset={facts.matchOutcomeGap} />
          )}

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
