"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ComparisonEntry, RankingMode, Team, TeamPathSummary } from "@/lib/types";
import { RankingModeToggle } from "@/components/ranking-mode-toggle";
import { TeamSelector } from "@/components/team-selector";
import { SummaryCard } from "@/components/summary-card";
import { PathTable } from "@/components/path-table";
import { ComparisonChart } from "@/components/comparison-chart";
import { useTranslations } from "next-intl";

interface AnalysisResponse {
  summary: TeamPathSummary;
  hardestPathRank: number | null;
  comparison: ComparisonEntry[];
}

export function AnalysisPageClient({ teams }: { teams: Team[] }) {
  const t = useTranslations("common");
  const searchParams = useSearchParams();
  const initialTeam = searchParams.get("team")?.toUpperCase() ?? teams[0]?.id ?? "ARG";
  const initialMode = (searchParams.get("mode") as RankingMode) ?? "live";

  const [teamId, setTeamId] = useState(initialTeam);
  const [mode, setMode] = useState<RankingMode>(initialMode);
  const [teamList, setTeamList] = useState(teams);
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/teams?mode=${mode}`)
      .then((res) => res.json())
      .then((json: { teams: Team[] }) => setTeamList(json.teams))
      .catch(() => setTeamList(teams));
  }, [mode, teams]);

  const loadAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analysis?team=${teamId}&mode=${mode}`);
      if (!response.ok) throw new Error("Failed to load analysis");
      const json = (await response.json()) as AnalysisResponse;
      setData(json);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }, [teamId, mode, t]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  useEffect(() => {
    const params = new URLSearchParams({ team: teamId, mode });
    window.history.replaceState(null, "", `/?${params.toString()}`);
  }, [teamId, mode]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8">
      <section className="rounded-2xl border border-emerald-200/60 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          World Cup Path Analysis
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          See how tough each team&apos;s road to the final is, based on FIFA ranking
          points of every opponent faced.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
        <div className="space-y-6 rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur">
          <RankingModeToggle value={mode} onChange={setMode} />
          <TeamSelector teams={teamList} value={teamId} onChange={setTeamId} />
        </div>

        <div>
          {loading && (
            <div className="flex h-64 items-center justify-center rounded-2xl border bg-white/60">
              <p className="animate-pulse text-muted-foreground">{t("loading")}</p>
            </div>
          )}
          {error && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-destructive">
              {error}
            </div>
          )}
          {data && !loading && (
            <SummaryCard
              summary={data.summary}
              hardestPathRank={data.hardestPathRank}
            />
          )}
        </div>
      </div>

      {data && !loading && (
        <div className="space-y-8">
          <PathTable matches={data.summary.matches} />
          <ComparisonChart
            entries={data.comparison.slice(0, 12)}
            selectedTeamId={teamId}
            showDelta
          />
        </div>
      )}
    </div>
  );
}
