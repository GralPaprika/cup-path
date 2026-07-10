"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { AvgPointsContext, PathStage, Team, TeamPathSummary } from "@/lib/types";
import type { CohortOrderingCorrelation } from "@/lib/domain/rank-correlation";
import type { PathOpponentStats } from "@/lib/domain/path-opponent-stats";
import {
  clampPathStages,
  isStageWithinReach,
  parsePathStages,
} from "@/lib/domain/match-stages";
import { RankingModeToggle } from "@/components/ranking-mode-toggle";
import { TeamSelector } from "@/components/team-selector";
import {
  PathStageFilters,
  serializePathStages,
} from "@/components/path-stage-filters";
import { useSyncedRankingMode } from "@/hooks/use-synced-ranking-mode";
import { AdvancedStatsPanel } from "@/components/advanced-stats-panel";
import { SummaryCard } from "@/components/summary-card";
import { PathTable } from "@/components/path-table";
import {
  PathTableSkeleton,
  SummaryCardSkeleton,
} from "@/components/loading-skeletons";
import { useTranslations } from "next-intl";

interface AnalysisResponse {
  summary: TeamPathSummary;
  avgPointsContext: AvgPointsContext | null;
  hardestPathRank: number | null;
  hardestPathRankByAvgRank: number | null;
  cohortSize: number;
  cohortStage: PathStage;
  maxStageReached: PathStage;
  advanced: {
    pathStats: PathOpponentStats;
    cohortCorrelation: CohortOrderingCorrelation;
  };
}

function stagesNeedClamp(stages: Set<PathStage>, maxStage: PathStage): boolean {
  return [...stages].some((stage) => !isStageWithinReach(stage, maxStage));
}

export function AnalysisPageClient({ teams }: { teams: Team[] }) {
  const searchParams = useSearchParams();
  const t = useTranslations("common");
  const analysis = useTranslations("analysis");
  const initialTeam = searchParams.get("team")?.toUpperCase() ?? teams[0]?.id ?? "ARG";
  const initialStages = parsePathStages(searchParams.get("stages"));

  const [teamId, setTeamId] = useState(initialTeam);
  const [mode, setMode] = useSyncedRankingMode(searchParams);
  const [stages, setStages] = useState<Set<PathStage>>(initialStages);
  const [teamList, setTeamList] = useState(teams);
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [maxStageReached, setMaxStageReached] = useState<PathStage | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/teams?mode=${mode}`)
      .then((res) => res.json())
      .then((json: { teams: Team[] }) => setTeamList(json.teams))
      .catch(() => setTeamList(teams));
  }, [mode, teams]);

  useEffect(() => {
    setMaxStageReached(undefined);
  }, [teamId]);

  const loadAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        team: teamId,
        mode,
        stages: serializePathStages(stages),
      });
      const response = await fetch(`/api/analysis?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load analysis");
      const json = (await response.json()) as AnalysisResponse;

      if (stagesNeedClamp(stages, json.maxStageReached)) {
        setStages(clampPathStages(stages, json.maxStageReached));
        return;
      }

      setMaxStageReached(json.maxStageReached);
      setData(json);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }, [teamId, mode, stages, t]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  useEffect(() => {
    const params = new URLSearchParams({
      team: teamId,
      mode,
      stages: serializePathStages(stages),
    });
    window.history.replaceState(null, "", `/?${params.toString()}`);
  }, [teamId, mode, stages]);

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
            <RankingModeToggle
              value={mode}
              onChange={setMode}
              variant="sidebar"
            />
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
