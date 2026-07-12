"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type {
  PathStage,
  TournamentFacts,
  TeamHighlightFact,
  UpsetMatchFact,
} from "@/lib/types";
import { GroupExpectedFinishesPanel } from "@/components/group-expected-finishes-panel";
import { RoundOf32Panel } from "@/components/round-of-32-panel";
import { RoundOf16Panel } from "@/components/round-of-16-panel";
import { PageShellSkeleton } from "@/components/loading-skeletons";
import { RankingModeToggle } from "@/components/ranking-mode-toggle";
import { TeamLabel } from "@/components/team-flag";
import { AvgPointsContextHint } from "@/components/avg-points-context";
import { useSyncedRankingMode } from "@/hooks/use-synced-ranking-mode";
import { formatFifaPoints, formatStatValue } from "@/lib/format";
import { getRoundDisplayName } from "@/lib/i18n/round-display-name";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const STAGE_KEYS: Record<PathStage, string> = {
  group: "groupStage",
  r32: "round32",
  r16: "round16",
  qf: "quarterFinal",
  sf: "semiFinal",
  final: "final",
};

function StatTile({
  label,
  value,
  hint,
  footer,
}: {
  label: string;
  value: string;
  hint?: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-white">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {footer}
    </div>
  );
}

function HighlightCard({
  title,
  body,
  footnote,
  href,
}: {
  title: string;
  body: React.ReactNode;
  footnote?: string;
  href?: string;
}) {
  const content = (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border border-white/8 bg-white/[0.03] p-4",
        href && "transition-colors hover:border-white/15 hover:bg-white/[0.05]",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      <div className="mt-2 flex-1">{body}</div>
      {footnote ? (
        <p className="mt-3 text-xs text-muted-foreground">{footnote}</p>
      ) : null}
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  );
}

function TeamHighlightBody({
  highlight,
  valueLabel,
  stageLabel,
}: {
  highlight: TeamHighlightFact;
  valueLabel: string;
  stageLabel: string;
}) {
  return (
    <div className="space-y-2">
      <TeamLabel
        team={highlight.team}
        showCode
        flagSize="md"
        nameClassName="text-sm font-semibold text-white"
      />
      <p className="text-xs text-muted-foreground">
        {stageLabel} · FIFA #{highlight.fifaRank ?? "—"}
      </p>
      <p className="font-mono text-sm font-semibold tabular-nums text-wc-orange">
        {valueLabel}
      </p>
    </div>
  );
}

function UpsetHighlightBody({
  upset,
  roundLabel,
  pointsGapLabel,
}: {
  upset: UpsetMatchFact;
  roundLabel: string;
  pointsGapLabel: string;
}) {
  return (
    <div className="space-y-2">
      <TeamLabel
        team={upset.team}
        showCode
        flagSize="md"
        nameClassName="text-sm font-semibold text-white"
      />
      <p className="text-xs text-muted-foreground">
        {roundLabel}
        {upset.scoreLabel ? ` · ${upset.scoreLabel}` : ""}
      </p>
      <p className="text-xs text-muted-foreground">
        vs{" "}
        <TeamLabel
          team={upset.opponent}
          showCode
          flagSize="sm"
          nameClassName="inline text-xs font-medium text-white"
        />
      </p>
      <p className="font-mono text-sm font-semibold tabular-nums text-wc-orange">
        {pointsGapLabel}
      </p>
    </div>
  );
}

function formatStageDelta(
  delta: number,
  t: ReturnType<typeof useTranslations<"home">>,
): string {
  if (delta > 0) return t("highlights.stageDeltaPositive", { delta });
  if (delta < 0) return t("highlights.stageDeltaNegative", { delta: Math.abs(delta) });
  return "0";
}

export function FactsPageClient() {
  const t = useTranslations("home");
  const common = useTranslations("common");
  const stages = useTranslations("compare.stages");
  const searchParams = useSearchParams();
  const [mode, setMode] = useSyncedRankingMode(searchParams);
  const [facts, setFacts] = useState<TournamentFacts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/facts?mode=${mode}`);
      if (!response.ok) throw new Error("Failed to load facts");
      const json = (await response.json()) as TournamentFacts;
      setFacts(json);
    } catch {
      setError(common("error"));
    } finally {
      setLoading(false);
    }
  }, [mode, common]);

  useEffect(() => {
    loadFacts();
  }, [loadFacts]);

  useEffect(() => {
    const params = new URLSearchParams({ mode });
    window.history.replaceState(null, "", `/?${params.toString()}`);
  }, [mode]);

  const stageLabel = (stage: PathStage) => stages(STAGE_KEYS[stage]);

  if (loading && !facts) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <PageShellSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{t("title")}</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground sm:text-base">
          {t("subtitle")}
        </p>
      </header>

      <div className="glass-panel mb-6 p-5 sm:p-6">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {t("rankingSnapshot")}
        </p>
        <RankingModeToggle value={mode} onChange={setMode} variant="compact" />
      </div>

      {error && (
        <div className="glass-panel mb-6 border-wc-red/30 bg-wc-red/10 p-6 text-wc-red">
          {error}
        </div>
      )}

      {facts && (
        <div className="space-y-6">
          <section className="glass-panel space-y-4 p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {t("groupStagePool.title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("groupStagePool.subtitle", {
                  count: facts.groupStagePool.teamCount,
                })}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatTile
                label={t("groupStagePool.avgFifaPoints")}
                value={formatFifaPoints(facts.groupStagePool.avgFifaPoints)}
                footer={
                  <AvgPointsContextHint
                    context={facts.groupStagePool.avgFifaPointsContext}
                    align="left"
                  />
                }
              />
              <StatTile
                label={t("groupStagePool.medianFifaRank")}
                value={
                  facts.groupStagePool.medianFifaRank !== null
                    ? `#${formatStatValue(facts.groupStagePool.medianFifaRank, 0)}`
                    : "—"
                }
              />
              {facts.groupStagePool.lowestRankedQualifier ? (
                <Link
                  href={`/team-analysis?team=${facts.groupStagePool.lowestRankedQualifier.team.id}&mode=${mode}`}
                  className="block rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 transition-colors hover:border-white/15 hover:bg-white/[0.05]"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {t("groupStagePool.lowestRankedQualifier")}
                  </p>
                  <div className="mt-2">
                    <TeamLabel
                      team={facts.groupStagePool.lowestRankedQualifier.team}
                      showCode
                      flagSize="sm"
                      nameClassName="text-sm font-semibold text-white"
                    />
                  </div>
                  <p className="mt-2 font-mono text-sm tabular-nums text-wc-orange">
                    FIFA #
                    {formatStatValue(
                      facts.groupStagePool.lowestRankedQualifier.fifaRank,
                      0,
                    )}{" "}
                    · {formatFifaPoints(
                      facts.groupStagePool.lowestRankedQualifier.fifaPoints,
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("groupStagePool.lowestRankedQualifierHint", {
                      group:
                        facts.groupStagePool.lowestRankedQualifier.groupLetter,
                    })}
                  </p>
                </Link>
              ) : (
                <StatTile
                  label={t("groupStagePool.lowestRankedQualifier")}
                  value="—"
                />
              )}
            </div>
          </section>

          {facts.groupExpectedAnalysis && (
            <GroupExpectedFinishesPanel
              analysis={facts.groupExpectedAnalysis}
              groupStageDifficulty={facts.groupStageDifficulty}
              mode={mode}
            />
          )}

          {facts.roundOf32Analysis && (
            <RoundOf32Panel
              analysis={facts.roundOf32Analysis}
              mode={mode}
            />
          )}

          {facts.roundOf16Analysis && (
            <RoundOf16Panel
              analysis={facts.roundOf16Analysis}
              mode={mode}
            />
          )}

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              {t("highlights.title")}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {facts.highlights.overPerformer && (
                <HighlightCard
                  title={t("highlights.overPerformer")}
                  footnote={t("highlights.overPerformerFootnote")}
                  href={`/team-analysis?team=${facts.highlights.overPerformer.team.id}&mode=${mode}`}
                  body={
                    <TeamHighlightBody
                      highlight={facts.highlights.overPerformer}
                      stageLabel={stageLabel(
                        facts.highlights.overPerformer.maxStageReached,
                      )}
                      valueLabel={formatStageDelta(
                        facts.highlights.overPerformer.value,
                        t,
                      )}
                    />
                  }
                />
              )}
              {facts.highlights.underPerformer && (
                <HighlightCard
                  title={t("highlights.underPerformer")}
                  footnote={t("highlights.underPerformerFootnote")}
                  href={`/team-analysis?team=${facts.highlights.underPerformer.team.id}&mode=${mode}`}
                  body={
                    <TeamHighlightBody
                      highlight={facts.highlights.underPerformer}
                      stageLabel={stageLabel(
                        facts.highlights.underPerformer.maxStageReached,
                      )}
                      valueLabel={formatStageDelta(
                        facts.highlights.underPerformer.value,
                        t,
                      )}
                    />
                  }
                />
              )}
              {facts.highlights.biggestGiantKilling && (
                <HighlightCard
                  title={t("highlights.biggestGiantKilling")}
                  footnote={t("highlights.upsetFootnote")}
                  href={`/team-analysis?team=${facts.highlights.biggestGiantKilling.team.id}&mode=${mode}`}
                  body={
                    <UpsetHighlightBody
                      upset={facts.highlights.biggestGiantKilling}
                      roundLabel={getRoundDisplayName(
                        stages,
                        facts.highlights.biggestGiantKilling.round,
                      )}
                      pointsGapLabel={t("highlights.pointsGap", {
                        points: formatFifaPoints(
                          Math.abs(facts.highlights.biggestGiantKilling.pointsGap),
                        ),
                      })}
                    />
                  }
                />
              )}
              {facts.highlights.biggestFavoriteUpset && (
                <HighlightCard
                  title={t("highlights.biggestFavoriteUpset")}
                  footnote={t("highlights.upsetFootnote")}
                  href={`/team-analysis?team=${facts.highlights.biggestFavoriteUpset.team.id}&mode=${mode}`}
                  body={
                    <UpsetHighlightBody
                      upset={facts.highlights.biggestFavoriteUpset}
                      roundLabel={getRoundDisplayName(
                        stages,
                        facts.highlights.biggestFavoriteUpset.round,
                      )}
                      pointsGapLabel={t("highlights.pointsGap", {
                        points: formatFifaPoints(
                          Math.abs(facts.highlights.biggestFavoriteUpset.pointsGap),
                        ),
                      })}
                    />
                  }
                />
              )}
              {facts.highlights.giantKillerLeader && (
                <HighlightCard
                  title={t("highlights.giantKillerLeader")}
                  footnote={t("highlights.giantKillerFootnote")}
                  href={`/team-analysis?team=${facts.highlights.giantKillerLeader.team.id}&mode=${mode}`}
                  body={
                    <TeamHighlightBody
                      highlight={facts.highlights.giantKillerLeader}
                      stageLabel={stageLabel(
                        facts.highlights.giantKillerLeader.maxStageReached,
                      )}
                      valueLabel={t("highlights.pointsOvercome", {
                        points: formatFifaPoints(
                          facts.highlights.giantKillerLeader.value,
                        ),
                      })}
                    />
                  }
                />
              )}
              {facts.highlights.hardestRemainingPath && (
                <HighlightCard
                  title={t("highlights.hardestRemainingPath")}
                  href={`/team-analysis?team=${facts.highlights.hardestRemainingPath.team.id}&mode=${mode}`}
                  body={
                    <TeamHighlightBody
                      highlight={facts.highlights.hardestRemainingPath}
                      stageLabel={stageLabel(
                        facts.highlights.hardestRemainingPath.maxStageReached,
                      )}
                      valueLabel={formatFifaPoints(
                        facts.highlights.hardestRemainingPath.value,
                      )}
                    />
                  }
                />
              )}
              {facts.highlights.easiestRemainingPath && (
                <HighlightCard
                  title={t("highlights.easiestRemainingPath")}
                  href={`/team-analysis?team=${facts.highlights.easiestRemainingPath.team.id}&mode=${mode}`}
                  body={
                    <TeamHighlightBody
                      highlight={facts.highlights.easiestRemainingPath}
                      stageLabel={stageLabel(
                        facts.highlights.easiestRemainingPath.maxStageReached,
                      )}
                      valueLabel={formatFifaPoints(
                        facts.highlights.easiestRemainingPath.value,
                      )}
                    />
                  }
                />
              )}
              {facts.highlights.groupOfDeath && (
                <HighlightCard
                  title={t("highlights.groupOfDeath")}
                  footnote={t("highlights.groupOfDeathFootnote")}
                  href={`/groups?group=${facts.highlights.groupOfDeath.groupLetter}&mode=${mode}`}
                  body={
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-white">
                        {t("highlights.groupLabel", {
                          letter: facts.highlights.groupOfDeath.groupLetter,
                        })}
                      </p>
                      <p className="font-mono text-sm font-semibold tabular-nums text-wc-orange">
                        {formatFifaPoints(
                          facts.highlights.groupOfDeath.avgFifaPoints,
                        )}{" "}
                        {t("highlights.avgGroupPoints")}
                      </p>
                    </div>
                  }
                />
              )}
            </div>
          </section>

          <p className="text-xs text-muted-foreground">
            {t("methodologyNote")}{" "}
            <Link href="/about" className="text-wc-sky hover:underline">
              {t("methodologyLink")}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
