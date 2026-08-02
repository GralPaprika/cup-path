"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { KnockoutFixtureEntry } from "@/lib/types";
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
import { TeamFlag } from "@/components/team/team-flag";
import { MatchScoreBreakdown } from "@/components/path/match-score-breakdown";
import { usePersistedUiState } from "@/hooks/use-persisted-ui-state";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface KnockoutStageTableProps {
  fixtures: KnockoutFixtureEntry[];
  sortPersistKey: string;
}

function toSearchFields(fixture: KnockoutFixtureEntry): MatchSearchFields {
  return {
    teams: [fixture.team1, fixture.team2],
    scoreFt: fixture.scoreFt,
    scoreEt: fixture.scoreEt,
    decidedOnPenalties: fixture.scorePens !== null,
  };
}

function fixtureKey(fixture: KnockoutFixtureEntry): string {
  return `${fixture.matchNum ?? fixture.date}-${fixture.team1.id}-${fixture.team2.id}-${fixture.scoreFt}-${fixture.scoreEt ?? ""}-${fixture.scorePens ?? ""}`;
}

export function KnockoutStageTable({
  fixtures,
  sortPersistKey,
}: KnockoutStageTableProps) {
  const shared = useTranslations("home.knockoutStage");
  const tables = useTranslations("home.factsTables");
  const [gapSort, setGapSort] = usePersistedUiState<SortDirection>(
    sortPersistKey,
    "asc",
  );
  const { query, setQuery, filteredRows } = useMatchSearch(
    fixtures,
    toSearchFields,
  );

  const sortedFixtures = useMemo(() => {
    const sorted = [...filteredRows];
    sorted.sort((a, b) =>
      gapSort === "desc"
        ? b.gapPoints - a.gapPoints
        : a.gapPoints - b.gapPoints,
    );
    return sorted;
  }, [filteredRows, gapSort]);

  const {
    visibleRows: visibleFixtures,
    pageStart,
    safePage,
    totalPages,
    showPagination,
    prevPage,
    nextPage,
  } = usePaginatedRows(sortedFixtures, FACTS_TABLE_PAGE_SIZE, gapSort);

  if (fixtures.length === 0) return null;

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
          placeholder={tables("searchPlaceholderKnockout")}
          label={tables("searchLabel")}
        />
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <div className="md:hidden">
            <SortButton active direction={gapSort} onClick={toggleGapSort}>
              {tables("columnGap")}
            </SortButton>
          </div>
          {hasActiveQuery && (
            <p className="text-xs text-muted-foreground sm:text-right">
              {tables("searchShowing", {
                shown: filteredRows.length,
                total: fixtures.length,
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
            {visibleFixtures.map((fixture) => {
              const winner =
                fixture.winnerTeamId === fixture.team1.id
                  ? fixture.team1
                  : fixture.team2;

              return (
                <li
                  key={fixtureKey(fixture)}
                  className={cn(
                    "space-y-1 px-2 py-1.5",
                    fixture.upsetWin && "bg-wc-orange/10",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-mono text-xs text-muted-foreground">
                      {fixture.matchNum !== null ? `#${fixture.matchNum}` : "—"}
                      <span className="ml-2 text-[10px]">{fixture.date}</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {fixture.isGapOutlier ? (
                        <span className="inline-flex rounded-md border border-wc-orange/40 bg-wc-orange/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-wc-orange">
                          {tables("upsetBadge")}
                        </span>
                      ) : null}
                      <Link
                        href={`/?team=${winner.id}`}
                        className="inline-flex items-center gap-1.5 transition-colors hover:text-wc-sky"
                      >
                        <TeamFlag team={winner} size="sm" />
                        <span className="font-mono text-xs font-semibold text-wc-green">
                          {winner.id}
                        </span>
                      </Link>
                    </div>
                  </div>
                  <FactsMatchCell
                    team1={fixture.team1}
                    team2={fixture.team2}
                    vsLabel={tables("vs")}
                    score={
                      <MatchScoreBreakdown
                        ft={fixture.scoreFt}
                        et={fixture.scoreEt}
                        pens={fixture.scorePens}
                      />
                    }
                  />
                  <dl className="grid grid-cols-3 gap-1.5 text-[11px]">
                    <div>
                      <dt className="text-muted-foreground">
                        {fixture.team1.id}
                      </dt>
                      <dd className="font-mono tabular-nums text-muted-foreground">
                        {formatFifaPoints(fixture.team1FifaPoints)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        {fixture.team2.id}
                      </dt>
                      <dd className="font-mono tabular-nums text-muted-foreground">
                        {formatFifaPoints(fixture.team2FifaPoints)}
                      </dd>
                    </div>
                    <div className="text-right">
                      <dt className="text-muted-foreground">
                        {tables("columnGap")}
                      </dt>
                      <dd className="font-mono tabular-nums text-wc-orange">
                        {formatFifaPoints(fixture.gapPoints)}
                      </dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ul>

          <div className="scrollbar-subtle hidden max-w-full overflow-x-auto overscroll-x-contain pb-1 md:block">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/8 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <th className="px-3 py-2.5">{shared("columnMatch")}</th>
                  <th className="px-3 py-2.5">{tables("columnMatch")}</th>
                  <th className="px-3 py-2.5 text-right">{tables("columnTeamAPts")}</th>
                  <th className="px-3 py-2.5 text-right">{tables("columnTeamBPts")}</th>
                  <th className="px-3 py-2.5 text-right">
                    <SortButton active direction={gapSort} onClick={toggleGapSort}>
                      {tables("columnGap")}
                    </SortButton>
                  </th>
                  <th className="px-3 py-2.5">{tables("columnUpset")}</th>
                  <th className="px-3 py-2.5">{shared("columnQualified")}</th>
                </tr>
              </thead>
              <tbody>
                {visibleFixtures.map((fixture) => {
                  const winner =
                    fixture.winnerTeamId === fixture.team1.id
                      ? fixture.team1
                      : fixture.team2;

                  return (
                    <tr
                      key={fixtureKey(fixture)}
                      className={cn(
                        "border-b border-white/6 last:border-b-0",
                        fixture.upsetWin && "bg-wc-orange/10",
                      )}
                    >
                      <td className="px-3 py-2.5 font-mono text-muted-foreground">
                        {fixture.matchNum !== null ? `#${fixture.matchNum}` : "—"}
                        <div className="text-[10px]">{fixture.date}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        <FactsMatchCell
                          team1={fixture.team1}
                          team2={fixture.team2}
                          vsLabel={tables("vs")}
                          score={
                            <MatchScoreBreakdown
                              ft={fixture.scoreFt}
                              et={fixture.scoreEt}
                              pens={fixture.scorePens}
                            />
                          }
                        />
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                        {formatFifaPoints(fixture.team1FifaPoints)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                        {formatFifaPoints(fixture.team2FifaPoints)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums text-wc-orange">
                        {formatFifaPoints(fixture.gapPoints)}
                      </td>
                      <td className="px-3 py-2.5">
                        {fixture.isGapOutlier ? (
                          <span className="inline-flex rounded-md border border-wc-orange/40 bg-wc-orange/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-wc-orange">
                            {tables("upsetBadge")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <Link
                          href={`/?team=${winner.id}`}
                          className="inline-flex items-center gap-1.5 transition-colors hover:text-wc-sky"
                        >
                          <TeamFlag team={winner} size="sm" />
                          <span className="font-mono font-semibold text-wc-green">
                            {winner.id}
                          </span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-1">
            {filteredRows.some((fixture) => fixture.upsetWin) && (
              <p className="text-xs text-muted-foreground">
                {tables("underdogRowHint")}
              </p>
            )}
            <p className="text-xs text-muted-foreground">{tables("upsetRowHint")}</p>
          </div>

          {showPagination && (
            <FactsTablePagination
              pageSize={FACTS_TABLE_PAGE_SIZE}
              totalItems={sortedFixtures.length}
              safePage={safePage}
              totalPages={totalPages}
              onPrev={prevPage}
              onNext={nextPage}
              pageInfo={tables("pageInfo", {
                start: pageStart + 1,
                end: Math.min(
                  pageStart + FACTS_TABLE_PAGE_SIZE,
                  sortedFixtures.length,
                ),
                total: sortedFixtures.length,
              })}
              pageCount={tables("pageCount", {
                page: safePage + 1,
                totalPages,
              })}
              prevLabel={tables("prev")}
              nextLabel={tables("next")}
            />
          )}
        </>
      )}
    </div>
  );
}
