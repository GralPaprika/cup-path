"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type {
  GroupComparisonCard,
  GroupPointsBenchmarks,
  GroupStrengthOrdering,
} from "@/lib/types";
import { useTranslations } from "next-intl";
import { formatFifaPoints, formatStatValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface GroupsAdvancedPanelProps {
  groups: GroupComparisonCard[];
  strengthOrdering: GroupStrengthOrdering;
  pointsBenchmarks: GroupPointsBenchmarks | null;
  selectedGroupLetter: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectGroup?: (groupLetter: string) => void;
}

type GroupTableSortKey =
  | "group"
  | "avgPts"
  | "avgRank"
  | "rankByPts"
  | "rankByAvgRank";

interface GroupTableRow {
  groupLetter: string;
  avgFifaPoints: number;
  avgFifaRank: number;
  rankByPoints: number;
  rankByAvgRank: number;
}

function CorrelationTile({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="glass-panel-subtle px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-mono text-xl font-bold tabular-nums text-white",
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}

function SortHeader({
  active,
  direction,
  onClick,
  children,
  className,
}: {
  active: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 font-medium transition-colors hover:text-white",
        active ? "text-white" : "text-muted-foreground",
        className,
      )}
    >
      {children}
      {active && (
        <ChevronDown
          className={cn("size-3.5", direction === "asc" && "rotate-180")}
        />
      )}
    </button>
  );
}

function sortGroupRows(
  rows: GroupTableRow[],
  sortKey: GroupTableSortKey,
): GroupTableRow[] {
  const sorted = [...rows];
  sorted.sort((a, b) => {
    switch (sortKey) {
      case "group":
        return a.groupLetter.localeCompare(b.groupLetter);
      case "avgPts":
        return b.avgFifaPoints - a.avgFifaPoints;
      case "avgRank":
        return a.avgFifaRank - b.avgFifaRank;
      case "rankByPts":
        return a.rankByPoints - b.rankByPoints;
      case "rankByAvgRank":
        return a.rankByAvgRank - b.rankByAvgRank;
      default:
        return 0;
    }
  });
  return sorted;
}

export function GroupsAdvancedPanel({
  groups,
  strengthOrdering,
  pointsBenchmarks,
  selectedGroupLetter,
  open,
  onOpenChange,
  onSelectGroup,
}: GroupsAdvancedPanelProps) {
  const t = useTranslations("groups.advanced");
  const common = useTranslations("common");
  const [sortKey, setSortKey] = useState<GroupTableSortKey>("rankByPts");

  const selectedRank = {
    byPoints: strengthOrdering.rankByPoints[selectedGroupLetter] ?? null,
    byAvgRank: strengthOrdering.rankByAvgRank[selectedGroupLetter] ?? null,
  };

  const tableRows = useMemo(() => {
    const rows: GroupTableRow[] = groups.flatMap((group) =>
      group.avgFifaPoints !== null &&
      group.avgFifaRank !== null &&
      strengthOrdering.rankByPoints[group.groupLetter] !== undefined &&
      strengthOrdering.rankByAvgRank[group.groupLetter] !== undefined
        ? [
            {
              groupLetter: group.groupLetter,
              avgFifaPoints: group.avgFifaPoints,
              avgFifaRank: group.avgFifaRank,
              rankByPoints: strengthOrdering.rankByPoints[group.groupLetter],
              rankByAvgRank: strengthOrdering.rankByAvgRank[group.groupLetter],
            },
          ]
        : [],
    );
    return sortGroupRows(rows, sortKey);
  }, [groups, strengthOrdering, sortKey]);

  const formatCorrelation = (value: number | null) =>
    value === null ? "—" : formatStatValue(value, 3);

  const sortDirection = (key: GroupTableSortKey): "asc" | "desc" =>
    key === "avgPts" ? "desc" : "asc";

  return (
    <details
      className="glass-panel group overflow-hidden"
      open={open}
      onToggle={(event) => {
        onOpenChange(event.currentTarget.open);
      }}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-white/8 bg-white/[0.03] px-5 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
        <div>
          <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </summary>

      <div className="space-y-5 px-5 py-5">
        {pointsBenchmarks && (
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {t("benchmarksTitle")}
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <CorrelationTile
                label={t("weakestGroupBenchmark")}
                value={`${pointsBenchmarks.weakest.groupLetter} · ${formatFifaPoints(pointsBenchmarks.weakest.avgFifaPoints)}`}
                valueClassName="text-wc-red"
              />
              <CorrelationTile
                label={t("strongestGroupBenchmark")}
                value={`${pointsBenchmarks.strongest.groupLetter} · ${formatFifaPoints(pointsBenchmarks.strongest.avgFifaPoints)}`}
                valueClassName="text-wc-lime"
              />
              <CorrelationTile
                label={t("tournamentAverageBenchmark")}
                value={formatFifaPoints(pointsBenchmarks.tournamentAverage)}
                valueClassName="text-wc-turquoise"
              />
            </div>
          </section>
        )}

        <section>
          <h3 className="mb-1 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {t("tableTitle")}
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">{t("tableHint")}</p>
          <div className="overflow-x-auto rounded-xl border border-white/8">
            <Table>
              <TableHeader>
                <TableRow className="border-white/8 hover:bg-transparent">
                  <TableHead className="px-3 text-xs">
                    <SortHeader
                      active={sortKey === "group"}
                      direction={sortDirection("group")}
                      onClick={() => setSortKey("group")}
                    >
                      {t("colGroup")}
                    </SortHeader>
                  </TableHead>
                  <TableHead className="px-3 text-right text-xs">
                    <SortHeader
                      active={sortKey === "avgPts"}
                      direction={sortDirection("avgPts")}
                      onClick={() => setSortKey("avgPts")}
                      className="ml-auto"
                    >
                      {t("colAvgPts")}
                    </SortHeader>
                  </TableHead>
                  <TableHead className="px-3 text-right text-xs">
                    <SortHeader
                      active={sortKey === "avgRank"}
                      direction={sortDirection("avgRank")}
                      onClick={() => setSortKey("avgRank")}
                      className="ml-auto"
                    >
                      {t("colAvgRank")}
                    </SortHeader>
                  </TableHead>
                  <TableHead className="px-3 text-right text-xs">
                    <SortHeader
                      active={sortKey === "rankByPts"}
                      direction={sortDirection("rankByPts")}
                      onClick={() => setSortKey("rankByPts")}
                      className="ml-auto"
                    >
                      {t("colRankByPts")}
                    </SortHeader>
                  </TableHead>
                  <TableHead className="px-3 text-right text-xs">
                    <SortHeader
                      active={sortKey === "rankByAvgRank"}
                      direction={sortDirection("rankByAvgRank")}
                      onClick={() => setSortKey("rankByAvgRank")}
                      className="ml-auto"
                    >
                      {t("colRankByAvgRank")}
                    </SortHeader>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map((row) => {
                  const isSelected = row.groupLetter === selectedGroupLetter;
                  const isWeakest =
                    pointsBenchmarks?.weakest.groupLetter === row.groupLetter;
                  const isStrongest =
                    pointsBenchmarks?.strongest.groupLetter === row.groupLetter;

                  return (
                    <TableRow
                      key={row.groupLetter}
                      className={cn(
                        "border-white/6",
                        onSelectGroup && "cursor-pointer hover:bg-white/4",
                        isSelected && "bg-wc-orange/12 hover:bg-wc-orange/18",
                        isWeakest && !isSelected && "bg-wc-red/8",
                        isStrongest && !isSelected && "bg-wc-lime/8",
                      )}
                      onClick={
                        onSelectGroup
                          ? () => onSelectGroup(row.groupLetter)
                          : undefined
                      }
                    >
                      <TableCell className="px-3 py-2 font-semibold text-white">
                        {common("group", { group: row.groupLetter })}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-right font-mono text-sm tabular-nums text-wc-orange">
                        {formatFifaPoints(row.avgFifaPoints)}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-right font-mono text-sm tabular-nums text-white">
                        {formatStatValue(row.avgFifaRank, 1)}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-right font-mono text-sm tabular-nums text-white">
                        {t("rankValue", {
                          rank: row.rankByPoints,
                          total: strengthOrdering.groupCount,
                        })}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-right font-mono text-sm tabular-nums text-white">
                        {t("rankValue", {
                          rank: row.rankByAvgRank,
                          total: strengthOrdering.groupCount,
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </section>

        <section>
          <h3 className="mb-1 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {t("groupOrderingTitle")}
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">
            {t("groupOrderingHint", { count: strengthOrdering.groupCount })}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <CorrelationTile
              label={t("spearmanRho")}
              value={formatCorrelation(strengthOrdering.correlation.spearmanRho)}
            />
            <CorrelationTile
              label={t("kendallTau")}
              value={formatCorrelation(strengthOrdering.correlation.kendallTau)}
            />
            <CorrelationTile
              label={t("selectedRankByPoints", {
                group: selectedGroupLetter,
              })}
              value={
                selectedRank.byPoints !== null
                  ? t("rankValue", {
                      rank: selectedRank.byPoints,
                      total: strengthOrdering.groupCount,
                    })
                  : "—"
              }
            />
            <CorrelationTile
              label={t("selectedRankByAvgRank", {
                group: selectedGroupLetter,
              })}
              value={
                selectedRank.byAvgRank !== null
                  ? t("rankValue", {
                      rank: selectedRank.byAvgRank,
                      total: strengthOrdering.groupCount,
                    })
                  : "—"
              }
            />
          </div>
        </section>

        <div className="space-y-3 border-t border-white/8 pt-4 text-xs leading-relaxed text-muted-foreground">
          <p>{t("groupOrderingIntro")}</p>
          <p>{t("spearmanBody")}</p>
          <p>{t("kendallBody")}</p>
          <p>{t("footnotePrimary")}</p>
        </div>
      </div>
    </details>
  );
}
