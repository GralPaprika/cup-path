"use client";

import { useState } from "react";
import { TeamSelector } from "@/components/team/team-selector";
import { PathStageFilters } from "@/components/path/path-stage-filters";
import { usePageUrlParamsSync } from "@/hooks/use-page-url-params-sync";
import { useTeamAnalysisQuery } from "@/hooks/use-team-analysis-query";
import { AdvancedStatsPanel } from "@/components/path/advanced-stats-panel";
import { SummaryCard } from "@/components/shared/summary-card";
import { PathTable } from "@/components/path/path-table";
import {
  PathTableSkeleton,
  SummaryCardSkeleton,
} from "@/components/loading-skeletons";
import type { Team } from "@/lib/types";
import { useTranslations } from "next-intl";

export function TeamAnalysisPageClient({ teams }: { teams: Team[] }) {
  const analysis = useTranslations("teamAnalysis");
  const {
    teamId,
    setTeamId,
    stages,
    setStages,
    teamList,
    data,
    loading,
    error,
    maxStageReached,
  } = useTeamAnalysisQuery(teams);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  usePageUrlParamsSync("/");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          {analysis("title")}
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground sm:text-base">
          {analysis("originStory")}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="glass-panel h-fit space-y-6 p-5 lg:sticky lg:top-[var(--shell-sticky-top)]">
          <section>
            <TeamSelector teams={teamList} value={teamId} onChange={setTeamId} />
          </section>

          <section>
            <PathStageFilters
              value={stages}
              onChange={setStages}
              maxStageReached={maxStageReached}
              variant="picker"
            />
          </section>
        </aside>

        <div className="space-y-6">
          {loading && !data && !error && (
            <>
              <SummaryCardSkeleton />
              <PathTableSkeleton />
            </>
          )}
          {error && (
            <div className="glass-panel border-wc-red/30 p-6 text-wc-red">
              {error}
            </div>
          )}
          {data && (
            <>
              <SummaryCard
                summary={data.summary}
                avgPointsContext={data.avgPointsContext}
                hardestPathRank={data.hardestPathRank}
                hardestPathRankByAvgRank={data.hardestPathRankByAvgRank}
                cohortSize={data.cohortSize}
                cohortStage={data.cohortStage}
                includedStages={stages}
              />
              <PathTable
                matches={data.summary.matches}
                includedStages={stages}
              />
              <AdvancedStatsPanel
                pathStats={data.advanced.pathStats}
                cohortCorrelation={data.advanced.cohortCorrelation}
                hardestPathRank={data.hardestPathRank}
                hardestPathRankByAvgRank={data.hardestPathRankByAvgRank}
                cohortSize={data.cohortSize}
                cohortStage={data.cohortStage}
                selectedTeam={data.summary.team}
                selectedTeamPoints={data.summary.teamPoints}
                open={advancedOpen}
                onOpenChange={setAdvancedOpen}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
