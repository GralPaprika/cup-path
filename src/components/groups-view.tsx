"use client";

import { useEffect, useMemo, useRef } from "react";
import type {
  GroupComparisonCard,
  GroupQualificationStatus,
} from "@/lib/types";
import { GroupDetailPanel } from "@/components/group-detail-panel";
import { GroupsAdvancedPanel } from "@/components/groups-advanced-panel";
import {
  computeGroupStrengthOrdering,
  getGroupStrengthRank,
} from "@/lib/domain/group-strength-ordering";
import { useTranslations } from "next-intl";
import { TeamLabel } from "@/components/team-flag";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatFifaPoints, formatStatValue } from "@/lib/format";

const QUALIFICATION_ROW_STYLES: Record<
  Exclude<GroupQualificationStatus, null>,
  string
> = {
  first: "bg-wc-green/12 hover:bg-wc-green/18",
  second: "bg-wc-sky/12 hover:bg-wc-sky/18",
  bestThird: "bg-wc-purple/12 hover:bg-wc-purple/18",
};

const QUALIFICATION_LEGEND_STYLES: Record<
  Exclude<GroupQualificationStatus, null>,
  string
> = {
  first: "bg-wc-green/50",
  second: "bg-wc-sky/50",
  bestThird: "bg-wc-purple/50",
};

interface GroupsViewProps {
  groups: GroupComparisonCard[];
  selectedGroupLetter: string;
  onSelectGroup: (groupLetter: string) => void;
  selectedTeamId?: string;
  advancedOpen: boolean;
  onAdvancedOpenChange: (open: boolean) => void;
}

export function GroupsView({
  groups,
  selectedGroupLetter,
  onSelectGroup,
  selectedTeamId,
  advancedOpen,
  onAdvancedOpenChange,
}: GroupsViewProps) {
  const t = useTranslations("groups");
  const summary = useTranslations("summary");
  const common = useTranslations("common");
  const selectedGroupRef = useRef<HTMLDivElement>(null);

  const groupOrdering = useMemo(
    () => computeGroupStrengthOrdering(groups),
    [groups],
  );

  const selectedGroup = groups.find(
    (group) => group.groupLetter === selectedGroupLetter,
  );

  const teamGroupLetter = selectedTeamId
    ? groups.find((group) =>
        group.teams.some((entry) => entry.team.id === selectedTeamId),
      )?.groupLetter
    : undefined;

  useEffect(() => {
    if (!selectedTeamId || !teamGroupLetter) return;
    if (teamGroupLetter !== selectedGroupLetter) return;
    selectedGroupRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [selectedTeamId, teamGroupLetter, selectedGroupLetter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
        {(["first", "second", "bestThird"] as const).map((status) => (
          <span key={status} className="inline-flex items-center gap-2">
            <span
              className={cn(
                "size-3 rounded-sm",
                QUALIFICATION_LEGEND_STYLES[status],
              )}
            />
            {t(`legend.${status}`)}
          </span>
        ))}
      </div>

      {selectedGroup && (
        <div ref={selectedGroupRef}>
          <GroupDetailPanel
            group={selectedGroup}
            allGroups={groups}
            selectedTeamId={selectedTeamId}
          />
        </div>
      )}

      <GroupsAdvancedPanel
        groups={groups}
        selectedGroupLetter={selectedGroupLetter}
        open={advancedOpen}
        onOpenChange={onAdvancedOpenChange}
        onSelectGroup={onSelectGroup}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => {
          const isSelected = group.groupLetter === selectedGroupLetter;
          const isTeamGroup = group.groupLetter === teamGroupLetter;
          const strengthRank = getGroupStrengthRank(groupOrdering, group.groupLetter);

          return (
            <article
              key={group.groupName}
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
                onClick={() => onSelectGroup(group.groupLetter)}
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
                {(strengthRank.byPoints !== null ||
                  strengthRank.byAvgRank !== null) && (
                  <p className="mt-2 text-right text-[10px] text-muted-foreground">
                    {strengthRank.byPoints !== null &&
                      t("groupStrengthRankOf", {
                        rank: strengthRank.byPoints,
                        total: groupOrdering.groupCount,
                      })}
                    {strengthRank.byPoints !== null &&
                      strengthRank.byAvgRank !== null &&
                      " · "}
                    {strengthRank.byAvgRank !== null &&
                      t("groupStrengthRankAlt", {
                        rank: strengthRank.byAvgRank,
                        total: groupOrdering.groupCount,
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
                    {group.teams.map((entry) => {
                      const isTeamSelected = entry.team.id === selectedTeamId;

                      return (
                        <TableRow
                          key={entry.team.id}
                          className={cn(
                            "border-white/6",
                            entry.qualificationStatus &&
                              QUALIFICATION_ROW_STYLES[
                                entry.qualificationStatus
                              ],
                            isTeamSelected && "ring-1 ring-inset ring-wc-sky/50",
                          )}
                        >
                          <TableCell className="px-3 py-2 text-center font-mono text-sm text-muted-foreground">
                            {entry.standing.position}
                          </TableCell>
                          <TableCell className="max-w-0 whitespace-normal px-3 py-2">
                            <TeamLabel
                              team={entry.team}
                              showCode
                              flagSize="sm"
                              className="w-full"
                              nameClassName="text-sm font-medium text-white"
                            />
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-3 py-2 text-right font-mono text-sm tabular-nums text-wc-orange">
                            {formatFifaPoints(entry.fifaPoints)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-3 py-2 text-right font-mono text-sm tabular-nums text-white">
                            {entry.fifaRank ?? "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
