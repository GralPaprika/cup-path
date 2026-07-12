"use client";

import type {
  GroupComparisonCard,
  GroupPointsBenchmarks,
} from "@/lib/types";
import { GroupTeamTableRow } from "@/components/groups/group-team-table-row";
import { useTranslations } from "next-intl";
import { GroupFifaPointsChart } from "@/components/group-fifa-points-chart";
import { StatsBlock } from "@/components/stats-block";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface GroupDetailPanelProps {
  group: GroupComparisonCard;
  pointsBenchmarks: GroupPointsBenchmarks | null;
  selectedTeamId?: string;
}

export function GroupDetailPanel({
  group,
  pointsBenchmarks,
  selectedTeamId,
}: GroupDetailPanelProps) {
  const t = useTranslations("groups");
  const summary = useTranslations("summary");

  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      <header className="border-b border-white/8 px-5 py-4">
        <h3 className="text-lg font-semibold text-white">
          {t("detailTitle", { group: group.groupLetter })}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {group.isComplete ? t("groupComplete") : t("detailSubtitle")}
        </p>
      </header>

      <div className="flex flex-col gap-6 p-5">
        <div className="overflow-x-auto [&_[data-slot=table-container]]:overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/6 hover:bg-transparent">
                <TableHead className="px-3 text-center text-xs text-muted-foreground">
                  {t("groupPos")}
                </TableHead>
                <TableHead className="min-w-[8rem] px-3 text-xs text-muted-foreground">
                  {t("team")}
                </TableHead>
                <TableHead className="px-3 text-center text-xs text-muted-foreground">
                  {t("groupPts")}
                </TableHead>
                <TableHead className="px-3 text-center text-xs text-muted-foreground">
                  {t("groupGd")}
                </TableHead>
                <TableHead className="px-3 text-center text-xs text-muted-foreground">
                  {t("goalsFor")}
                </TableHead>
                <TableHead className="px-3 text-center text-xs text-muted-foreground">
                  {t("goalsAgainst")}
                </TableHead>
                <TableHead className="px-3 text-right text-xs text-muted-foreground">
                  {summary("fifaPoints")}
                </TableHead>
                <TableHead className="px-3 text-right text-xs text-muted-foreground">
                  {summary("fifaRank")}
                </TableHead>
                <TableHead className="px-3 text-right text-xs text-muted-foreground">
                  {t("pathAvgPoints")}
                </TableHead>
                <TableHead className="px-3 text-right text-xs text-muted-foreground">
                  {t("pathAvgRank")}
                </TableHead>
                <TableHead className="px-3 text-center text-xs text-muted-foreground">
                  {t("pathRank")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {group.teams.map((entry) => (
                <GroupTeamTableRow
                  key={entry.team.id}
                  entry={entry}
                  selectedTeamId={selectedTeamId}
                  variant="full"
                />
              ))}
            </TableBody>
          </Table>
        </div>

        <GroupFifaPointsChart
          group={group}
          pointsBenchmarks={pointsBenchmarks}
          selectedTeamId={selectedTeamId}
        />

        <div className="space-y-4 border-t border-white/8 pt-6">
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {t("statsTitle")}
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatsBlock
                title={t("fifaPointsStats")}
                stats={group.fifaPointsStats}
                isRank={false}
              />
              <StatsBlock
                title={t("fifaRankStats")}
                stats={group.fifaRankStats}
                isRank
              />
            </div>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("statsNote")}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("pathStatsNote")}
          </p>
        </div>
      </div>
    </section>
  );
}
