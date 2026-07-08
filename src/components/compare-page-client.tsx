"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ComparisonEntry, RankingMode } from "@/lib/types";
import { RankingModeToggle } from "@/components/ranking-mode-toggle";
import { ComparisonChart } from "@/components/comparison-chart";
import { CompareLoadingSkeleton } from "@/components/loading-skeletons";
import { useTranslations } from "next-intl";

export function ComparePageClient() {
  const t = useTranslations("common");
  const compare = useTranslations("compare");
  const searchParams = useSearchParams();
  const selectedTeamId = searchParams.get("team")?.toUpperCase();
  const initialMode = (searchParams.get("mode") as RankingMode) ?? "live";

  const [mode, setMode] = useState<RankingMode>(initialMode);
  const [entries, setEntries] = useState<ComparisonEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComparison = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ mode });
      if (selectedTeamId) params.set("team", selectedTeamId);

      const response = await fetch(`/api/comparison?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load comparison");
      const json = (await response.json()) as { comparison: ComparisonEntry[] };
      setEntries(json.comparison);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }, [mode, selectedTeamId, t]);

  useEffect(() => {
    loadComparison();
  }, [loadComparison]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8">
      <section className="rounded-2xl border border-emerald-200/60 bg-white/80 p-6 shadow-sm backdrop-blur">
        <h1 className="text-3xl font-bold tracking-tight text-emerald-950">
          {compare("title")}
        </h1>
        <p className="mt-2 text-muted-foreground">{compare("subtitle")}</p>
      </section>

      <div className="rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur">
        <RankingModeToggle value={mode} onChange={setMode} />
      </div>

      {!selectedTeamId && (
        <p className="text-sm text-muted-foreground">{compare("selectTeamHint")}</p>
      )}
      {loading && !error && (
        <CompareLoadingSkeleton showDelta={Boolean(selectedTeamId)} />
      )}
      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-destructive">
          {error}
        </div>
      )}
      {!loading && !error && (
        <ComparisonChart
          entries={entries}
          selectedTeamId={selectedTeamId}
          showDelta={Boolean(selectedTeamId)}
        />
      )}
    </div>
  );
}
