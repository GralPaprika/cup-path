"use client";

import { Suspense, useState } from "react";
import type { Team } from "@/lib/types";
import { BracketTree } from "@/components/bracket/bracket-tree";
import { GroupFinishEditor } from "@/components/groups/group-finish-editor";
import { TeamPathImpactPanel } from "@/components/team/team-path-impact-panel";
import {
  SimulatePendingWinnersAlert,
  SimulateScenarioActions,
} from "@/components/simulate/simulate-scenario-toolbar";
import { CollapsibleSection } from "@/components/shared/collapsible-section";
import {
  SimulateContentSkeleton,
  SimulatePageSkeleton,
} from "@/components/loading-skeletons";
import { usePageUrlParamsSync } from "@/hooks/use-page-url-params-sync";
import { useSimulationAnalysis } from "@/hooks/use-simulation-analysis";
import {
  SIMULATE_COLLAPSE_BRACKET_KEY,
  SIMULATE_COLLAPSE_GROUPS_KEY,
  SIMULATE_SECTION_IDS,
} from "@/lib/client/simulate-ui-preference";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

function SimulationPageContent({ teams }: { teams: Team[] }) {
  const t = useTranslations("simulate");
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

  function handleResetScenario() {
    setPickWinnersAlertDismissed(false);
    resetScenario();
  }

  usePageUrlParamsSync("/simulate");

  const showRefetchPulse = loading && Boolean(data);
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

      {error && (
        <div className="glass-panel mb-6 border-wc-red/30 bg-wc-red/10 p-6 text-wc-red">
          {error}
        </div>
      )}

      {loading && !data && <SimulateContentSkeleton />}

      {data && (
        <div
          className={cn(
            "space-y-6 transition-opacity duration-300",
            showRefetchPulse && "opacity-70",
          )}
        >
          {showRefetchPulse && (
            <div
              className="h-0.5 w-full overflow-hidden rounded-full bg-white/10"
              aria-hidden
            >
              <div className="h-full w-1/3 animate-pulse rounded-full bg-wc-sky/70" />
            </div>
          )}

          <div id={SIMULATE_SECTION_IDS.impact}>
            <TeamPathImpactPanel
              teams={teams}
              teamId={teamId}
              onTeamChange={(nextTeamId) => {
                setTeamId(nextTeamId);
                if (nextTeamId === comparisonTeamId) {
                  setComparisonTeamId("");
                }
              }}
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
          </div>

          <CollapsibleSection
            id={SIMULATE_SECTION_IDS.groups}
            title={t("groupFinishes")}
            subtitle={t("groupFinishesHint")}
            defaultOpen
            persistKey={SIMULATE_COLLAPSE_GROUPS_KEY}
          >
            <GroupFinishEditor
              embedded
              teams={teams}
              groupCards={data.groupCards}
              bestThirdRanking={data.bestThirdRanking}
              focusTeamId={teamId}
              onSwapPositions={handleSwapGroupPositions}
              onSortByPoints={handleSortGroupsByPoints}
            />
          </CollapsibleSection>

          <CollapsibleSection
            id={SIMULATE_SECTION_IDS.bracket}
            title={t("knockoutBracket")}
            subtitle={t("bracketHint")}
            defaultOpen={false}
            persistKey={SIMULATE_COLLAPSE_BRACKET_KEY}
          >
            <BracketTree
              embedded
              matches={data.bracket}
              teams={teams}
              scenarioWinners={scenario.knockoutWinners ?? {}}
              actualWinnersByMatchNum={data.actualWinnersByMatchNum}
              affectedMatchNums={data.affectedMatchNums}
              changedMatchNums={data.changedMatchNums}
              pendingWinnerMatchNums={data.pendingWinnerMatchNums}
              focusTeamId={teamId}
              focusTeamMatchNums={data.focusTeamMatchNums}
              onSelectWinner={handleSelectWinner}
              actions={
                <SimulateScenarioActions
                  hasOverrides={hasOverrides}
                  pendingWinnerCount={data.pendingWinnerMatchNums.length}
                  showPickAllStrongest={data.canPickAllStrongestWinners}
                  showPickSimulatedStrongest={
                    data.canPickSimulatedStrongestWinners
                  }
                  onReset={handleResetScenario}
                  onPickAllStrongest={() => pickStrongestWinners("all")}
                  onPickSimulatedStrongest={() =>
                    pickStrongestWinners("simulated")
                  }
                />
              }
            />
          </CollapsibleSection>

          <SimulatePendingWinnersAlert
            count={data.pendingWinnerMatchNums.length}
            visible={!pickWinnersAlertDismissed}
            onDismiss={() => setPickWinnersAlertDismissed(true)}
          />
        </div>
      )}
    </div>
  );
}

export function SimulationPageClient({ teams }: { teams: Team[] }) {
  return (
    <Suspense fallback={<SimulatePageSkeleton />}>
      <SimulationPageContent teams={teams} />
    </Suspense>
  );
}
