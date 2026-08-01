"use client";

import type { MatchDifficulty, PathStage } from "@/lib/types";
import { getMatchStage } from "@/lib/domain/match/match-stages";
import { useTranslations } from "next-intl";
import { TeamLabel } from "@/components/team/team-flag";
import { TeamTierBadge } from "@/components/team/team-tier-badge";
import { Badge } from "@/components/ui/badge";
import {
  matchResultBadgeClass,
  matchResultRowClass,
} from "@/components/shared/match-result-label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatFifaPoints } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PathTableProps {
  matches: MatchDifficulty[];
  includedStages?: Set<PathStage>;
}

function formatRankGap(value: number | null): string {
  if (value === null) return "—";
  return value > 0 ? `+${value}` : `${value}`;
}

function formatPointsGap(value: number | null): string {
  if (value === null) return "—";
  const formatted = formatFifaPoints(Math.abs(value));
  return value > 0 ? `+${formatted}` : `-${formatted}`;
}

function rankGapColor(value: number | null): string {
  if (value === null) return "text-muted-foreground";
  if (value < 0) return "text-wc-red font-semibold";
  if (value > 10) return "text-wc-green font-semibold";
  return "text-muted-foreground";
}

function pointsGapColor(value: number | null): string {
  if (value === null) return "text-muted-foreground";
  if (value > 25) return "text-wc-red font-semibold";
  if (value < -25) return "text-wc-green font-semibold";
  return "text-muted-foreground";
}

function rowTint(result: MatchDifficulty["result"], isPlayed: boolean): string {
  if (!isPlayed || !result) return "";
  return matchResultRowClass(result);
}

function MatchResultBadge({
  match,
  upcomingLabel,
  results,
}: {
  match: MatchDifficulty;
  upcomingLabel: string;
  results: (key: string) => string;
}) {
  if (match.isPlayed && match.result) {
    return (
      <Badge
        variant="outline"
        className={cn(
          matchResultBadgeClass(match.result),
          "flex flex-col items-end gap-0 leading-tight",
          match.scorePensLabel && "h-auto whitespace-normal py-1",
        )}
      >
        <span>
          {results(match.result)} {match.scoreLabel}
        </span>
        {match.scorePensLabel ? (
          <span className="text-[10px] font-normal opacity-90">
            {match.scorePensLabel}
          </span>
        ) : null}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={
        match.isNext
          ? "border-wc-orange/40 bg-wc-orange/15 text-wc-orange"
          : "border-white/15 bg-white/5 text-muted-foreground"
      }
    >
      {match.isNext ? `→ ${upcomingLabel}` : upcomingLabel}
    </Badge>
  );
}

export function PathTable({ matches, includedStages }: PathTableProps) {
  const t = useTranslations("pathTable");
  const results = useTranslations("results");

  function isIncluded(match: MatchDifficulty): boolean {
    if (!includedStages) return true;
    const stage = getMatchStage(match.round);
    return stage !== null && includedStages.has(stage);
  }

  return (
    <div className="glass-panel min-w-0 overflow-hidden">
      <div className="border-b border-white/8 px-4 py-4 sm:px-5">
        <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
      </div>

      <ul className="divide-y divide-white/6 md:hidden">
        {matches.map((match) => {
          const included = isIncluded(match);

          return (
            <li
              key={`${match.date}-${match.opponent.id}-${match.round}`}
              className={cn(
                "space-y-2 px-4 py-3 transition-colors",
                rowTint(match.result, match.isPlayed),
                match.isNext &&
                  included &&
                  "bg-wc-orange/8 ring-1 ring-inset ring-wc-orange/35",
                !included && "opacity-35",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-white">{match.round}</div>
                  <div className="text-xs text-muted-foreground">{match.date}</div>
                </div>
                <MatchResultBadge
                  match={match}
                  upcomingLabel={t("upcoming")}
                  results={results}
                />
              </div>

              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <TeamLabel
                  team={match.opponent}
                  showCode
                  flagSize="sm"
                  href={`/?team=${match.opponent.id}`}
                  nameClassName="text-white hover:text-wc-sky"
                />
                {match.opponentPoints !== null ? (
                  <TeamTierBadge
                    points={match.opponentPoints}
                    size="sm"
                  />
                ) : null}
              </div>

              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs text-muted-foreground">{t("points")}</span>
                <span className="font-mono text-sm text-wc-orange">
                  {match.opponentPoints !== null
                    ? formatFifaPoints(match.opponentPoints)
                    : t("noData")}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="hidden min-w-0 overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-white/8 hover:bg-transparent">
              <TableHead className="text-muted-foreground">{t("round")}</TableHead>
              <TableHead className="text-muted-foreground">{t("opponent")}</TableHead>
              <TableHead className="text-right text-muted-foreground">
                {t("points")}
              </TableHead>
              <TableHead className="text-right text-muted-foreground">
                {t("pointsGap")}
              </TableHead>
              <TableHead className="text-right text-muted-foreground">
                {t("rank")}
              </TableHead>
              <TableHead className="text-right text-muted-foreground">
                {t("rankGap")}
              </TableHead>
              <TableHead className="text-right text-muted-foreground">
                {t("result")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match) => {
              const included = isIncluded(match);

              return (
                <TableRow
                  key={`${match.date}-${match.opponent.id}-${match.round}`}
                  className={cn(
                    "border-white/6 transition-colors",
                    rowTint(match.result, match.isPlayed),
                    match.isNext &&
                      included &&
                      "bg-wc-orange/8 ring-1 ring-inset ring-wc-orange/35",
                    !included && "opacity-35",
                  )}
                >
                  <TableCell>
                    <div className="font-medium text-white">{match.round}</div>
                    <div className="text-xs text-muted-foreground">{match.date}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <TeamLabel
                        team={match.opponent}
                        showCode
                        flagSize="sm"
                        href={`/?team=${match.opponent.id}`}
                        nameClassName="text-white hover:text-wc-sky"
                      />
                      {match.opponentPoints !== null ? (
                        <TeamTierBadge
                          points={match.opponentPoints}
                          size="sm"
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-wc-orange">
                    {match.opponentPoints !== null
                      ? formatFifaPoints(match.opponentPoints)
                      : t("noData")}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono text-sm",
                      pointsGapColor(match.pointsGap),
                    )}
                  >
                    {formatPointsGap(match.pointsGap)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-white">
                    {match.opponentRank !== null ? `#${match.opponentRank}` : "—"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono text-sm",
                      rankGapColor(match.rankGap),
                    )}
                  >
                    {formatRankGap(match.rankGap)}
                  </TableCell>
                  <TableCell className="text-right">
                    <MatchResultBadge
                      match={match}
                      upcomingLabel={t("upcoming")}
                      results={results}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
