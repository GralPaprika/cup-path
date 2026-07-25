"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { parseSelectedGroupLetter } from "@/lib/client/group-selection";
import { GroupsView } from "@/components/groups-view";
import { ComparisonGroupsSkeleton } from "@/components/loading-skeletons";
import { useRankingMode } from "@/components/layout/ranking-mode-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import { usePageUrlParamsSync } from "@/hooks/use-page-url-params-sync";
import type { GroupsAnalysisResult } from "@/lib/api/responses";
import { useTranslations } from "next-intl";

const EMPTY_GROUP_CARDS: GroupsAnalysisResult["groups"] = [];

export function GroupsPageClient() {
  const t = useTranslations("common");
  const groupsT = useTranslations("groups");
  const searchParams = useSearchParams();
  const selectedTeamId = searchParams.get("team")?.toUpperCase() ?? null;
  const urlGroup = searchParams.get("group")?.toUpperCase() ?? null;

  const { mode } = useRankingMode();
  const [userGroupLetter, setUserGroupLetter] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [detailScrollTrigger, setDetailScrollTrigger] = useState(0);
  const deepLinkScrollPending = useRef(Boolean(selectedTeamId));

  const {
    data: groupsData,
    loading,
    error,
  } = useApiQuery<GroupsAnalysisResult>("/api/groups", [mode], {
    errorMessage: t("error"),
  });

  const groupCards = groupsData?.groups ?? EMPTY_GROUP_CARDS;
  const groupsReady = groupCards.length > 0;
  const strengthOrdering = groupsData?.strengthOrdering;
  const pointsBenchmarks = groupsData?.pointsBenchmarks ?? null;

  // Resolve from loaded data during render so URL sync never sees a stale default.
  const selectedGroupLetter = groupsReady
    ? (userGroupLetter ??
      parseSelectedGroupLetter(urlGroup, groupCards, selectedTeamId ?? undefined))
    : (urlGroup || "A");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clear manual pick on deep-link/mode change
    setUserGroupLetter(null);
    deepLinkScrollPending.current = Boolean(selectedTeamId);
  }, [selectedTeamId, mode]);

  useEffect(() => {
    if (!deepLinkScrollPending.current || groupCards.length === 0) return;
    deepLinkScrollPending.current = false;
    setDetailScrollTrigger((count) => count + 1);
  }, [groupCards.length]);

  usePageUrlParamsSync(
    "/groups",
    () => {
      const params = new URLSearchParams({ group: selectedGroupLetter });
      if (selectedTeamId) params.set("team", selectedTeamId);
      return params;
    },
    [selectedGroupLetter, selectedTeamId, groupCards.length],
    ["group", "team"],
    groupsReady,
  );

  function handleSelectGroup(groupLetter: string) {
    setUserGroupLetter(groupLetter);
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
