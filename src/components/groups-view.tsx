"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type {
  GroupComparisonCard,
  GroupQualificationStatus,
  RankingMode,
} from "@/lib/types";
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
import { formatFifaPoints } from "@/lib/format";

function formatAvgRank(value: number | null): string {
  if (value === null) return "—";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

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
  mode: RankingMode;
  selectedTeamId?: string;
}

export function GroupsView({ groups, mode, selectedTeamId }: GroupsViewProps) {
  const router = useRouter();
  const t = useTranslations("groups");
  const summary = useTranslations("summary");
  const common = useTranslations("common");
  const highlightedGroupRef = useRef<HTMLDivElement>(null);

  const selectedGroupLetter = selectedTeamId
    ? groups.find((group) =>
        group.teams.some((entry) => entry.team.id === selectedTeamId),
      )?.groupLetter
    : undefined;

  useEffect(() => {
    if (!selectedTeamId || !highlightedGroupRef.current) return;
    highlightedGroupRef.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [selectedTeamId, groups]);

  return (
    <div className="space-y-4">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => {
        const isHighlighted = group.groupLetter === selectedGroupLetter;

        return (
          <article
            key={group.groupName}
            ref={isHighlighted ? highlightedGroupRef : undefined}
            className={cn(
              "overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]",
              isHighlighted && "ring-2 ring-wc-sky/40",
            )}
          >
            <header className="flex items-start justify-between gap-2 border-b border-white/8 px-4 py-3">
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
              {(group.avgFifaRank !== null || group.avgFifaPoints !== null) && (
              <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:gap-4">
                {group.avgFifaRank !== null && (
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {t("groupAvgPosition")}
                    </p>
                    <p className="font-mono text-sm font-semibold tabular-nums text-white">
                      {formatAvgRank(group.avgFifaRank)}
                    </p>
                  </div>
                )}
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
              </div>
              )}
            </header>

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
                    <TableHead className="w-[16%] px-3 text-right text-[10px] text-muted-foreground">
                      {summary("fifaRank")}
                    </TableHead>
                    <TableHead className="w-[28%] px-3 text-right text-[10px] text-muted-foreground">
                      {summary("fifaPoints")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.teams.map((entry) => {
                    const isSelected = entry.team.id === selectedTeamId;
                    const analysisHref = `/?team=${entry.team.id}&mode=${mode}`;

                    return (
                      <TableRow
                        key={entry.team.id}
                        className={cn(
                          "cursor-pointer border-white/6 transition-colors",
                          entry.qualificationStatus &&
                            QUALIFICATION_ROW_STYLES[entry.qualificationStatus],
                          !entry.qualificationStatus && "hover:bg-white/4",
                          isSelected && "ring-1 ring-inset ring-wc-sky/50",
                        )}
                        onClick={() => router.push(analysisHref)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            router.push(analysisHref);
                          }
                        }}
                        tabIndex={0}
                        role="link"
                        aria-label={`${entry.team.displayName} analysis`}
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
                        <TableCell className="whitespace-nowrap px-3 py-2 text-right font-mono text-sm tabular-nums text-white">
                          {entry.fifaRank ?? "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap px-3 py-2 text-right font-mono text-sm tabular-nums text-white">
                          {formatFifaPoints(entry.fifaPoints)}
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
