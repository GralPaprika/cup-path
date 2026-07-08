"use client";

import type { TeamPathSummary } from "@/lib/types";
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
          ? "rounded-xl bg-emerald-950 p-4 text-white"
          : "rounded-xl border bg-muted/40 p-4"
      }
    >
      <p
        className={
          highlight
            ? "text-xs font-medium uppercase tracking-wide text-emerald-200"
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

export function SummaryCard({ summary, hardestPathRank }: SummaryCardProps) {
  const t = useTranslations("summary");

  return (
    <Card className="overflow-hidden border-emerald-200/60 shadow-lg shadow-emerald-950/5">
      <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-white pb-4">
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
            <StatBlock
              label={t("hardestPathRank")}
              value={hardestPathRank ? `#${hardestPathRank} / 48` : "—"}
            />
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
                      : "bg-emerald-600 text-white hover:bg-emerald-600"
                  }
                >
                  {summary.isEliminated ? t("eliminated") : t("active")}
                </Badge>
              </div>
            </div>
            <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 p-4 sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-800/70">
                {t("nextOpponent")}
              </p>
              <p className="mt-2 text-lg font-semibold text-emerald-950">
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
