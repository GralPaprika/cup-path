"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { parseSelectedGroupLetter } from "@/lib/client/group-selection";
import { RankingModeToggle } from "@/components/ranking-mode-toggle";
import { GroupsView } from "@/components/groups-view";
import { ComparisonGroupsSkeleton } from "@/components/loading-skeletons";
import { useApiQuery } from "@/hooks/use-api-query";
import { useUrlParamsSync } from "@/hooks/use-url-params-sync";
import { useSyncedRankingMode } from "@/hooks/use-synced-ranking-mode";
import type { GroupsAnalysisResult } from "@/lib/api/responses";
import { useTranslations } from "next-intl";

export function GroupsPageClient() {
  const t = useTranslations("common");
  const groupsT = useTranslations("groups");
  const searchParams = useSearchParams();
  const selectedTeamId = searchParams.get("team")?.toUpperCase() ?? null;
  const urlGroup = searchParams.get("group")?.toUpperCase() ?? null;

  const [mode, setMode] = useSyncedRankingMode(searchParams);
  const [selectedGroupLetter, setSelectedGroupLetter] = useState("A");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [detailScrollTrigger, setDetailScrollTrigger] = useState(0);
  const userPickedGroup = useRef(false);
  const deepLinkScrollPending = useRef(Boolean(selectedTeamId));

  const groupsUrl = `/api/groups?mode=${mode}`;
  const {
    data: groupsData,
    loading,
    error,
  } = useApiQuery<GroupsAnalysisResult>(groupsUrl, [mode], {
    errorMessage: t("error"),
  });

  const groupCards = groupsData?.groups ?? [];
  const strengthOrdering = groupsData?.strengthOrdering;
  const pointsBenchmarks = groupsData?.pointsBenchmarks ?? null;

  useEffect(() => {
    userPickedGroup.current = false;
    deepLinkScrollPending.current = Boolean(selectedTeamId);
  }, [selectedTeamId, mode]);

  useEffect(() => {
    if (!deepLinkScrollPending.current || groupCards.length === 0) return;
    deepLinkScrollPending.current = false;
    setDetailScrollTrigger((count) => count + 1);
  }, [groupCards.length]);

  useEffect(() => {
    if (groupCards.length === 0 || userPickedGroup.current) return;

    setSelectedGroupLetter(
      parseSelectedGroupLetter(urlGroup, groupCards, selectedTeamId ?? undefined),
    );
  }, [groupCards, urlGroup, selectedTeamId]);

  useUrlParamsSync(
    "/groups",
    () => {
      const params = new URLSearchParams({ mode, group: selectedGroupLetter });
      if (selectedTeamId) params.set("team", selectedTeamId);
      return params;
    },
    [mode, selectedGroupLetter, selectedTeamId, groupCards.length],
  );

  function handleSelectGroup(groupLetter: string) {
    userPickedGroup.current = true;
    setSelectedGroupLetter(groupLetter);
    setDetailScrollTrigger((count) => count + 1);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          {groupsT("title")}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {groupsT("subtitle")}
        </p>
      </header>

      <div className="glass-panel mb-6 p-5 sm:p-6">
        <section className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {groupsT("rankingSnapshot")}
          </p>
          <RankingModeToggle value={mode} onChange={setMode} variant="compact" />
        </section>
      </div>

      <div className="glass-panel p-5 sm:p-6">
        {loading && groupCards.length === 0 && !error && (
          <ComparisonGroupsSkeleton />
        )}
        {error && (
          <div className="rounded-xl border border-wc-red/30 bg-wc-red/10 p-6 text-wc-red">
            {error}
          </div>
        )}
        {groupCards.length > 0 && strengthOrdering && (
          <GroupsView
            groups={groupCards}
            strengthOrdering={strengthOrdering}
            pointsBenchmarks={pointsBenchmarks}
            selectedGroupLetter={selectedGroupLetter}
            onSelectGroup={handleSelectGroup}
            selectedTeamId={selectedTeamId ?? undefined}
            advancedOpen={advancedOpen}
            onAdvancedOpenChange={setAdvancedOpen}
            detailScrollTrigger={detailScrollTrigger}
          />
        )}
      </div>
    </div>
  );
}
