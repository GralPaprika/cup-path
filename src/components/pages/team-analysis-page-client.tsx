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
      <header className="mb-6 min-w-0">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          {analysis("title")}
        </h1>
        <p className="mt-1 max-w-3xl text-pretty text-sm text-muted-foreground sm:text-base">
          {analysis("originStory")}
        </p>
      </header>

      <div className="glass-panel mb-6 space-y-4 p-4 md:hidden">
        <TeamSelector teams={teamList} value={teamId} onChange={setTeamId} />
        <PathStageFilters
          value={stages}
          onChange={setStages}
          maxStageReached={maxStageReached}
          variant="toggles"
          compact
        />
      </div>

      <div className="sticky top-0 z-20 -mx-4 mb-6 hidden border-b border-white/10 bg-wc-navy/95 px-4 py-2.5 backdrop-blur-xl sm:-mx-6 sm:px-6 md:block">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
          <TeamSelector
            teams={teamList}
            value={teamId}
            onChange={setTeamId}
            size="compact"
            className="shrink-0"
          />
          <PathStageFilters
            value={stages}
            onChange={setStages}
            maxStageReached={maxStageReached}
            variant="toggles"
            compact
            align="end"
            className="min-w-0 flex-1"
          />
        </div>
      </div>

      <div className="min-w-0 space-y-6">
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
  );
}
