"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import type { SimulationResult, SimulationScenario, Team } from "@/lib/types";
import { RankingModeToggle } from "@/components/ranking-mode-toggle";
import { TeamSelector } from "@/components/team-selector";
import { BracketTree } from "@/components/bracket-tree";
import { GroupFinishEditor } from "@/components/group-finish-editor";
import { TeamPathImpactPanel } from "@/components/team-path-impact-panel";
import { PageShellSkeleton } from "@/components/loading-skeletons";
import {
  compactGroupFinishes,
  groupFinishesDifferFromBaseline,
  swapGroupPositions,
  type GroupFinishMap,
  type GroupFinishPosition,
} from "@/lib/domain/group-finish-swap";
import { sortGroupFinishesByFifaPoints } from "@/lib/domain/group-finish-sort";
import { emptySimulationScenario } from "@/lib/domain/simulation-scenario";
import {
  clearSimulationScenarioPreference,
  readSimulationScenarioPreference,
  writeSimulationScenarioPreference,
} from "@/lib/client/simulation-scenario-preference";
import { useApiQuery } from "@/hooks/use-api-query";
import { useUrlParamsSync } from "@/hooks/use-url-params-sync";
import { useSyncedRankingMode } from "@/hooks/use-synced-ranking-mode";
import { useTranslations } from "next-intl";

function scenarioHasOverrides(
  scenario: SimulationScenario,
  baseline?: GroupFinishMap,
): boolean {
  const hasWinners = Object.keys(scenario.knockoutWinners ?? {}).length > 0;
  if (hasWinners) return true;
  if (!scenario.groupFinishes || !baseline) return false;
  return groupFinishesDifferFromBaseline(scenario.groupFinishes, baseline);
}

function FixedResetButton({ onReset }: { onReset: () => void }) {
  const t = useTranslations("simulate");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed right-4 z-40 top-[calc(var(--site-header-height,4.0625rem)+0.75rem)] sm:right-6">
      <button
        type="button"
        onClick={onReset}
        className="pointer-events-auto rounded-lg border border-white/15 bg-[#120818]/95 px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-lg backdrop-blur-sm transition-colors hover:border-white/25 hover:text-white"
      >
        {t("reset")}
      </button>
    </div>,
    document.body,
  );
}

function PickWinnersAlert({
  matchCount,
  onDismiss,
}: {
  matchCount: number;
  onDismiss: () => void;
}) {
  const t = useTranslations("simulate");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timer);
  }, [matchCount, onDismiss]);

  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-end sm:inset-x-auto sm:right-4">
      <div
        role="status"
        className="pointer-events-auto relative max-w-xs rounded-lg border border-wc-purple/40 bg-[#120818]/95 px-4 py-3 pr-10 shadow-lg backdrop-blur-sm"
      >
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t("pickWinnersAlertDismiss")}
          className="absolute right-2 top-2 rounded p-0.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
        >
          <span aria-hidden className="text-sm leading-none">
            ×
          </span>
        </button>
        <p className="text-sm font-medium text-wc-purple">
          {t("pickWinnersAlertTitle")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("pickWinnersAlertBody", { count: matchCount })}
        </p>
      </div>
    </div>,
    document.body,
  );
}

function SimulationPageContent({ teams }: { teams: Team[] }) {
  const searchParams = useSearchParams();
  const t = useTranslations("simulate");
  const common = useTranslations("common");
  const initialTeam =
    searchParams.get("team")?.toUpperCase() ?? teams[0]?.id ?? "ARG";
  const initialComparisonTeam =
    searchParams.get("compareTeam")?.toUpperCase() ?? "";

  const [mode, setMode] = useSyncedRankingMode(searchParams);
  const [teamId, setTeamId] = useState(initialTeam);
  const [comparisonTeamId, setComparisonTeamId] = useState(initialComparisonTeam);
  const [scenario, setScenario] = useState<SimulationScenario>(
    emptySimulationScenario,
  );
  const [scenarioHydrated, setScenarioHydrated] = useState(false);
  const [pickWinnersAlertDismissed, setPickWinnersAlertDismissed] =
    useState(false);

  const simulationBody = useMemo(
    () => ({
      mode,
      team: teamId,
      compareTeam: comparisonTeamId || undefined,
      scenario,
    }),
    [mode, teamId, comparisonTeamId, scenario],
  );

  const {
    data,
    loading,
    error,
  } = useApiQuery<SimulationResult>(
    "/api/simulation",
    [mode, teamId, comparisonTeamId, scenario, scenarioHydrated],
    {
      enabled: scenarioHydrated,
      method: "POST",
      body: simulationBody,
      errorMessage: common("error"),
    },
  );

  const pendingWinnersKey = data?.pendingWinnerMatchNums.join(",") ?? "";

  useEffect(() => {
    setPickWinnersAlertDismissed(false);
  }, [pendingWinnersKey]);

  useEffect(() => {
    setScenario(readSimulationScenarioPreference());
    setScenarioHydrated(true);
  }, []);

  useEffect(() => {
    if (!scenarioHydrated) return;
    writeSimulationScenarioPreference(scenario);
  }, [scenario, scenarioHydrated]);

  useUrlParamsSync(
    "/simulate",
    () => {
      const params = new URLSearchParams({ mode, team: teamId });
      if (comparisonTeamId) {
        params.set("compareTeam", comparisonTeamId);
      }
      return params;
    },
    [mode, teamId, comparisonTeamId],
  );

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
    positionA: GroupFinishPosition,
    positionB: GroupFinishPosition,
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
        knockoutWinners: {},
      };
    });
  }

  function handleSortGroupsByPoints() {
    setScenario((current) => {
      const baseline = data?.baselineGroupFinishes ?? {};
      const merged = { ...baseline, ...current.groupFinishes };
      const sorted = sortGroupFinishesByFifaPoints(
        merged,
        data?.teamRankings ?? {},
      );
      return {
        ...current,
        groupFinishes: compactGroupFinishes(sorted, baseline),
        knockoutWinners: {},
      };
    });
  }

  function resetScenario() {
    const empty = emptySimulationScenario();
    setScenario(empty);
    clearSimulationScenarioPreference();
  }

  function pickStrongestWinners(scope: "all" | "simulated") {
    if (!data) return;

    void (async () => {
      try {
        const response = await fetch("/api/simulation/strongest-winners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode, scenario, scope }),
        });
        if (!response.ok) return;

        const json = (await response.json()) as {
          knockoutWinners: Record<number, string> | null;
        };
        if (!json.knockoutWinners) return;

        setScenario((current) => ({
          ...current,
          knockoutWinners: json.knockoutWinners ?? {},
        }));
      } catch {
        // ignore
      }
    })();
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
            comparisonSummary={data.comparisonActualSummary}
            comparisonAvgPointsContext={data.comparisonAvgPointsContext}
            comparisonTeamId={comparisonTeamId}
            onComparisonTeamChange={setComparisonTeamId}
            pathDiff={data.pathDiff}
            hasOverrides={hasOverrides}
            actualPathChart={data.actualPathChart}
            simulatedPathChart={data.simulatedPathChart}
            comparisonPathChart={data.comparisonPathChart}
          />

          <GroupFinishEditor
            teams={teams}
            groupCards={data.groupCards}
            bestThirdRanking={data.bestThirdRanking}
            focusTeamId={teamId}
            onSwapPositions={handleSwapGroupPositions}
            onSortByPoints={handleSortGroupsByPoints}
          />

          <div className="glass-panel p-5 sm:p-6">
            <BracketTree
              matches={data.bracket}
              teams={teams}
              scenarioWinners={scenario.knockoutWinners ?? {}}
              changedMatchNums={data.changedMatchNums}
              pendingWinnerMatchNums={data.pendingWinnerMatchNums}
              focusTeamId={teamId}
              focusTeamMatchNums={data.focusTeamMatchNums}
              onSelectWinner={handleSelectWinner}
              showPickAllStrongest={data.canPickAllStrongestWinners}
              showPickSimulatedStrongest={data.canPickSimulatedStrongestWinners}
              onPickAllStrongest={() => pickStrongestWinners("all")}
              onPickSimulatedStrongest={() => pickStrongestWinners("simulated")}
            />
          </div>
        </div>
      )}

      {hasOverrides && <FixedResetButton onReset={resetScenario} />}

      {data &&
        data.pendingWinnerMatchNums.length > 0 &&
        !pickWinnersAlertDismissed && (
          <PickWinnersAlert
            matchCount={data.pendingWinnerMatchNums.length}
            onDismiss={() => setPickWinnersAlertDismissed(true)}
          />
        )}
    </div>
  );
}

export function SimulationPageClient({ teams }: { teams: Team[] }) {
  return (
    <Suspense fallback={<PageShellSkeleton />}>
      <SimulationPageContent teams={teams} />
    </Suspense>
  );
}
