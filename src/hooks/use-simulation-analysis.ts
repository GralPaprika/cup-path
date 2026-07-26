"use client";

import { useEffect, useMemo, useState } from "react";
import type { SimulationResult, SimulationScenario, Team } from "@/lib/types";
import { useRankingMode } from "@/components/layout/ranking-mode-provider";
import {
  compactGroupFinishes,
  groupFinishesDifferFromBaseline,
  swapGroupPositions,
  type GroupFinishMap,
  type GroupFinishPosition,
} from "@/lib/domain/group/group-finish-swap";
import { sortGroupFinishesByFifaPoints } from "@/lib/domain/group/group-finish-sort";
import { emptySimulationScenario } from "@/lib/domain/core/simulation-scenario";
import { isKnockoutWinnerOverride } from "@/lib/domain/bracket/bracket-resolver";
import {
  clearSimulationScenarioPreference,
  readSimulationScenarioPreference,
  writeSimulationScenarioPreference,
} from "@/lib/client/simulation-scenario-preference";
import { useApiQuery } from "@/hooks/use-api-query";
import { useUrlParamState } from "@/hooks/use-url-param-state";
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

export function useSimulationAnalysis(teams: Team[]) {
  const common = useTranslations("common");
  const { mode } = useRankingMode();
  const [teamId, setTeamId] = useUrlParamState(
    "/simulate",
    "team",
    "ESP",
  );
  const [comparisonTeamId, setComparisonTeamId] = useUrlParamState(
    "/simulate",
    "compareTeam",
  );
  const [scenario, setScenario] = useState<SimulationScenario>(
    emptySimulationScenario,
  );
  const [scenarioHydrated, setScenarioHydrated] = useState(false);

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- preference hydration
    setScenario(readSimulationScenarioPreference());
    setScenarioHydrated(true);
  }, []);

  useEffect(() => {
    if (!scenarioHydrated) return;
    writeSimulationScenarioPreference(scenario);
  }, [scenario, scenarioHydrated]);

  function handleSelectWinner(matchNum: number, winnerId: string) {
    setScenario((current) => {
      const actualWinner = data?.actualWinnersByMatchNum?.[matchNum] ?? null;
      const nextWinners = { ...(current.knockoutWinners ?? {}) };
      const bracketMatch = data?.bracket?.find((match) => match.num === matchNum);
      // Rematches after group edits must store any pick — including the
      // historical winner id (e.g. ARG on #100) — because that result no
      // longer applies to these sides.
      const playedResultSuppressed =
        (data?.affectedMatchNums ?? []).some(
          (num) => Number(num) === Number(matchNum),
        ) ||
        (data?.pendingWinnerMatchNums ?? []).some(
          (num) => Number(num) === Number(matchNum),
        ) ||
        Boolean(
          bracketMatch &&
            bracketMatch.isPlayed &&
            !bracketMatch.winnerTeamId &&
            bracketMatch.home.teamId &&
            bracketMatch.away.teamId,
        );

      if (
        !isKnockoutWinnerOverride(actualWinner, winnerId, {
          playedResultSuppressed,
        })
      ) {
        delete nextWinners[matchNum];
      } else {
        nextWinners[matchNum] = winnerId;
      }

      return {
        ...current,
        knockoutWinners: nextWinners,
      };
    });
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

  return {
    teamId,
    setTeamId,
    comparisonTeamId,
    setComparisonTeamId,
    scenario,
    data,
    loading,
    error,
    hasOverrides,
    handleSelectWinner,
    handleSwapGroupPositions,
    handleSortGroupsByPoints,
    resetScenario,
    pickStrongestWinners,
  };
}
