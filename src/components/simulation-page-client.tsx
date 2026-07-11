"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { SimulationResult, SimulationScenario, Team } from "@/lib/types";
import { RankingModeToggle } from "@/components/ranking-mode-toggle";
import { TeamSelector } from "@/components/team-selector";
import { BracketTree } from "@/components/bracket-tree";
import { GroupFinishEditor } from "@/components/group-finish-editor";
import { TeamPathImpactPanel } from "@/components/team-path-impact-panel";
import { swapGroupPositions } from "@/lib/domain/group-finish-swap";
import { useSyncedRankingMode } from "@/hooks/use-synced-ranking-mode";
import { useTranslations } from "next-intl";

type GroupFinishMap = Record<string, [string, string, string]>;

function compactGroupFinishes(
  finishes: GroupFinishMap,
  baseline: GroupFinishMap,
): GroupFinishMap | undefined {
  const diffs: GroupFinishMap = {};
  for (const [letter, ids] of Object.entries(finishes)) {
    const base = baseline[letter];
    if (!base) continue;
    if (ids[0] !== base[0] || ids[1] !== base[1] || ids[2] !== base[2]) {
      diffs[letter] = ids;
    }
  }
  return Object.keys(diffs).length > 0 ? diffs : undefined;
}

function scenarioHasOverrides(
  scenario: SimulationScenario,
  baseline?: GroupFinishMap,
): boolean {
  const hasWinners = Object.keys(scenario.knockoutWinners ?? {}).length > 0;
  if (hasWinners) return true;
  if (!scenario.groupFinishes || !baseline) return false;
  return compactGroupFinishes(scenario.groupFinishes, baseline) !== undefined;
}

export function SimulationPageClient({ teams }: { teams: Team[] }) {
  const searchParams = useSearchParams();
  const t = useTranslations("simulate");
  const common = useTranslations("common");
  const initialTeam =
    searchParams.get("team")?.toUpperCase() ?? teams[0]?.id ?? "ARG";

  const [mode, setMode] = useSyncedRankingMode(searchParams);
  const [teamId, setTeamId] = useState(initialTeam);
  const [scenario, setScenario] = useState<SimulationScenario>({
    knockoutWinners: {},
    slotOverrides: {},
  });
  const [data, setData] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSimulation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        mode,
        team: teamId,
        scenario: JSON.stringify(scenario),
      });
      const response = await fetch(`/api/simulation?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load simulation");
      const json = (await response.json()) as SimulationResult;
      setData(json);
    } catch {
      setError(common("error"));
    } finally {
      setLoading(false);
    }
  }, [mode, teamId, scenario, common]);

  useEffect(() => {
    loadSimulation();
  }, [loadSimulation]);

  useEffect(() => {
    const params = new URLSearchParams({ mode, team: teamId });
    if (scenarioHasOverrides(scenario, data?.baselineGroupFinishes)) {
      params.set("scenario", JSON.stringify(scenario));
    }
    window.history.replaceState(null, "", `/simulate?${params.toString()}`);
  }, [mode, teamId, scenario, data?.baselineGroupFinishes]);

  function handleSelectWinner(matchNum: number, winnerId: string) {
    setScenario((current) => ({
      ...current,
      knockoutWinners: {
        ...current.knockoutWinners,
        [matchNum]: winnerId,
      },
    }));
  }

  function handleSwapGroupPositions(
    groupLetter: string,
    positionA: 1 | 2 | 3,
    positionB: 1 | 2 | 3,
  ) {
    setScenario((current) => {
      const baseline = data?.baselineGroupFinishes ?? {};
      const merged = { ...baseline, ...current.groupFinishes };
      const swapped = swapGroupPositions(
        merged,
        groupLetter,
        positionA,
        positionB,
      );
      return {
        ...current,
        groupFinishes: compactGroupFinishes(swapped, baseline),
      };
    });
  }

  function resetScenario() {
    setScenario({ knockoutWinners: {}, slotOverrides: {} });
  }

  const hasOverrides = scenarioHasOverrides(
    scenario,
    data?.baselineGroupFinishes,
  );

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground sm:text-base">
          {t("subtitle")}
        </p>
      </header>

      <div className="glass-panel mb-6 space-y-6 p-5 sm:p-6">
        <section className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {t("rankingSnapshot")}
          </p>
          <RankingModeToggle value={mode} onChange={setMode} variant="compact" />
        </section>
        <TeamSelector teams={teams} value={teamId} onChange={setTeamId} />
      </div>

      {error && (
        <div className="glass-panel mb-6 border-wc-red/30 bg-wc-red/10 p-6 text-wc-red">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="glass-panel p-8 text-center text-muted-foreground">
          {common("loading")}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <TeamPathImpactPanel
            teams={teams}
            actualSummary={data.actualSummary}
            simulatedSummary={data.simulatedSummary}
            actualAvgPointsContext={data.actualAvgPointsContext}
            simulatedAvgPointsContext={data.simulatedAvgPointsContext}
            pathDiff={data.pathDiff}
            hasOverrides={hasOverrides}
            onReset={resetScenario}
          />

          <GroupFinishEditor
            teams={teams}
            groupCards={data.groupCards}
            focusTeamId={teamId}
            onSwapPositions={handleSwapGroupPositions}
          />

          <div className="glass-panel p-5 sm:p-6">
            <BracketTree
              matches={data.bracket}
              teams={teams}
              scenarioWinners={scenario.knockoutWinners ?? {}}
              changedMatchNums={data.changedMatchNums}
              focusTeamId={teamId}
              focusTeamMatchNums={data.focusTeamMatchNums}
              onSelectWinner={handleSelectWinner}
            />
          </div>
        </div>
      )}
    </div>
  );
}
