"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ComparisonEntry, PathStage, RankingMode } from "@/lib/types";
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
import { CompareLoadingSkeleton } from "@/components/loading-skeletons";
import { useTranslations } from "next-intl";

export function ComparePageClient() {
  const t = useTranslations("common");
  const compare = useTranslations("compare");
  const searchParams = useSearchParams();
  const selectedTeamId = searchParams.get("team")?.toUpperCase();
  const initialMode = (searchParams.get("mode") as RankingMode) ?? "live";
  const initialStages = parsePathStages(searchParams.get("stages"));
  const initialTeamRound = syncTeamRoundToStages(
    parseTeamRound(searchParams.get("teamRound")),
    initialStages,
  );

  const [mode, setMode] = useState<RankingMode>(initialMode);
  const [stages, setStages] = useState<Set<PathStage>>(initialStages);
  const [teamRound, setTeamRound] = useState<PathStage>(initialTeamRound);
  const [entries, setEntries] = useState<ComparisonEntry[]>([]);
  const [cohortStage, setCohortStage] = useState<PathStage>("group");
  const [cohortSize, setCohortSize] = useState(48);
  const [maxStageReached, setMaxStageReached] = useState<PathStage | undefined>();
  const [teamCounts, setTeamCounts] = useState<Record<PathStage, number> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComparison = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        mode,
        stages: serializePathStages(stages),
        teamRound,
      });
      if (selectedTeamId) params.set("team", selectedTeamId);

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
  }, [mode, selectedTeamId, stages, teamRound, t]);

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
  }, [selectedTeamId]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="overflow-hidden rounded-2xl border border-emerald-200/70 bg-white shadow-lg shadow-emerald-950/5">
        <div className="border-b bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 px-6 py-6 text-white">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {compare("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-emerald-100/90 sm:text-base">
            {compare("subtitle")}
          </p>
        </div>

        <div className="space-y-6 border-b bg-gradient-to-b from-emerald-50/80 to-white px-4 py-5 sm:px-6">
          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {compare("rankingSnapshot")}
            </p>
            <RankingModeToggle
              value={mode}
              onChange={setMode}
              variant="compact"
            />
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
              <TeamRoundSelector
                value={teamRound}
                onChange={handleTeamRoundChange}
                teamCount={teamCounts?.[teamRound]}
                minStage={minTeamRound}
              />
            </section>
            <section className="rounded-xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
              <PathStageFilters
                value={stages}
                onChange={handleStagesChange}
                maxStageReached={maxStageReached}
              />
            </section>
          </div>

          {!selectedTeamId && (
            <p className="text-sm text-muted-foreground">
              {compare("selectTeamHint")}
            </p>
          )}
        </div>

        {loading && !error && (
          <CompareLoadingSkeleton
            embedded
            showDelta={Boolean(selectedTeamId)}
          />
        )}
        {error && (
          <div className="m-4 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-destructive sm:m-6">
            {error}
          </div>
        )}
        {!loading && !error && (
          <ComparisonTable
            entries={entries}
            mode={mode}
            selectedTeamId={selectedTeamId}
            showDelta={Boolean(selectedTeamId)}
            cohortStage={cohortStage}
            cohortSize={cohortSize}
            embedded
          />
        )}
      </div>
    </div>
  );
}
