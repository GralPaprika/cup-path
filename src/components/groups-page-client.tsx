"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { GroupComparisonCard } from "@/lib/types";
import { RankingModeToggle } from "@/components/ranking-mode-toggle";
import { GroupsView } from "@/components/groups-view";
import { ComparisonGroupsSkeleton } from "@/components/loading-skeletons";
import { useSyncedRankingMode } from "@/hooks/use-synced-ranking-mode";
import { useTranslations } from "next-intl";

export function GroupsPageClient() {
  const t = useTranslations("common");
  const groups = useTranslations("groups");
  const searchParams = useSearchParams();
  const selectedTeamId = searchParams.get("team")?.toUpperCase();

  const [mode, setMode] = useSyncedRankingMode(searchParams);
  const [groupCards, setGroupCards] = useState<GroupComparisonCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const params = new URLSearchParams({ mode });
    if (selectedTeamId) params.set("team", selectedTeamId);
    window.history.replaceState(null, "", `/groups?${params.toString()}`);
  }, [mode, selectedTeamId]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          {groups("title")}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {groups("subtitle")}
        </p>
      </header>

      <div className="glass-panel mb-6 p-5 sm:p-6">
        <section className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {groups("rankingSnapshot")}
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
            selectedTeamId={selectedTeamId}
          />
        )}
      </div>
    </div>
  );
}
