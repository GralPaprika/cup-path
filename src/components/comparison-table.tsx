"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { ComparisonEntry, PathStage, RankingMode } from "@/lib/types";
import { useTranslations } from "next-intl";
import { TeamFlag } from "@/components/team-flag";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export type ComparisonSortKey = "points" | "rank";

const COHORT_STAGE_KEYS: Record<PathStage, string> = {
  group: "groupStage",
  r32: "round32",
  r16: "round16",
  qf: "quarterFinal",
  sf: "semiFinal",
  final: "final",
};

interface ComparisonTableProps {
  entries: ComparisonEntry[];
  mode: RankingMode;
  selectedTeamId?: string;
  showDelta?: boolean;
  sortable?: boolean;
  linkToAnalysis?: boolean;
  embedded?: boolean;
  cohortStage?: PathStage;
  cohortSize?: number;
}

function formatDelta(value: number | null): string {
  if (value === null) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatFifaPoints(Math.abs(value))}`;
}

function sortEntries(
  entries: ComparisonEntry[],
  sortKey: ComparisonSortKey,
): ComparisonEntry[] {
  return [...entries].sort((a, b) => {
    if (sortKey === "points") {
      const aValue = a.avgOpponentPoints ?? Number.NEGATIVE_INFINITY;
      const bValue = b.avgOpponentPoints ?? Number.NEGATIVE_INFINITY;
      return bValue - aValue;
    }

    const aValue = a.avgOpponentRank ?? Number.POSITIVE_INFINITY;
    const bValue = b.avgOpponentRank ?? Number.POSITIVE_INFINITY;
    return aValue - bValue;
  });
}

function SortButton({
  active,
  direction,
  onClick,
  children,
}: {
  active: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors",
        active
          ? "bg-emerald-100 text-emerald-900"
          : "text-muted-foreground hover:bg-muted/70 hover:text-emerald-900",
      )}
    >
      {children}
      {active &&
        (direction === "desc" ? (
          <ArrowDown className="size-3.5 shrink-0" />
        ) : (
          <ArrowUp className="size-3.5 shrink-0" />
        ))}
    </button>
  );
}

export function ComparisonTable({
  entries,
  mode,
  selectedTeamId,
  showDelta = false,
  sortable = true,
  linkToAnalysis = true,
  embedded = false,
  cohortStage,
  cohortSize,
}: ComparisonTableProps) {
  const router = useRouter();
  const t = useTranslations("compare");
  const stageLabels = useTranslations("compare.stages");
  const summary = useTranslations("summary");
  const [sortKey, setSortKey] = useState<ComparisonSortKey>("points");

  const sortedEntries = useMemo(
    () => (sortable ? sortEntries(entries, sortKey) : entries),
    [entries, sortKey, sortable],
  );

  const subtitle =
    sortKey === "points" ? t("subtitleByPoints") : t("subtitleByRank");

  const cohortHint =
    cohortStage && cohortSize
      ? t("rankCohortHint", {
          count: cohortSize,
          stage: stageLabels(COHORT_STAGE_KEYS[cohortStage]),
        })
      : null;

  const table = (
    <div className={cn("overflow-x-auto", !embedded && "rounded-xl border")}>
      <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-[1%] whitespace-nowrap px-4 text-center">
                  #
                </TableHead>
                <TableHead className="w-[1%] whitespace-nowrap px-4">{t("team")}</TableHead>
                <TableHead className="w-[1%] whitespace-nowrap px-4 text-right">
                  {sortable ? (
                    <SortButton
                      active={sortKey === "points"}
                      direction="desc"
                      onClick={() => setSortKey("points")}
                    >
                      {t("avgPoints")}
                    </SortButton>
                  ) : (
                    <span className="text-muted-foreground">{t("avgPoints")}</span>
                  )}
                </TableHead>
                <TableHead className="w-[1%] whitespace-nowrap px-4 text-right">
                  {sortable ? (
                    <SortButton
                      active={sortKey === "rank"}
                      direction="asc"
                      onClick={() => setSortKey("rank")}
                    >
                      {t("avgRank")}
                    </SortButton>
                  ) : (
                    <span className="text-muted-foreground">{t("avgRank")}</span>
                  )}
                </TableHead>
                <TableHead className="w-[1%] whitespace-nowrap px-4 text-center">
                  {t("status")}
                </TableHead>
                {showDelta && (
                  <TableHead className="w-[1%] whitespace-nowrap px-4 text-right">
                    {t("delta")}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEntries.map((entry) => {
                const isSelected = entry.team.id === selectedTeamId;
                const analysisHref = `/?team=${entry.team.id}&mode=${mode}`;

                return (
                  <TableRow
                    key={entry.team.id}
                    className={cn(
                      "transition-colors",
                      isSelected && "bg-amber-50/80 font-medium",
                      linkToAnalysis && "cursor-pointer hover:bg-emerald-50/60",
                    )}
                    onClick={
                      linkToAnalysis
                        ? () => router.push(analysisHref)
                        : undefined
                    }
                    onKeyDown={
                      linkToAnalysis
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              router.push(analysisHref);
                            }
                          }
                        : undefined
                    }
                    tabIndex={linkToAnalysis ? 0 : undefined}
                    role={linkToAnalysis ? "link" : undefined}
                    aria-label={
                      linkToAnalysis
                        ? `${entry.team.displayName} analysis`
                        : undefined
                    }
                  >
                    <TableCell className="w-[1%] whitespace-nowrap px-4 py-3 text-center font-mono text-muted-foreground">
                      {entry.rankAmongTeams ?? "—"}
                    </TableCell>
                    <TableCell className="w-[1%] whitespace-nowrap px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <TeamFlag team={entry.team} size="sm" />
                        <div className="min-w-0 leading-tight">
                          <div className="truncate font-medium">
                            {entry.team.displayName}
                          </div>
                          <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                            {entry.team.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-[1%] whitespace-nowrap px-4 py-3 text-right font-mono tabular-nums">
                      {formatFifaPoints(entry.avgOpponentPoints)}
                    </TableCell>
                    <TableCell className="w-[1%] whitespace-nowrap px-4 py-3 text-right font-mono tabular-nums">
                      {entry.avgOpponentRank !== null
                        ? entry.avgOpponentRank.toLocaleString(undefined, {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1,
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="w-[1%] whitespace-nowrap px-4 py-3 text-center">
                      <Badge
                        variant={entry.isEliminated ? "destructive" : "default"}
                        className={cn(
                          "min-w-[5.5rem] justify-center",
                          !entry.isEliminated &&
                            "bg-emerald-600 text-white hover:bg-emerald-600",
                        )}
                      >
                        {entry.isEliminated
                          ? summary("eliminated")
                          : summary("active")}
                      </Badge>
                    </TableCell>
                    {showDelta && (
                      <TableCell className="w-[1%] whitespace-nowrap px-4 py-3 text-right font-mono tabular-nums">
                        {formatDelta(entry.deltaVsSelected)}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
  );

  if (embedded) {
    return (
      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="mb-4 space-y-1 text-sm text-muted-foreground">
          <p>{subtitle}</p>
          {cohortHint && <p>{cohortHint}</p>}
        </div>
        {entries.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {t("noTeams")}
          </p>
        ) : (
          table
        )}
      </div>
    );
  }

  return (
    <Card className="border-emerald-200/60 shadow-sm">
      <CardHeader className="border-b bg-emerald-50/50">
        <CardTitle className="text-emerald-950">{t("title")}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">{table}</CardContent>
    </Card>
  );
}
