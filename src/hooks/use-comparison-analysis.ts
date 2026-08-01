"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComparisonEntry, PathStage } from "@/lib/types";
import {
  parseTeamRound,
  serializePathStages,
  stagesAlignedToTeamRound,
  stagesForTeamRoundChange,
  visibleCountStages,
} from "@/lib/domain/match/match-stages";
import { useRankingMode } from "@/components/layout/ranking-mode-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import { usePersistedPathStages } from "@/hooks/use-persisted-path-stages";
import { useUrlParamState } from "@/hooks/use-url-param-state";
import {
  readInitialTeamRound,
  writeTeamRoundPreference,
} from "@/lib/client/team-round-preference";
import type { ComparisonAnalysisResult, TeamsResponse } from "@/lib/api/responses";
import { useTranslations } from "next-intl";

export function useComparisonAnalysis() {
  const t = useTranslations("common");
  const { mode } = useRankingMode();
  const [stages, setStages, stagesHydrated] = usePersistedPathStages("compare");
  const [teamRound, setTeamRound] = useState<PathStage>(() => parseTeamRound(null));
  const [filtersHydrated, setFiltersHydrated] = useState(false);
  const [teamAId, setTeamAId] = useUrlParamState("/compare", "team");
  const [teamBId, setTeamBId] = useUrlParamState("/compare", "vs");
  const [entries, setEntries] = useState<ComparisonEntry[]>([]);
  const [cohortStage, setCohortStage] = useState<PathStage>("group");
  const [cohortSize, setCohortSize] = useState(48);
  const [maxStageReached, setMaxStageReached] = useState<PathStage | undefined>();
  const [teamCounts, setTeamCounts] = useState<Record<PathStage, number> | null>(
    null,
  );
  const { data: teamsData } = useApiQuery<TeamsResponse>("/api/teams", [mode]);
  const teamList = teamsData?.teams ?? [];

  useEffect(() => {
    if (!stagesHydrated) return;
    // Hydrate team round once after stage preferences load from localStorage.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- preference hydration
    const hydratedRound = readInitialTeamRound("compare");
    setTeamRound(hydratedRound);
    setStages((current) => stagesAlignedToTeamRound(hydratedRound, current));
    setFiltersHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagesHydrated]);

  // Drop pair-specific state whenever either side changes so shared-path
  // alignment cannot reuse the previous opponents' reach.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on opponent change
    setMaxStageReached(undefined);
    setEntries([]);
    setTeamCounts(null);
  }, [teamAId, teamBId]);

  const bothTeamsSelected =
    Boolean(teamAId) && Boolean(teamBId) && teamAId !== teamBId;

  const comparisonBody = useMemo(
    () => ({
      mode,
      stages: serializePathStages(stages),
      teamRound,
      team: teamAId || undefined,
      vs: bothTeamsSelected ? teamBId : undefined,
    }),
    [mode, stages, teamRound, teamAId, teamBId, bothTeamsSelected],
  );

  const {
    data: rawComparison,
    loading,
    error,
  } = useApiQuery<ComparisonAnalysisResult & { teamRound: PathStage }>(
    "/api/comparison",
    [mode, stages, teamRound, teamAId, teamBId, filtersHydrated],
    {
      method: "POST",
      body: comparisonBody,
      errorMessage: t("error"),
      enabled: filtersHydrated,
    },
  );

  useEffect(() => {
    if (!rawComparison) return;

    setEntries(rawComparison.comparison);
    setTeamCounts(rawComparison.teamCounts);
    setCohortStage(rawComparison.cohortStage);
    setCohortSize(rawComparison.cohortSize);
    setMaxStageReached(rawComparison.maxStageReached);
  }, [rawComparison]);

  function handleStagesChange(next: Set<PathStage>) {
    setStages(next);
  }

  function handleTeamRoundChange(next: PathStage) {
    setStages((currentStages) =>
      stagesForTeamRoundChange(teamRound, next, currentStages),
    );
    setTeamRound(next);
    writeTeamRoundPreference("compare", next);
  }

  return {
    mode,
    teamAId,
    setTeamAId,
    teamBId,
    setTeamBId,
    stages,
    handleStagesChange,
    teamRound,
    handleTeamRoundChange,
    visibleCountStages: visibleCountStages(teamRound),
    teamList,
    entries,
    teamCounts,
    cohortStage,
    cohortSize,
    maxStageReached,
    loading,
    error,
  };
}
