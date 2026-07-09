"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PathStage, RankingMode, Team, TeamPathSummary } from "@/lib/types";
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
import { SummaryCard } from "@/components/summary-card";
import { PathTable } from "@/components/path-table";
import {
  PathTableSkeleton,
  SummaryCardSkeleton,
} from "@/components/loading-skeletons";
import { useTranslations } from "next-intl";

interface AnalysisResponse {
  summary: TeamPathSummary;
  hardestPathRank: number | null;
  cohortSize: number;
  cohortStage: PathStage;
  maxStageReached: PathStage;
}

function stagesNeedClamp(stages: Set<PathStage>, maxStage: PathStage): boolean {
  return [...stages].some((stage) => !isStageWithinReach(stage, maxStage));
}

export function AnalysisPageClient({ teams }: { teams: Team[] }) {
  const searchParams = useSearchParams();
  const t = useTranslations("common");
  const analysis = useTranslations("analysis");
  const initialTeam = searchParams.get("team")?.toUpperCase() ?? teams[0]?.id ?? "ARG";
  const initialMode = (searchParams.get("mode") as RankingMode) ?? "live";
  const initialStages = parsePathStages(searchParams.get("stages"));

  const [teamId, setTeamId] = useState(initialTeam);
  const [mode, setMode] = useState<RankingMode>(initialMode);
  const [stages, setStages] = useState<Set<PathStage>>(initialStages);
  const [teamList, setTeamList] = useState(teams);
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [maxStageReached, setMaxStageReached] = useState<PathStage | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="overflow-hidden rounded-2xl border border-emerald-200/70 bg-white shadow-lg shadow-emerald-950/5">
        <div className="border-b bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 px-6 py-6 text-white">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {analysis("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-emerald-100/90 sm:text-base">
            {analysis("subtitle")}
          </p>
        </div>

        <div className="space-y-6 border-b bg-gradient-to-b from-emerald-50/80 to-white px-4 py-5 sm:px-6">
          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {analysis("rankingSnapshot")}
            </p>
            <RankingModeToggle
              value={mode}
              onChange={setMode}
              variant="compact"
            />
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
              <TeamSelector teams={teamList} value={teamId} onChange={setTeamId} />
            </section>
            <section className="rounded-xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
              <PathStageFilters
                value={stages}
                onChange={setStages}
                maxStageReached={maxStageReached}
              />
            </section>
          </div>
        </div>

        {loading && !error && (
          <div className="space-y-6 p-4 sm:p-6">
            <SummaryCardSkeleton />
            <PathTableSkeleton />
          </div>
        )}
        {error && (
          <div className="m-4 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-destructive sm:m-6">
            {error}
          </div>
        )}
        {data && !loading && (
          <div className="space-y-6 p-4 sm:p-6">
            <SummaryCard
              summary={data.summary}
              hardestPathRank={data.hardestPathRank}
              cohortSize={data.cohortSize}
              cohortStage={data.cohortStage}
              includedStages={stages}
            />
            <PathTable
              matches={data.summary.matches}
              includedStages={stages}
            />
          </div>
        )}
      </div>
    </div>
  );
}
