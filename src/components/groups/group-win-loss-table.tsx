"use client";

import { useMemo } from "react";
import type { GroupExpectedMatchEntry } from "@/lib/types";
import {
  FACTS_TABLE_PAGE_SIZE,
  usePaginatedRows,
} from "@/components/tables/use-paginated-rows";
import { FactsTablePagination } from "@/components/tables/facts-table-pagination";
import { FactsMatchCell } from "@/components/tables/facts-match-cell";
import { SortButton, type SortDirection } from "@/components/tables/sort-button";
import { TableSearchInput } from "@/components/tables/table-search-input";
import {
  useMatchSearch,
  type MatchSearchFields,
} from "@/components/tables/use-match-search";
import { usePersistedUiState } from "@/hooks/use-persisted-ui-state";
import { OVERVIEW_SORT_GROUP_WIN_LOSS_KEY } from "@/lib/client/overview-ui-preference";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface GroupWinLossTableProps {
  winLossMatches: GroupExpectedMatchEntry[];
}

function toSearchFields(entry: GroupExpectedMatchEntry): MatchSearchFields {
  return {
    teams: [entry.team1, entry.team2],
    scoreFt: entry.scoreLabel,
    scoreEt: null,
    decidedOnPenalties: false,
  };
}

export function GroupWinLossTable({
  winLossMatches,
}: GroupWinLossTableProps) {
  const t = useTranslations("home.groupExpectedFinishes");
  const tables = useTranslations("home.factsTables");
  const [gapSort, setGapSort] = usePersistedUiState<SortDirection>(
    OVERVIEW_SORT_GROUP_WIN_LOSS_KEY,
    "asc",
  );
  const { query, setQuery, filteredRows } = useMatchSearch(
    winLossMatches,
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

  if (winLossMatches.length === 0) return null;

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
        {hasActiveQuery && (
          <p className="text-xs text-muted-foreground sm:text-right">
            {tables("searchShowing", {
              shown: filteredRows.length,
              total: winLossMatches.length,
            })}
          </p>
        )}
      </div>

      {filteredRows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {tables("searchNoResults")}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/8 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <th className="px-3 py-2.5">{t("drawsColumnGroup")}</th>
                  <th className="px-3 py-2.5">{t("drawsColumnMatch")}</th>
                  <th className="px-3 py-2.5 text-right">{t("drawsColumnTeamAPts")}</th>
                  <th className="px-3 py-2.5 text-right">{t("drawsColumnTeamBPts")}</th>
                  <th className="px-3 py-2.5 text-right">
                    <SortButton active direction={gapSort} onClick={toggleGapSort}>
                      {t("drawsColumnGap")}
                    </SortButton>
                  </th>
                  <th className="px-3 py-2.5">{t("winLossColumnUpset")}</th>
                </tr>
              </thead>
              <tbody>
                {visibleMatches.map((entry) => (
                  <tr
                    key={`${entry.groupLetter}-${entry.team1.id}-${entry.team2.id}-${entry.scoreLabel}`}
                    className={cn(
                      "border-b border-white/6 last:border-b-0",
                      entry.upsetWin && "bg-wc-orange/10",
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
                      {entry.isWinLossGapOutlier ? (
                        <span className="inline-flex rounded-md border border-wc-orange/40 bg-wc-orange/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-wc-orange">
                          {t("upsetWinBadge")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-1">
            {filteredRows.some((entry) => entry.upsetWin) && (
              <p className="text-xs text-muted-foreground">
                {t("winLossTableUnderdogHint")}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {t("winLossTableUpsetHint")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("winLossTableGapHint")}
            </p>
          </div>

          {showPagination && (
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
          )}
        </>
      )}
    </div>
  );
}
