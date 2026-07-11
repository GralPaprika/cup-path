"use client";

import type { MatchDifficulty, PathStage } from "@/lib/types";
import { getMatchStage } from "@/lib/domain/match-stages";
import { useTranslations } from "next-intl";
import { TeamLabel } from "@/components/team-flag";
import { Badge } from "@/components/ui/badge";
import {
  matchResultBadgeClass,
  matchResultRowClass,
} from "@/components/match-result-label";
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

export function PathTable({ matches, includedStages }: PathTableProps) {
  const t = useTranslations("pathTable");
  const results = useTranslations("results");

  function isIncluded(match: MatchDifficulty): boolean {
    if (!includedStages) return true;
    const stage = getMatchStage(match.round);
    return stage !== null && includedStages.has(stage);
  }

  return (
    <div className="glass-panel overflow-hidden">
      <div className="border-b border-white/8 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
      </div>
      <div className="overflow-x-auto">
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
                    <TeamLabel team={match.opponent} showCode flagSize="sm" />
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
                    {match.isPlayed && match.result ? (
                      <Badge
                        variant="outline"
                        className={matchResultBadgeClass(match.result)}
                      >
                        {results(match.result)} {match.scoreLabel}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className={
                          match.isNext
                            ? "border-wc-orange/40 bg-wc-orange/15 text-wc-orange"
                            : "border-white/15 bg-white/5 text-muted-foreground"
                        }
                      >
                        {match.isNext ? `→ ${t("upcoming")}` : t("upcoming")}
                      </Badge>
                    )}
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
