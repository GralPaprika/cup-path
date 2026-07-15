"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PathStage, Team } from "@/lib/types";
import {
  clampPathStages,
  isStageWithinReach,
} from "@/lib/domain/match/match-stages";
import { TeamSelector } from "@/components/team/team-selector";
import {
  PathStageFilters,
  serializePathStages,
} from "@/components/path/path-stage-filters";
import { useRankingMode } from "@/components/layout/ranking-mode-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import { useRankingModeUrlSync } from "@/hooks/use-ranking-mode-url-sync";
import { usePersistedPathStages } from "@/hooks/use-persisted-path-stages";
import type { TeamAnalysisResult, TeamsResponse } from "@/lib/api/responses";
import { AdvancedStatsPanel } from "@/components/path/advanced-stats-panel";
import { SummaryCard } from "@/components/shared/summary-card";
import { PathTable } from "@/components/path/path-table";
import {
  PathTableSkeleton,
  SummaryCardSkeleton,
} from "@/components/loading-skeletons";
import { useTranslations } from "next-intl";

function stagesNeedClamp(stages: Set<PathStage>, maxStage: PathStage): boolean {
  return [...stages].some((stage) => !isStageWithinReach(stage, maxStage));
}

export function TeamAnalysisPageClient({ teams }: { teams: Team[] }) {
  const searchParams = useSearchParams();
  const t = useTranslations("common");
  const analysis = useTranslations("teamAnalysis");
  const initialTeam = searchParams.get("team")?.toUpperCase() ?? teams[0]?.id ?? "ARG";

  const [teamId, setTeamId] = useState(initialTeam);
  const { mode } = useRankingMode();
  const [stages, setStages, stagesHydrated] = usePersistedPathStages("team-analysis");
  const [data, setData] = useState<TeamAnalysisResult | null>(null);
  const [maxStageReached, setMaxStageReached] = useState<PathStage | undefined>();

  const { data: teamsData } = useApiQuery<TeamsResponse>(
    `/api/teams?mode=${mode}`,
    [mode],
  );
  const teamList = teamsData?.teams ?? teams;

  const analysisParams = new URLSearchParams({
    team: teamId,
    mode,
    stages: serializePathStages(stages),
  });
  const {
    data: rawData,
    loading,
    error,
  } = useApiQuery<TeamAnalysisResult>(
    `/api/analysis?${analysisParams.toString()}`,
    [teamId, mode, stages, stagesHydrated],
    { errorMessage: t("error"), enabled: stagesHydrated },
  );

  useEffect(() => {
    setMaxStageReached(undefined);
  }, [teamId]);

  useEffect(() => {
    if (!rawData) return;
    if (stagesNeedClamp(stages, rawData.maxStageReached)) {
      setStages(clampPathStages(stages, rawData.maxStageReached));
      return;
    }
    setMaxStageReached(rawData.maxStageReached);
    setData(rawData);
  }, [rawData, stages]);

  useRankingModeUrlSync(
    "/team-analysis",
    () => ({ team: teamId }),
    [teamId],
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          {analysis("title")}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {analysis("subtitle")}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="glass-panel h-fit space-y-6 p-5 lg:sticky lg:top-20">
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
              {loading ? (
                <SummaryCardSkeleton />
              ) : (
                <SummaryCard
                  summary={data.summary}
                  avgPointsContext={data.avgPointsContext}
                  hardestPathRank={data.hardestPathRank}
                  hardestPathRankByAvgRank={data.hardestPathRankByAvgRank}
                  cohortSize={data.cohortSize}
                  cohortStage={data.cohortStage}
                  includedStages={stages}
                />
              )}
              {loading ? (
                <PathTableSkeleton />
              ) : (
                <PathTable
                  matches={data.summary.matches}
                  includedStages={stages}
                />
              )}
              <AdvancedStatsPanel
                pathStats={data.advanced.pathStats}
                cohortCorrelation={data.advanced.cohortCorrelation}
                hardestPathRank={data.hardestPathRank}
                hardestPathRankByAvgRank={data.hardestPathRankByAvgRank}
                cohortSize={data.cohortSize}
                cohortStage={data.cohortStage}
                selectedTeam={data.summary.team}
                selectedTeamPoints={data.summary.teamPoints}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
