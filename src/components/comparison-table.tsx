"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import type { ComparisonEntry, PathStage, RankingMode } from "@/lib/types";
import { getTeamDisplayName } from "@/lib/i18n/team-display-name";
import { useTranslations } from "next-intl";
import { TeamLabel } from "@/components/team-flag";
import { Badge } from "@/components/ui/badge";
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
  compareTeamAId?: string;
  compareTeamBId?: string;
  /** @deprecated Use compareTeamAId and compareTeamBId for distinct highlights */
  compareTeamIds?: string[];
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
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium transition-colors",
        active
          ? "bg-wc-sky/15 text-wc-sky"
          : "text-muted-foreground hover:bg-white/6 hover:text-white",
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
  compareTeamAId,
  compareTeamBId,
  compareTeamIds,
  showDelta = false,
  sortable = true,
  linkToAnalysis = true,
  embedded = false,
  cohortStage,
  cohortSize,
}: ComparisonTableProps) {
  const router = useRouter();
  const t = useTranslations("compare");
  const teamNames = useTranslations("teams");
  const stageLabels = useTranslations("compare.stages");
  const summary = useTranslations("summary");
  const common = useTranslations("common");
  const [sortKey, setSortKey] = useState<ComparisonSortKey>("points");
  const [query, setQuery] = useState("");

  const sortedEntries = useMemo(
    () => (sortable ? sortEntries(entries, sortKey) : entries),
    [entries, sortKey, sortable],
  );

  const filteredEntries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedEntries;
    return sortedEntries.filter((entry) => {
      const name = getTeamDisplayName(teamNames, entry.team).toLowerCase();
      return (
        name.includes(q) ||
        entry.team.id.toLowerCase().includes(q) ||
        entry.team.group.toLowerCase().includes(q)
      );
    });
  }, [sortedEntries, query, teamNames]);

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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-white/8 hover:bg-transparent">
            <TableHead className="w-[1%] px-4 text-center text-muted-foreground">
              #
            </TableHead>
            <TableHead className="w-[1%] px-4 text-muted-foreground">
              {t("team")}
            </TableHead>
            <TableHead className="w-[1%] px-4 text-center text-muted-foreground">
              {t("group")}
            </TableHead>
            <TableHead className="w-[1%] px-4 text-muted-foreground">
              {t("confederation")}
            </TableHead>
            <TableHead className="w-[1%] px-4 text-right">
              {sortable ? (
                <SortButton
                  active={sortKey === "points"}
                  direction="desc"
                  onClick={() => setSortKey("points")}
                >
                  {t("avgOpponentPoints")}
                </SortButton>
              ) : (
                <span className="text-muted-foreground">{t("avgOpponentPoints")}</span>
              )}
            </TableHead>
            <TableHead className="w-[1%] px-4 text-right">
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
            <TableHead className="w-[1%] px-4 text-center text-muted-foreground">
              {t("status")}
            </TableHead>
            {showDelta && (
              <TableHead className="w-[1%] px-4 text-right text-muted-foreground">
                {t("delta")}
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEntries.map((entry) => {
            const isTeamA = entry.team.id === compareTeamAId;
            const isTeamB = entry.team.id === compareTeamBId;
            const isLegacyCompare = compareTeamIds?.includes(entry.team.id);
            const isSelected =
              entry.team.id === selectedTeamId || isTeamA || isTeamB || isLegacyCompare;
            const analysisHref = `/team-analysis?team=${entry.team.id}&mode=${mode}`;

            return (
              <TableRow
                key={entry.team.id}
                className={cn(
                  "border-white/6 transition-colors",
                  isTeamA && "bg-wc-sky/10 font-medium",
                  isTeamB && "bg-wc-purple/12 font-medium",
                  isSelected &&
                    !isTeamA &&
                    !isTeamB &&
                    "bg-wc-sky/10 font-medium",
                  linkToAnalysis && "cursor-pointer hover:bg-white/4",
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
                  <TeamLabel
                    team={entry.team}
                    showCode
                    flagSize="sm"
                    nameClassName="truncate font-medium text-white"
                  />
                </TableCell>
                <TableCell className="w-[1%] whitespace-nowrap px-4 py-3 text-center font-mono text-sm text-muted-foreground">
                  {common("group", { group: entry.team.group })}
                </TableCell>
                <TableCell className="w-[1%] whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                  {entry.team.confederation}
                </TableCell>
                <TableCell className="w-[1%] whitespace-nowrap px-4 py-3 text-right font-mono text-base font-semibold tabular-nums text-wc-orange">
                  {formatFifaPoints(entry.avgOpponentPoints)}
                </TableCell>
                <TableCell className="w-[1%] whitespace-nowrap px-4 py-3 text-right font-mono tabular-nums text-white">
                  {entry.avgOpponentRank !== null
                    ? entry.avgOpponentRank.toLocaleString(undefined, {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })
                    : "—"}
                </TableCell>
                <TableCell className="w-[1%] whitespace-nowrap px-4 py-3 text-center">
                  <Badge
                    variant="outline"
                    className={cn(
                      "min-w-[5.5rem] justify-center",
                      entry.isEliminated
                        ? "border-wc-red/30 bg-wc-red/20 text-wc-red"
                        : "border-wc-green/30 bg-wc-green/20 text-wc-green",
                    )}
                  >
                    {entry.isEliminated
                      ? summary("eliminated")
                      : summary("active")}
                  </Badge>
                </TableCell>
                {showDelta && (
                  <TableCell className="w-[1%] whitespace-nowrap px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
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

  const searchBar = (
    <div className="relative max-w-xs">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pr-3 pl-9 text-sm text-white outline-none placeholder:text-muted-foreground focus:border-wc-sky/40 focus:ring-1 focus:ring-wc-sky/30"
      />
    </div>
  );

  if (embedded) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>{subtitle}</p>
            {cohortHint && <p>{cohortHint}</p>}
          </div>
          {searchBar}
        </div>
        {entries.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {t("noTeams")}
          </p>
        ) : filteredEntries.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {t("noSearchResults")}
          </p>
        ) : (
          <>
            {table}
            <p className="text-right text-xs text-muted-foreground">
              {t("showingCount", {
                shown: filteredEntries.length,
                total: entries.length,
              })}
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-white/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {searchBar}
      </div>
      <div className="p-2">{table}</div>
    </div>
  );
}
