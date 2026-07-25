"use client";

import { Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Team } from "@/lib/types";
import { TeamSelector } from "@/components/team/team-selector";
import { BracketTree } from "@/components/bracket/bracket-tree";
import { GroupFinishEditor } from "@/components/groups/group-finish-editor";
import { TeamPathImpactPanel } from "@/components/team/team-path-impact-panel";
import { PageShellSkeleton } from "@/components/loading-skeletons";
import { usePageUrlParamsSync } from "@/hooks/use-page-url-params-sync";
import { useSimulationAnalysis } from "@/hooks/use-simulation-analysis";
import { useTranslations } from "next-intl";

function FixedResetButton({ onReset }: { onReset: () => void }) {
  const t = useTranslations("simulate");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- portal mount gate
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- portal mount gate
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
  const t = useTranslations("simulate");
  const common = useTranslations("common");
  const {
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
  } = useSimulationAnalysis(teams);

  const [pickWinnersAlertDismissed, setPickWinnersAlertDismissed] =
    useState(false);
  const pendingWinnersKey = data?.pendingWinnerMatchNums.join(",") ?? "";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- re-show alert when pending set changes
    setPickWinnersAlertDismissed(false);
  }, [pendingWinnersKey]);

  usePageUrlParamsSync("/simulate");

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

      <div className="glass-panel mb-6 p-5 sm:p-6">
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
