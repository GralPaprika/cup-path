"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ComparisonEntry, PathStage, Team } from "@/lib/types";
import {
  clampPathStages,
  getFurthestStage,
  isStageWithinReach,
  parsePathStages,
  parseTeamRound,
  syncTeamRoundToStages,
} from "@/lib/domain/match-stages";
import { RankingModeToggle } from "@/components/ranking-mode-toggle";
import {
  PathStageFilters,
  serializePathStages,
} from "@/components/path-stage-filters";
import { TeamRoundSelector } from "@/components/team-round-selector";
import { ComparisonTable } from "@/components/comparison-table";
import { TeamHeadToHeadPanel } from "@/components/team-head-to-head-panel";
import { CompareLoadingSkeleton } from "@/components/loading-skeletons";
import { useSyncedRankingMode } from "@/hooks/use-synced-ranking-mode";
import { useTranslations } from "next-intl";

export function ComparePageClient() {
  const t = useTranslations("common");
  const compare = useTranslations("compare");
  const searchParams = useSearchParams();
  const initialTeamA = searchParams.get("team")?.toUpperCase() ?? "";
  const initialTeamB = searchParams.get("vs")?.toUpperCase() ?? "";
  const initialStages = parsePathStages(searchParams.get("stages"));
  const initialTeamRound = syncTeamRoundToStages(
    parseTeamRound(searchParams.get("teamRound")),
    initialStages,
  );

  const [mode, setMode] = useSyncedRankingMode(searchParams);
  const [stages, setStages] = useState<Set<PathStage>>(initialStages);
  const [teamRound, setTeamRound] = useState<PathStage>(initialTeamRound);
  const [teamAId, setTeamAId] = useState(initialTeamA);
  const [teamBId, setTeamBId] = useState(initialTeamB);
  const [teamList, setTeamList] = useState<Team[]>([]);
  const [entries, setEntries] = useState<ComparisonEntry[]>([]);
  const [cohortStage, setCohortStage] = useState<PathStage>("group");
  const [cohortSize, setCohortSize] = useState(48);
  const [maxStageReached, setMaxStageReached] = useState<PathStage | undefined>();
  const [teamCounts, setTeamCounts] = useState<Record<PathStage, number> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/teams?mode=${mode}`)
      .then((res) => res.json())
      .then((json: { teams: Team[] }) => setTeamList(json.teams))
      .catch(() => setTeamList([]));
  }, [mode]);

  const loadComparison = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        mode,
        stages: serializePathStages(stages),
        teamRound,
      });

      const response = await fetch(`/api/comparison?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load comparison");
      const json = (await response.json()) as {
        comparison: ComparisonEntry[];
        teamCounts: Record<PathStage, number>;
        cohortStage: PathStage;
        cohortSize: number;
        maxStageReached?: PathStage;
        teamRound: PathStage;
      };

      if (
        json.maxStageReached &&
        [...stages].some((stage) => !isStageWithinReach(stage, json.maxStageReached!))
      ) {
        setStages(clampPathStages(stages, json.maxStageReached));
        return;
      }

      const syncedTeamRound = syncTeamRoundToStages(json.teamRound, stages);
      if (syncedTeamRound !== teamRound || json.teamRound !== syncedTeamRound) {
        setTeamRound(syncedTeamRound);
        return;
      }

      setEntries(json.comparison);
      setTeamCounts(json.teamCounts);
      setCohortStage(json.cohortStage);
      setCohortSize(json.cohortSize);
      setMaxStageReached(json.maxStageReached);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }, [mode, stages, teamRound, t]);

  function handleStagesChange(next: Set<PathStage>) {
    setStages(next);
    setTeamRound((current) => syncTeamRoundToStages(current, next));
  }

  function handleTeamRoundChange(next: PathStage) {
    setTeamRound(syncTeamRoundToStages(next, stages));
  }

  const minTeamRound = getFurthestStage(stages);

  useEffect(() => {
    loadComparison();
  }, [loadComparison]);

  useEffect(() => {
    setMaxStageReached(undefined);
  }, [teamAId, teamBId]);

  useEffect(() => {
    const params = new URLSearchParams({
      mode,
      stages: serializePathStages(stages),
      teamRound,
    });
    if (teamAId) params.set("team", teamAId);
    if (teamBId) params.set("vs", teamBId);
    window.history.replaceState(null, "", `/compare?${params.toString()}`);
  }, [mode, stages, teamRound, teamAId, teamBId]);

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
        <section className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {compare("rankingSnapshot")}
          </p>
          <RankingModeToggle value={mode} onChange={setMode} variant="compact" />
        </section>

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
