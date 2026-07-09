"use client";

import type { PathStage, TeamPathSummary } from "@/lib/types";
import { getMatchStage, PATH_STAGES } from "@/lib/domain/match-stages";
import { useTranslations } from "next-intl";
import { TeamLabel } from "@/components/team-flag";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatFifaPoints, formatWholeNumber } from "@/lib/format";

interface SummaryCardProps {
  summary: TeamPathSummary;
  hardestPathRank: number | null;
  cohortSize: number;
  cohortStage: PathStage;
  includedStages?: Set<PathStage>;
}

function StatBlock({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-xl bg-hermes-500 p-4 text-white shadow-sm"
          : "rounded-xl border bg-muted/40 p-4"
      }
    >
      <p
        className={
          highlight
            ? "text-xs font-medium uppercase tracking-wide text-hermes-100"
            : "text-xs font-medium uppercase tracking-wide text-muted-foreground"
        }
      >
        {label}
      </p>
      <p className={highlight ? "mt-1 text-3xl font-bold" : "mt-1 text-2xl font-bold"}>
        {value}
      </p>
    </div>
  );
}

const COHORT_STAGE_KEYS: Record<PathStage, string> = {
  group: "groupStage",
  r32: "round32",
  r16: "round16",
  qf: "quarterFinal",
  sf: "semiFinal",
  final: "final",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

export function SummaryCard({
  summary,
  hardestPathRank,
  cohortSize,
  cohortStage,
  includedStages,
}: SummaryCardProps) {
  const t = useTranslations("summary");
  const stages = useTranslations("compare.stages");

  const includedMatches = includedStages
    ? summary.matches.filter((match) => {
        const stage = getMatchStage(match.round);
        return stage !== null && includedStages.has(stage);
      })
    : summary.matches;

  const allStagesSelected =
    !includedStages || includedStages.size === PATH_STAGES.length;

  return (
    <Card className="overflow-hidden border-hermes-100/60 shadow-lg shadow-hermes-900/5">
      <CardHeader className="border-b bg-gradient-to-r from-hermes-50 to-white pb-4">
        <CardTitle className="text-2xl">
          <TeamLabel
            team={summary.team}
            showCode
            flagSize="lg"
            nameClassName="text-2xl font-bold"
          />
        </CardTitle>
        <CardDescription>
          {t("matchesPlayed")}: {summary.playedCount}/{summary.totalCount}
          {!allStagesSelected && (
            <span className="text-muted-foreground">
              {" "}
              · {t("averagesFrom", { count: includedMatches.length })}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-4">
        <div className="space-y-3">
          <SectionLabel>{t("teamProfile")}</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatBlock label={t("fifaRank")} value={formatWholeNumber(summary.teamRank)} />
            <StatBlock
              label={t("fifaPoints")}
              value={formatFifaPoints(summary.teamPoints)}
            />
            <StatBlock label={t("worldCupGroup")} value={summary.team.group} />
            <StatBlock label={t("confederation")} value={summary.team.confederation} />
          </div>
        </div>

        <div className="space-y-3">
          <SectionLabel>{t("pathAnalysis")}</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            <StatBlock
              label={t("avgDifficulty")}
              value={formatFifaPoints(summary.avgOpponentPoints)}
              highlight
            />
            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("hardestPathRank")}
              </p>
              <p className="mt-1 text-2xl font-bold">
                {hardestPathRank
                  ? t("hardestPathRankOf", {
                      rank: hardestPathRank,
                      total: cohortSize,
                    })
                  : "—"}
              </p>
              {hardestPathRank && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("hardestPathRankCohort", {
                    stage: stages(COHORT_STAGE_KEYS[cohortStage]),
                  })}
                </p>
              )}
            </div>
            <StatBlock
              label={t("avgRank")}
              value={formatWholeNumber(summary.avgOpponentRank)}
            />
            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("status")}
              </p>
              <div className="mt-2">
                <Badge
                  variant={summary.isEliminated ? "destructive" : "default"}
                  className={
                    summary.isEliminated
                      ? ""
                      : "bg-pitch-500 text-white hover:bg-pitch-500"
                  }
                >
                  {summary.isEliminated ? t("eliminated") : t("active")}
                </Badge>
              </div>
            </div>
            <div className="rounded-xl border border-dashed border-hermes-200 bg-hermes-50/50 p-4 sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-hermes-700/70">
                {t("nextOpponent")}
              </p>
              <p className="mt-2 text-lg font-semibold text-hermes-900">
                {summary.nextOpponent ? (
                  <TeamLabel team={summary.nextOpponent} showCode flagSize="md" />
                ) : (
                  <span className="text-muted-foreground">{t("noNextOpponent")}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
