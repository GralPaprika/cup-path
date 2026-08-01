"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ComparisonEntry, PathStage } from "@/lib/types";
import {
  parseTeamRound,
  serializePathStages,
  stageIndex,
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
  const teamRoundRef = useRef(teamRound);
  teamRoundRef.current = teamRound;
  const [filtersHydrated, setFiltersHydrated] = useState(false);
  const [urlTeamAId, setUrlTeamAId] = useUrlParamState("/compare", "team");
  const [urlTeamBId, setUrlTeamBId] = useUrlParamState("/compare", "vs");
  // replaceState does not always update useSearchParams; ignore URL teams after a
  // user-driven Show-teams change until they pick teams again.
  const [ignoreUrlTeams, setIgnoreUrlTeams] = useState(false);
  const teamAId = ignoreUrlTeams ? "" : urlTeamAId;
  const teamBId = ignoreUrlTeams ? "" : urlTeamBId;
  const [entries, setEntries] = useState<ComparisonEntry[]>([]);
  const [cohortStage, setCohortStage] = useState<PathStage>("group");
  const [cohortSize, setCohortSize] = useState(48);
  const [maxStageReached, setMaxStageReached] = useState<PathStage | undefined>();
  const [teamCounts, setTeamCounts] = useState<Record<PathStage, number> | null>(
    null,
  );
  const { data: teamsData } = useApiQuery<TeamsResponse>("/api/teams", [mode]);
  const teamList = teamsData?.teams ?? [];

  function setTeamAId(next: string) {
    setIgnoreUrlTeams(false);
    setUrlTeamAId(next);
  }

  function setTeamBId(next: string) {
    setIgnoreUrlTeams(false);
    setUrlTeamBId(next);
  }

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

  function applyTeamRound(next: PathStage, fromRound: PathStage) {
    if (fromRound === next) return;
    setStages((currentStages) =>
      stagesForTeamRoundChange(fromRound, next, currentStages),
    );
    setTeamRound(next);
    writeTeamRoundPreference("compare", next);
  }

  function handleTeamRoundChange(next: PathStage) {
    if (next === teamRound) return;
    setIgnoreUrlTeams(true);
    setUrlTeamAId("");
    setUrlTeamBId("");
    setMaxStageReached(undefined);
    applyTeamRound(next, teamRound);
  }

  const teamAIdRef = useRef(teamAId);
  const teamBIdRef = useRef(teamBId);
  teamAIdRef.current = teamAId;
  teamBIdRef.current = teamBId;

  useEffect(() => {
    if (!rawComparison) return;

    setEntries(rawComparison.comparison);
    setTeamCounts(rawComparison.teamCounts);
    setCohortStage(rawComparison.cohortStage);
    setCohortSize(rawComparison.cohortSize);
    setMaxStageReached(rawComparison.maxStageReached);

    // Only clamp from a fresh response — never re-clamp when teamRound alone
    // changes against stale data that still reflects the previous pair.
    const reached = rawComparison.maxStageReached;
    const currentRound = teamRoundRef.current;
    const hasTeam = Boolean(teamAIdRef.current || teamBIdRef.current);
    if (
      hasTeam &&
      reached &&
      stageIndex(currentRound) > stageIndex(reached)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync round to team reach
      applyTeamRound(reached, currentRound);
    }
  }, [rawComparison]);

  function handleStagesChange(next: Set<PathStage>) {
    setStages(next);
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
