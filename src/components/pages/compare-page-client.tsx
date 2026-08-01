"use client";

import { PathStageFilters } from "@/components/path/path-stage-filters";
import { TeamRoundSelector } from "@/components/team/team-round-selector";
import { ComparisonTable } from "@/components/compare/comparison-table";
import { TeamHeadToHeadPanel } from "@/components/team/team-head-to-head-panel";
import { CompareLoadingSkeleton } from "@/components/loading-skeletons";
import { usePageUrlParamsSync } from "@/hooks/use-page-url-params-sync";
import { useComparisonAnalysis } from "@/hooks/use-comparison-analysis";
import { useTranslations } from "next-intl";

export function ComparePageClient() {
  const compare = useTranslations("compare");
  const {
    mode,
    teamAId,
    setTeamAId,
    teamBId,
    setTeamBId,
    stages,
    handleStagesChange,
    teamRound,
    handleTeamRoundChange,
    visibleCountStages,
    teamList,
    entries,
    teamCounts,
    cohortStage,
    cohortSize,
    loading,
    error,
  } = useComparisonAnalysis();

  usePageUrlParamsSync("/compare");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          {compare("title")}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {compare("subtitle")}
        </p>
      </header>

      <div className="glass-panel mb-6 space-y-6 p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <section>
            <TeamRoundSelector
              value={teamRound}
              onChange={handleTeamRoundChange}
              teamCount={teamCounts?.[teamRound]}
            />
          </section>
          <section>
            <PathStageFilters
              value={stages}
              onChange={handleStagesChange}
              visibleStages={visibleCountStages}
              variant="toggles"
            />
          </section>
        </div>
      </div>

      <div className="glass-panel p-5 sm:p-6">
        {error && (
          <div className="rounded-xl border border-wc-red/30 bg-wc-red/10 p-6 text-wc-red">
            {error}
          </div>
        )}
        {!error && (
          <>
            <TeamHeadToHeadPanel
              teams={teamList}
              entries={entries}
              teamAId={teamAId}
              teamBId={teamBId}
              onTeamAChange={setTeamAId}
              onTeamBChange={setTeamBId}
              cohortStage={cohortStage}
              cohortSize={cohortSize}
              mode={mode}
              stages={stages}
            />
            {loading ? (
              <CompareLoadingSkeleton embedded showDelta={false} />
            ) : (
              <ComparisonTable
                entries={entries}
                compareTeamAId={teamAId || undefined}
                compareTeamBId={teamBId || undefined}
                cohortStage={cohortStage}
                cohortSize={cohortSize}
                embedded
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
