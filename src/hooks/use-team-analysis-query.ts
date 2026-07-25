"use client";

import { useEffect, useMemo } from "react";
import type { PathStage, Team } from "@/lib/types";
import {
  clampPathStages,
  isStageWithinReach,
  serializePathStages,
} from "@/lib/domain/match/match-stages";
import { useRankingMode } from "@/components/layout/ranking-mode-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import { usePersistedPathStages } from "@/hooks/use-persisted-path-stages";
import { useUrlParamState } from "@/hooks/use-url-param-state";
import type { TeamAnalysisResult, TeamsResponse } from "@/lib/api/responses";
import { useTranslations } from "next-intl";

function stagesNeedClamp(stages: Set<PathStage>, maxStage: PathStage): boolean {
  return [...stages].some((stage) => !isStageWithinReach(stage, maxStage));
}

export function useTeamAnalysisQuery(initialTeams: Team[]) {
  const t = useTranslations("common");
  const [teamId, setTeamId] = useUrlParamState("/", "team", "ESP");
  const { mode } = useRankingMode();
  const [stages, setStages, stagesHydrated] = usePersistedPathStages("team-analysis");

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

  const freshData =
    rawData?.summary.team.id === teamId ? rawData : null;
  const needsClamp = freshData
    ? stagesNeedClamp(stages, freshData.maxStageReached)
    : false;
  const data = needsClamp ? null : freshData;
  const maxStageReached = freshData?.maxStageReached;

  useEffect(() => {
    if (!freshData || !needsClamp) return;
    // The server response defines the reachable stage boundary.
    setStages(clampPathStages(stages, freshData.maxStageReached));
  }, [freshData, needsClamp, setStages, stages]);

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
