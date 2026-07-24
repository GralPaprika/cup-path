"use client";

import Link from "next/link";
import { GroupExpectedFinishesPanel } from "@/components/groups/group-expected-finishes-panel";
import { KnockoutStagePanel } from "@/components/knockout/knockout-stage-panel";
import { ParticipantPoolSection } from "@/components/facts/participant-pool-section";
import { IntroductionSection } from "@/components/facts/introduction-section";
import { MatchOutcomeGapPanel } from "@/components/facts/match-outcome-gap-panel";
import {
  FactsSectionNav,
  KNOCKOUT_SECTION_IDS,
} from "@/components/facts/facts-section-nav";
import { KNOCKOUT_FACTS_ROUNDS } from "@/lib/domain/knockout/knockout-facts-round-config";
import { FactsPageSkeleton } from "@/components/loading-skeletons";
import { useRankingMode } from "@/components/layout/ranking-mode-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import { useRankingModeUrlSync } from "@/hooks/use-ranking-mode-url-sync";
import { scrollIntoViewRespectingMotion } from "@/lib/client/scroll-into-view";
import type { TournamentFacts } from "@/lib/api/responses";
import type { KnockoutFactsRoundId } from "@/lib/types";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

const SECTION_SCROLL_MT =
  "scroll-mt-[calc(var(--site-header-height)+1rem)]";

function availableKnockoutRoundsFromFacts(
  facts: TournamentFacts,
): Set<KnockoutFactsRoundId> {
  const rounds = new Set<KnockoutFactsRoundId>();
  for (const round of KNOCKOUT_FACTS_ROUNDS) {
    if (facts.knockoutAnalyses[round.id]) rounds.add(round.id);
  }
  return rounds;
}

export function FactsPageClient() {
  const t = useTranslations("home");
  const common = useTranslations("common");
  const { mode } = useRankingMode();

  const { data: facts, loading, error } = useApiQuery<TournamentFacts>(
    "/api/facts",
    [mode],
    { errorMessage: common("error") },
  );

  // Strip legacy ?mode= query params; ranking mode lives in a cookie.
  useRankingModeUrlSync("/overview");

  // Sections mount after the facts fetch; re-scroll once the hash target exists.
  useEffect(() => {
    if (!facts) return;
    const id = window.location.hash.slice(1);
    if (!id) return;
    requestAnimationFrame(() => {
      scrollIntoViewRespectingMotion(document.getElementById(id));
    });
  }, [facts]);

  if (loading && !facts) {
    return <FactsPageSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
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
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <FactsSectionNav
            availableKnockoutRounds={availableKnockoutRoundsFromFacts(facts)}
          />

          <div className="space-y-6">
            <section
              id="introduction"
              className={`${SECTION_SCROLL_MT} glass-panel p-5 sm:p-6`}
            >
              <IntroductionSection teamTiers={facts.teamTiers} />
            </section>

            <section id="tournament-snapshot" className={SECTION_SCROLL_MT}>
              {facts.matchOutcomeGap &&
              facts.matchOutcomeGap.matches.length > 0 ? (
                <MatchOutcomeGapPanel dataset={facts.matchOutcomeGap} />
              ) : (
                <div className="glass-panel p-5 text-sm text-muted-foreground sm:p-6">
                  {t("sectionNav.snapshotEmpty")}
                </div>
              )}
            </section>

            <section
              id="group-round"
              className={`${SECTION_SCROLL_MT} glass-panel space-y-6 p-5 sm:p-6`}
            >
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {t("groupStagePool.title")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("groupStagePool.subtitle", {
                    count: facts.groupStagePool.teamCount,
                  })}
                </p>
              </div>

              <ParticipantPoolSection
                embedded
                avgFifaPointsLabel={t("groupStagePool.avgFifaPoints")}
                medianFifaRankLabel={t("groupStagePool.medianFifaRank")}
                lowestRankedQualifierLabel={t(
                  "groupStagePool.lowestRankedQualifier",
                )}
                avgFifaPoints={facts.groupStagePool.avgFifaPoints}
                avgFifaPointsContext={facts.groupStagePool.avgFifaPointsContext}
                medianFifaRank={facts.groupStagePool.medianFifaRank}
                lowestRankedQualifier={
                  facts.groupStagePool.lowestRankedQualifier
                    ? {
                        team: facts.groupStagePool.lowestRankedQualifier.team,
                        fifaRank:
                          facts.groupStagePool.lowestRankedQualifier.fifaRank,
                        fifaPoints:
                          facts.groupStagePool.lowestRankedQualifier.fifaPoints,
                        hint: t("groupStagePool.lowestRankedQualifierHint", {
                          group:
                            facts.groupStagePool.lowestRankedQualifier
                              .groupLetter,
                        }),
                      }
                    : null
                }
              />

              {facts.groupExpectedAnalysis && (
                <GroupExpectedFinishesPanel
                  embedded
                  analysis={facts.groupExpectedAnalysis}
                  groupStageDifficulty={facts.groupStageDifficulty}
                />
              )}
            </section>

            {KNOCKOUT_FACTS_ROUNDS.map((round) => {
              const analysis = facts.knockoutAnalyses[round.id];
              if (!analysis) return null;
              return (
                <section
                  key={round.id}
                  id={KNOCKOUT_SECTION_IDS[round.id]}
                  className={SECTION_SCROLL_MT}
                >
                  <KnockoutStagePanel
                    round={round}
                    analysis={analysis}
                  />
                </section>
              );
            })}

            <p className="text-xs text-muted-foreground">
              {t("methodologyNote")}{" "}
              <Link href="/about" className="text-wc-sky hover:underline">
                {t("methodologyLink")}
              </Link>
              {" · "}
              <Link href="/compare" className="text-wc-sky hover:underline">
                {t("compareAllPaths")}
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
