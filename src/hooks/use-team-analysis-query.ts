"use client";

import { useEffect, useMemo, useState } from "react";
import type { PathStage, Team } from "@/lib/types";
import { serializePathStages } from "@/lib/domain/match/match-stages";
import { resolveTeamAnalysisStageSync } from "@/lib/domain/team/team-analysis-stage-sync";
import { useRankingMode } from "@/components/layout/ranking-mode-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import { usePersistedPathStages } from "@/hooks/use-persisted-path-stages";
import { useUrlParamState } from "@/hooks/use-url-param-state";
import type { TeamAnalysisResult, TeamsResponse } from "@/lib/api/responses";
import { useTranslations } from "next-intl";

export function useTeamAnalysisQuery(initialTeams: Team[]) {
  const t = useTranslations("common");
  const [teamId, setTeamId] = useUrlParamState("/", "team", "ESP");
  const { mode } = useRankingMode();
  const [stages, setStages, stagesHydrated] = usePersistedPathStages("team-analysis");
  const [data, setData] = useState<TeamAnalysisResult | null>(null);
  const [maxStageReached, setMaxStageReached] = useState<PathStage | undefined>();

  const { data: teamsData } = useApiQuery<TeamsResponse>("/api/teams", [mode]);
  const teamList = teamsData?.teams ?? initialTeams;

  const analysisBody = useMemo(
    () => ({
      team: teamId,
      mode,
      stages: serializePathStages(stages),
    }),
    [teamId, mode, stages],
  );
  const {
    data: rawData,
    loading,
    error,
  } = useApiQuery<TeamAnalysisResult>(
    "/api/analysis",
    [teamId, mode, stages, stagesHydrated],
    {
      method: "POST",
      body: analysisBody,
      errorMessage: t("error"),
      enabled: stagesHydrated,
    },
  );

  // Reset path reach on team switch so the next response expands stages
  // through the new team's reachable path (instead of only clamping).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on team change
    setMaxStageReached(undefined);
    setData(null);
  }, [teamId]);

  useEffect(() => {
    if (!rawData || rawData.summary.team.id !== teamId) return;

    const sync = resolveTeamAnalysisStageSync(
      stages,
      maxStageReached,
      rawData.maxStageReached,
    );

    if (sync.action === "expand" || sync.action === "clamp") {
      setStages(sync.stages);
      if (sync.action === "clamp") return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync local view to analysis response
    setMaxStageReached(rawData.maxStageReached);
    setData(rawData);
  }, [rawData, stages, maxStageReached, setStages, teamId]);

  return {
    teamId,
    setTeamId,
    stages,
    setStages,
    teamList,
    data,
    loading,
    error,
    maxStageReached,
  };
}
