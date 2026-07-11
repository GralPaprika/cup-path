"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { GroupExpectedMatchEntry } from "@/lib/types";
import { TeamFlag } from "@/components/team-flag";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const PAGE_SIZE = 10;

interface GroupWinLossTableProps {
  winLossMatches: GroupExpectedMatchEntry[];
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
  entry,
  mode,
}: {
  entry: GroupExpectedMatchEntry;
  mode: string;
}) {
  const t = useTranslations("home.groupExpectedFinishes");

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Link
        href={`/team-analysis?team=${entry.team1.id}&mode=${mode}`}
        className="inline-flex items-center gap-1 transition-colors hover:text-wc-sky"
      >
        <TeamFlag team={entry.team1} size="sm" />
        <span className="font-mono font-semibold">{entry.team1.id}</span>
      </Link>
      <span className="font-mono tabular-nums text-muted-foreground">
        {entry.scoreLabel}
      </span>
      <Link
        href={`/team-analysis?team=${entry.team2.id}&mode=${mode}`}
        className="inline-flex items-center gap-1 transition-colors hover:text-wc-sky"
      >
        <TeamFlag team={entry.team2} size="sm" />
        <span className="font-mono font-semibold">{entry.team2.id}</span>
      </Link>
      <span className="sr-only">{t("vs")}</span>
    </div>
  );
}

export function GroupWinLossTable({
  winLossMatches,
  mode,
}: GroupWinLossTableProps) {
  const t = useTranslations("home.groupExpectedFinishes");
  const [gapSort, setGapSort] = useState<GapSortDirection>("asc");
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [winLossMatches, gapSort]);

  const sortedMatches = useMemo(() => {
    const sorted = [...winLossMatches];
    sorted.sort((a, b) =>
      gapSort === "desc"
        ? b.gapPoints - a.gapPoints
        : a.gapPoints - b.gapPoints,
    );
    return sorted;
  }, [winLossMatches, gapSort]);

  const totalPages = Math.max(1, Math.ceil(sortedMatches.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageStart = safePage * PAGE_SIZE;
  const visibleMatches = sortedMatches.slice(pageStart, pageStart + PAGE_SIZE);

  if (winLossMatches.length === 0) return null;

  const toggleGapSort = () => {
    setGapSort((current) => (current === "desc" ? "asc" : "desc"));
  };

  return (
    <div className="space-y-3">
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
                  <MatchCell entry={entry} mode={mode} />
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
        {winLossMatches.some((entry) => entry.upsetWin) && (
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

      {sortedMatches.length > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            {t("drawsTablePageInfo", {
              start: pageStart + 1,
              end: Math.min(pageStart + PAGE_SIZE, sortedMatches.length),
              total: sortedMatches.length,
            })}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              className="rounded-md border border-white/10 px-2.5 py-1 font-medium text-white transition-colors enabled:hover:border-white/20 enabled:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("drawsTablePrev")}
            </button>
            <span className="font-mono tabular-nums">
              {t("drawsTablePageCount", {
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
              {t("drawsTableNext")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
