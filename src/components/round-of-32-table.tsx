"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { Round32FixtureEntry } from "@/lib/types";
import { TeamFlag } from "@/components/team-flag";
import { MatchScoreBreakdown } from "@/components/match-score-breakdown";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const PAGE_SIZE = 10;

interface RoundOf32TableProps {
  fixtures: Round32FixtureEntry[];
  mode: string;
}

type GapSortDirection = "desc" | "asc";

function SortButton({
  active,
  direction,
  onClick,
  children,
}: {
  active: boolean;
  direction: GapSortDirection;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium transition-colors",
        active
          ? "bg-wc-sky/15 text-wc-sky"
          : "text-muted-foreground hover:bg-white/6 hover:text-white",
      )}
    >
      {children}
      {active &&
        (direction === "desc" ? (
          <ArrowDown className="size-3 shrink-0" />
        ) : (
          <ArrowUp className="size-3 shrink-0" />
        ))}
    </button>
  );
}

function MatchCell({
  fixture,
  mode,
}: {
  fixture: Round32FixtureEntry;
  mode: string;
}) {
  const t = useTranslations("home.groupExpectedFinishes");

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Link
        href={`/team-analysis?team=${fixture.team1.id}&mode=${mode}`}
        className="inline-flex items-center gap-1 transition-colors hover:text-wc-sky"
      >
        <TeamFlag team={fixture.team1} size="sm" />
        <span className="font-mono font-semibold">{fixture.team1.id}</span>
      </Link>
      <MatchScoreBreakdown
        ft={fixture.scoreFt}
        et={fixture.scoreEt}
        pens={fixture.scorePens}
      />
      <Link
        href={`/team-analysis?team=${fixture.team2.id}&mode=${mode}`}
        className="inline-flex items-center gap-1 transition-colors hover:text-wc-sky"
      >
        <TeamFlag team={fixture.team2} size="sm" />
        <span className="font-mono font-semibold">{fixture.team2.id}</span>
      </Link>
      <span className="sr-only">{t("vs")}</span>
    </div>
  );
}

export function RoundOf32Table({ fixtures, mode }: RoundOf32TableProps) {
  const t = useTranslations("home.roundOf32");
  const shared = useTranslations("home.groupExpectedFinishes");
  const [gapSort, setGapSort] = useState<GapSortDirection>("asc");
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [fixtures, gapSort]);

  const sortedFixtures = useMemo(() => {
    const sorted = [...fixtures];
    sorted.sort((a, b) =>
      gapSort === "desc"
        ? b.gapPoints - a.gapPoints
        : a.gapPoints - b.gapPoints,
    );
    return sorted;
  }, [fixtures, gapSort]);

  const totalPages = Math.max(1, Math.ceil(sortedFixtures.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageStart = safePage * PAGE_SIZE;
  const visibleFixtures = sortedFixtures.slice(
    pageStart,
    pageStart + PAGE_SIZE,
  );

  if (fixtures.length === 0) return null;

  const toggleGapSort = () => {
    setGapSort((current) => (current === "desc" ? "asc" : "desc"));
  };

  return (
    <div className="space-y-3">
      <div className="scrollbar-subtle max-w-full overflow-x-auto overscroll-x-contain pb-1">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/8 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <th className="px-3 py-2.5">{t("columnMatch")}</th>
              <th className="px-3 py-2.5">{shared("drawsColumnMatch")}</th>
              <th className="px-3 py-2.5 text-right">
                {shared("drawsColumnTeamAPts")}
              </th>
              <th className="px-3 py-2.5 text-right">
                {shared("drawsColumnTeamBPts")}
              </th>
              <th className="px-3 py-2.5 text-right">
                <SortButton active direction={gapSort} onClick={toggleGapSort}>
                  {shared("drawsColumnGap")}
                </SortButton>
              </th>
              <th className="px-3 py-2.5">{shared("winLossColumnUpset")}</th>
              <th className="px-3 py-2.5">{t("columnQualified")}</th>
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
                key={`${fixture.matchNum ?? fixture.date}-${fixture.team1.id}-${fixture.team2.id}-${fixture.scoreFt}-${fixture.scoreEt ?? ""}-${fixture.scorePens ?? ""}`}
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
                  <MatchCell fixture={fixture} mode={mode} />
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
                      {shared("upsetWinBadge")}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <Link
                    href={`/team-analysis?team=${winner.id}&mode=${mode}`}
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
        {fixtures.some((fixture) => fixture.upsetWin) && (
          <p className="text-xs text-muted-foreground">
            {shared("winLossTableUnderdogHint")}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {shared("winLossTableUpsetHint")}
        </p>
      </div>

      {sortedFixtures.length > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            {shared("drawsTablePageInfo", {
              start: pageStart + 1,
              end: Math.min(pageStart + PAGE_SIZE, sortedFixtures.length),
              total: sortedFixtures.length,
            })}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              className="rounded-md border border-white/10 px-2.5 py-1 font-medium text-white transition-colors enabled:hover:border-white/20 enabled:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {shared("drawsTablePrev")}
            </button>
            <span className="font-mono tabular-nums">
              {shared("drawsTablePageCount", {
                page: safePage + 1,
                totalPages,
              })}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages - 1}
              onClick={() =>
                setPage((current) => Math.min(totalPages - 1, current + 1))
              }
              className="rounded-md border border-white/10 px-2.5 py-1 font-medium text-white transition-colors enabled:hover:border-white/20 enabled:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {shared("drawsTableNext")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
