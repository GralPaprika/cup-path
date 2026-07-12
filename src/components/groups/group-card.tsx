"use client";

import type {
  GroupComparisonCard,
  GroupStrengthOrdering,
} from "@/lib/types";
import { GroupTeamTableRow } from "@/components/groups/group-team-table-row";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatFifaPoints, formatStatValue } from "@/lib/format";

interface GroupCardProps {
  group: GroupComparisonCard;
  strengthOrdering: GroupStrengthOrdering;
  isSelected: boolean;
  isTeamGroup: boolean;
  selectedTeamId?: string;
  onSelect: () => void;
}

export function GroupCard({
  group,
  strengthOrdering,
  isSelected,
  isTeamGroup,
  selectedTeamId,
  onSelect,
}: GroupCardProps) {
  const t = useTranslations("groups");
  const summary = useTranslations("summary");
  const common = useTranslations("common");

  const strengthRank = {
    byPoints: strengthOrdering.rankByPoints[group.groupLetter] ?? null,
    byAvgRank: strengthOrdering.rankByAvgRank[group.groupLetter] ?? null,
  };

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border bg-white/[0.03] transition-all",
        isSelected
          ? "border-wc-sky/50 ring-2 ring-wc-sky/30"
          : "border-white/10 hover:border-white/20",
        isTeamGroup && !isSelected && "ring-1 ring-wc-sky/20",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full flex-col border-b border-white/8 px-4 py-3 text-left transition-colors hover:bg-white/4"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-white">
              {common("group", { group: group.groupLetter })}
            </h3>
            {group.isComplete && (
              <p className="text-xs text-muted-foreground">
                {t("groupComplete")}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:gap-4">
            {group.avgFifaPoints !== null && (
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("groupAvgFifaPoints")}
                </p>
                <p className="font-mono text-sm font-semibold tabular-nums text-wc-orange">
                  {formatFifaPoints(group.avgFifaPoints)}
                </p>
              </div>
            )}
            {group.avgFifaRank !== null && (
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("groupAvgPosition")}
                </p>
                <p className="font-mono text-sm font-semibold tabular-nums text-white">
                  {formatStatValue(group.avgFifaRank, 1)}
                </p>
              </div>
            )}
          </div>
        </div>
        {(strengthRank.byPoints !== null || strengthRank.byAvgRank !== null) && (
          <p className="mt-2 text-right text-[10px] text-muted-foreground">
            {strengthRank.byPoints !== null &&
              t("groupStrengthRankOf", {
                rank: strengthRank.byPoints,
                total: strengthOrdering.groupCount,
              })}
            {strengthRank.byPoints !== null &&
              strengthRank.byAvgRank !== null &&
              " · "}
            {strengthRank.byAvgRank !== null &&
              t("groupStrengthRankAlt", {
                rank: strengthRank.byAvgRank,
                total: strengthOrdering.groupCount,
              })}
          </p>
        )}
      </button>

      <div className="overflow-hidden [&_[data-slot=table-container]]:overflow-hidden">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow className="border-white/6 hover:bg-transparent">
              <TableHead className="w-[10%] px-3 text-center text-[10px] text-muted-foreground">
                {t("groupPos")}
              </TableHead>
              <TableHead className="w-[46%] px-3 text-[10px] text-muted-foreground">
                {t("team")}
              </TableHead>
              <TableHead className="w-[28%] px-3 text-right text-[10px] text-muted-foreground">
                {summary("fifaPoints")}
              </TableHead>
              <TableHead className="w-[16%] px-3 text-right text-[10px] text-muted-foreground">
                {summary("fifaRank")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {group.teams.map((entry) => (
              <GroupTeamTableRow
                key={entry.team.id}
                entry={entry}
                selectedTeamId={selectedTeamId}
                variant="summary"
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </article>
  );
}
