"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { GroupComparisonCard } from "@/lib/types";
import { parseSelectedGroupLetter } from "@/components/group-detail-panel";
import { RankingModeToggle } from "@/components/ranking-mode-toggle";
import { GroupsView } from "@/components/groups-view";
import { ComparisonGroupsSkeleton } from "@/components/loading-skeletons";
import { useSyncedRankingMode } from "@/hooks/use-synced-ranking-mode";
import { useTranslations } from "next-intl";

export function GroupsPageClient() {
  const t = useTranslations("common");
  const groupsT = useTranslations("groups");
  const searchParams = useSearchParams();
  const selectedTeamId = searchParams.get("team")?.toUpperCase() ?? null;
  const urlGroup = searchParams.get("group")?.toUpperCase() ?? null;

  const [mode, setMode] = useSyncedRankingMode(searchParams);
  const [groupCards, setGroupCards] = useState<GroupComparisonCard[]>([]);
  const [selectedGroupLetter, setSelectedGroupLetter] = useState("A");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userPickedGroup = useRef(false);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ mode });
      if (selectedTeamId) params.set("team", selectedTeamId);

      const response = await fetch(`/api/groups?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load groups");
      const json = (await response.json()) as {
        groups: GroupComparisonCard[];
      };

      setGroupCards(json.groups);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }, [mode, selectedTeamId, t]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    userPickedGroup.current = false;
  }, [selectedTeamId, mode]);

  useEffect(() => {
    if (groupCards.length === 0 || userPickedGroup.current) return;

    setSelectedGroupLetter(
      parseSelectedGroupLetter(urlGroup, groupCards, selectedTeamId ?? undefined),
    );
  }, [groupCards, urlGroup, selectedTeamId]);

  useEffect(() => {
    if (groupCards.length === 0) return;

    const params = new URLSearchParams({ mode, group: selectedGroupLetter });
    if (selectedTeamId) params.set("team", selectedTeamId);
    const nextUrl = `/groups?${params.toString()}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (currentUrl !== nextUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [mode, selectedGroupLetter, selectedTeamId, groupCards.length]);

  function handleSelectGroup(groupLetter: string) {
    userPickedGroup.current = true;
    setSelectedGroupLetter(groupLetter);
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
        {loading && !error && <ComparisonGroupsSkeleton />}
        {error && (
          <div className="rounded-xl border border-wc-red/30 bg-wc-red/10 p-6 text-wc-red">
            {error}
          </div>
        )}
        {!loading && !error && (
          <GroupsView
            groups={groupCards}
            mode={mode}
            selectedGroupLetter={selectedGroupLetter}
            onSelectGroup={handleSelectGroup}
            selectedTeamId={selectedTeamId ?? undefined}
          />
        )}
      </div>
    </div>
  );
}
