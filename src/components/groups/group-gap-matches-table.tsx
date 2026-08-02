"use client";

import { useMemo, type ReactNode } from "react";
import type { GroupExpectedMatchEntry } from "@/lib/types";
import {
  FACTS_TABLE_PAGE_SIZE,
  usePaginatedRows,
} from "@/components/tables/use-paginated-rows";
import { FactsTablePagination } from "@/components/tables/facts-table-pagination";
import { GroupGapMatchMobileRow } from "@/components/groups/group-gap-match-mobile-row";
import { FactsMatchCell } from "@/components/tables/facts-match-cell";
import { SortButton, type SortDirection } from "@/components/tables/sort-button";
import { TableSearchInput } from "@/components/tables/table-search-input";
import {
  useMatchSearch,
  type MatchSearchFields,
} from "@/components/tables/use-match-search";
import { usePersistedUiState } from "@/hooks/use-persisted-ui-state";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function GroupGapOutlierBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-md border border-wc-orange/40 bg-wc-orange/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-wc-orange">
      {label}
    </span>
  );
}

interface GroupGapMatchesTableProps {
  matches: GroupExpectedMatchEntry[];
  sortStorageKey: string;
  defaultSort: SortDirection;
  outlierColumnLabel: string;
  getHighlightClassName: (entry: GroupExpectedMatchEntry) => string | undefined;
  getBadgeLabel: (entry: GroupExpectedMatchEntry) => string | null;
  footer?: (ctx: {
    filteredRows: GroupExpectedMatchEntry[];
  }) => ReactNode;
}

function toSearchFields(entry: GroupExpectedMatchEntry): MatchSearchFields {
  return {
    teams: [entry.team1, entry.team2],
    scoreFt: entry.scoreLabel,
    scoreEt: null,
    decidedOnPenalties: false,
  };
}

function entryKey(entry: GroupExpectedMatchEntry): string {
  return `${entry.groupLetter}-${entry.team1.id}-${entry.team2.id}-${entry.scoreLabel}`;
}

export function GroupGapMatchesTable({
  matches,
  sortStorageKey,
  defaultSort,
  outlierColumnLabel,
  getHighlightClassName,
  getBadgeLabel,
  footer,
}: GroupGapMatchesTableProps) {
  const t = useTranslations("home.groupExpectedFinishes");
  const tables = useTranslations("home.factsTables");
  const [gapSort, setGapSort] = usePersistedUiState<SortDirection>(
    sortStorageKey,
    defaultSort,
  );
  const { query, setQuery, filteredRows } = useMatchSearch(
    matches,
    toSearchFields,
  );

  const sortedMatches = useMemo(() => {
    const sorted = [...filteredRows];
    sorted.sort((a, b) =>
      gapSort === "desc"
        ? b.gapPoints - a.gapPoints
        : a.gapPoints - b.gapPoints,
    );
    return sorted;
  }, [filteredRows, gapSort]);

  const {
    visibleRows: visibleMatches,
    pageStart,
    safePage,
    totalPages,
    showPagination,
    prevPage,
    nextPage,
  } = usePaginatedRows(sortedMatches, FACTS_TABLE_PAGE_SIZE, gapSort);

  if (matches.length === 0) return null;

  const toggleGapSort = () => {
    setGapSort((current) => (current === "desc" ? "asc" : "desc"));
  };

  const hasActiveQuery = query.trim().length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <TableSearchInput
          value={query}
          onChange={setQuery}
          placeholder={tables("searchPlaceholder")}
          label={tables("searchLabel")}
        />
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <div className="md:hidden">
            <SortButton active direction={gapSort} onClick={toggleGapSort}>
              {t("drawsColumnGap")}
            </SortButton>
          </div>
          {hasActiveQuery && (
            <p className="text-xs text-muted-foreground sm:text-right">
              {tables("searchShowing", {
                shown: filteredRows.length,
                total: matches.length,
              })}
            </p>
          )}
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {tables("searchNoResults")}
        </p>
      ) : (
        <>
          <ul className="divide-y divide-white/6 rounded-xl border border-white/8 md:hidden">
            {visibleMatches.map((entry) => {
              const badgeLabel = getBadgeLabel(entry);

              return (
                <GroupGapMatchMobileRow
                  key={entryKey(entry)}
                  team1={entry.team1}
                  team2={entry.team2}
                  scoreLabel={entry.scoreLabel}
                  team1FifaPoints={entry.team1FifaPoints}
                  team2FifaPoints={entry.team2FifaPoints}
                  gapPoints={entry.gapPoints}
                  groupLetter={entry.groupLetter}
                  vsLabel={t("vs")}
                  gapLabel={t("drawsColumnGap")}
                  highlightClassName={getHighlightClassName(entry)}
                  badge={
                    badgeLabel ? (
                      <GroupGapOutlierBadge label={badgeLabel} />
                    ) : null
                  }
                />
              );
            })}
          </ul>

          <div className="scrollbar-subtle hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/8 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <th className="px-3 py-2.5">{t("drawsColumnGroup")}</th>
                  <th className="px-3 py-2.5">{t("drawsColumnMatch")}</th>
                  <th className="px-3 py-2.5 text-right">
                    {t("drawsColumnTeamAPts")}
                  </th>
                  <th className="px-3 py-2.5 text-right">
                    {t("drawsColumnTeamBPts")}
                  </th>
                  <th className="px-3 py-2.5 text-right">
                    <SortButton
                      active
                      direction={gapSort}
                      onClick={toggleGapSort}
                    >
                      {t("drawsColumnGap")}
                    </SortButton>
                  </th>
                  <th className="px-3 py-2.5">{outlierColumnLabel}</th>
                </tr>
              </thead>
              <tbody>
                {visibleMatches.map((entry) => {
                  const badgeLabel = getBadgeLabel(entry);

                  return (
                    <tr
                      key={entryKey(entry)}
                      className={cn(
                        "border-b border-white/6 last:border-b-0",
                        getHighlightClassName(entry),
                      )}
                    >
                      <td className="px-3 py-2.5 font-mono text-muted-foreground">
                        {entry.groupLetter}
                      </td>
                      <td className="px-3 py-2.5">
                        <FactsMatchCell
                          team1={entry.team1}
                          team2={entry.team2}
                          vsLabel={t("vs")}
                          score={
                            <span className="font-mono tabular-nums text-muted-foreground">
                              {entry.scoreLabel}
                            </span>
                          }
                        />
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                        {formatFifaPoints(entry.team1FifaPoints)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                        {formatFifaPoints(entry.team2FifaPoints)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums text-wc-orange">
                        {formatFifaPoints(entry.gapPoints)}
                      </td>
                      <td className="px-3 py-2.5">
                        {badgeLabel ? (
                          <GroupGapOutlierBadge label={badgeLabel} />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3">
            {(() => {
              const footerContent = footer?.({ filteredRows }) ?? null;
              return footerContent ? (
                <div className="order-2 md:order-1">{footerContent}</div>
              ) : null;
            })()}

            {showPagination && (
              <div className="order-1 md:order-2">
                <FactsTablePagination
                  pageSize={FACTS_TABLE_PAGE_SIZE}
                  totalItems={sortedMatches.length}
                  safePage={safePage}
                  totalPages={totalPages}
                  onPrev={prevPage}
                  onNext={nextPage}
                  pageInfo={t("drawsTablePageInfo", {
                    start: pageStart + 1,
                    end: Math.min(
                      pageStart + FACTS_TABLE_PAGE_SIZE,
                      sortedMatches.length,
                    ),
                    total: sortedMatches.length,
                  })}
                  pageCount={t("drawsTablePageCount", {
                    page: safePage + 1,
                    totalPages,
                  })}
                  prevLabel={t("drawsTablePrev")}
                  nextLabel={t("drawsTableNext")}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
