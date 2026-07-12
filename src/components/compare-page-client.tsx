"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ComparisonEntry, PathStage, Team } from "@/lib/types";
import {
  clampPathStages,
  getFurthestStage,
  isStageWithinReach,
  parseTeamRound,
  stagesThrough,
  syncTeamRoundToStages,
} from "@/lib/domain/match-stages";
import {
  PathStageFilters,
  serializePathStages,
} from "@/components/path-stage-filters";
import { TeamRoundSelector } from "@/components/team-round-selector";
import { ComparisonTable } from "@/components/comparison-table";
import { TeamHeadToHeadPanel } from "@/components/team-head-to-head-panel";
import { CompareLoadingSkeleton } from "@/components/loading-skeletons";
import { useRankingMode } from "@/components/ranking-mode-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import { useRankingModeUrlSync } from "@/hooks/use-ranking-mode-url-sync";
import { usePersistedPathStages } from "@/hooks/use-persisted-path-stages";
import {
  readInitialTeamRound,
  writeTeamRoundPreference,
} from "@/lib/client/team-round-preference";
import type { ComparisonAnalysisResult, TeamsResponse } from "@/lib/api/responses";
import { useTranslations } from "next-intl";

export function ComparePageClient() {
  const t = useTranslations("common");
  const compare = useTranslations("compare");
  const searchParams = useSearchParams();
  const initialTeamA = searchParams.get("team")?.toUpperCase() ?? "";
  const initialTeamB = searchParams.get("vs")?.toUpperCase() ?? "";

  const { mode } = useRankingMode();
  const [stages, setStages, stagesHydrated] = usePersistedPathStages("compare");
  const [teamRound, setTeamRound] = useState<PathStage>(() => parseTeamRound(null));
  const [filtersHydrated, setFiltersHydrated] = useState(false);
  const [teamAId, setTeamAId] = useState(initialTeamA);
  const [teamBId, setTeamBId] = useState(initialTeamB);
  const [entries, setEntries] = useState<ComparisonEntry[]>([]);
  const [cohortStage, setCohortStage] = useState<PathStage>("group");
  const [cohortSize, setCohortSize] = useState(48);
  const [maxStageReached, setMaxStageReached] = useState<PathStage | undefined>();
  const [teamCounts, setTeamCounts] = useState<Record<PathStage, number> | null>(
    null,
  );

  const { data: teamsData } = useApiQuery<TeamsResponse>(
    `/api/teams?mode=${mode}`,
    [mode],
  );
  const teamList = teamsData?.teams ?? [];

  useEffect(() => {
    if (!stagesHydrated) return;
    setTeamRound(syncTeamRoundToStages(readInitialTeamRound("compare"), stages));
    setFiltersHydrated(true);
    // Hydrate team round once after stage preferences load from localStorage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagesHydrated]);

  const bothTeamsSelected =
    Boolean(teamAId) && Boolean(teamBId) && teamAId !== teamBId;

  const comparisonParams = new URLSearchParams({
    mode,
    stages: serializePathStages(stages),
    teamRound,
  });
  if (teamAId) comparisonParams.set("team", teamAId);
  if (bothTeamsSelected) comparisonParams.set("vs", teamBId);

  const {
    data: rawComparison,
    loading,
    error,
  } = useApiQuery<ComparisonAnalysisResult & { teamRound: PathStage }>(
    `/api/comparison?${comparisonParams.toString()}`,
    [mode, stages, teamRound, teamAId, teamBId, filtersHydrated],
    { errorMessage: t("error"), enabled: filtersHydrated },
  );

  useEffect(() => {
    if (!rawComparison) return;

    if (
      rawComparison.maxStageReached &&
      [...stages].some(
        (stage) => !isStageWithinReach(stage, rawComparison.maxStageReached!),
      )
    ) {
      setStages(clampPathStages(stages, rawComparison.maxStageReached));
      return;
    }

    const syncedTeamRound = syncTeamRoundToStages(
      rawComparison.teamRound,
      stages,
    );
    if (syncedTeamRound !== teamRound || rawComparison.teamRound !== syncedTeamRound) {
      setTeamRound(syncedTeamRound);
      return;
    }

    setEntries(rawComparison.comparison);
    setTeamCounts(rawComparison.teamCounts);
    setCohortStage(rawComparison.cohortStage);
    setCohortSize(rawComparison.cohortSize);
    setMaxStageReached(rawComparison.maxStageReached);
  }, [rawComparison, stages, teamRound]);

  function handleStagesChange(next: Set<PathStage>) {
    setStages(next);
    setTeamRound((current) => {
      const resolved = syncTeamRoundToStages(current, next);
      writeTeamRoundPreference("compare", resolved);
      return resolved;
    });
  }

  function handleTeamRoundChange(next: PathStage) {
    setTeamRound((current) => {
      const resolved = syncTeamRoundToStages(next, stages);
      if (resolved === current) return current;
      writeTeamRoundPreference("compare", resolved);
      return resolved;
    });
  }

  const minTeamRound = getFurthestStage(stages);

  useEffect(() => {
    if (!bothTeamsSelected || !maxStageReached) return;
    const sharedStages = stagesThrough(maxStageReached);
    setStages(sharedStages);
    setTeamRound((current) => {
      const resolved = syncTeamRoundToStages(current, sharedStages);
      writeTeamRoundPreference("compare", resolved);
      return resolved;
    });
  }, [bothTeamsSelected, maxStageReached, teamAId, teamBId, setStages]);

  useEffect(() => {
    if (bothTeamsSelected) return;
    setMaxStageReached(undefined);
  }, [bothTeamsSelected, teamAId, teamBId]);

  useRankingModeUrlSync(
    "/compare",
    () => {
      const params = new URLSearchParams();
      if (teamAId) params.set("team", teamAId);
      if (teamBId) params.set("vs", teamBId);
      return params;
    },
    [teamAId, teamBId],
  );

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
              minStage={minTeamRound}
            />
          </section>
          <section>
            <PathStageFilters
              value={stages}
              onChange={handleStagesChange}
              maxStageReached={maxStageReached}
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
                mode={mode}
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
