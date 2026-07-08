"use client";

import type { MatchDifficulty } from "@/lib/types";
import { useTranslations } from "next-intl";
import { TeamLabel } from "@/components/team-flag";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
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

interface PathTableProps {
  matches: MatchDifficulty[];
}

function formatGap(value: number | null): string {
  if (value === null) return "—";
  return value > 0 ? `+${value}` : `${value}`;
}

function gapColor(value: number | null): string {
  if (value === null) return "";
  if (value < 0) return "text-red-600 font-semibold";
  if (value > 10) return "text-emerald-600 font-semibold";
  return "";
}

function resultVariant(result: MatchDifficulty["result"]) {
  if (result === "W") return "default" as const;
  if (result === "L") return "destructive" as const;
  return "secondary" as const;
}

export function PathTable({ matches }: PathTableProps) {
  const t = useTranslations("pathTable");
  const results = useTranslations("results");

  return (
    <Card className="border-emerald-200/60 shadow-sm">
      <CardHeader className="border-b bg-emerald-50/50">
        <CardTitle className="text-emerald-950">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>{t("round")}</TableHead>
              <TableHead>{t("opponent")}</TableHead>
              <TableHead className="text-right">{t("points")}</TableHead>
              <TableHead className="text-right">{t("rank")}</TableHead>
              <TableHead className="text-right">{t("rankGap")}</TableHead>
              <TableHead className="text-right">{t("result")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match) => (
              <TableRow
                key={`${match.date}-${match.opponent.id}-${match.round}`}
                className={match.isNext ? "bg-amber-50/80" : undefined}
              >
                <TableCell>
                  <div className="font-medium">{match.round}</div>
                  <div className="text-xs text-muted-foreground">{match.date}</div>
                </TableCell>
                <TableCell>
                  <TeamLabel team={match.opponent} showCode flagSize="sm" />
                </TableCell>
                <TableCell className="text-right font-mono">
                  {match.opponentPoints?.toLocaleString() ?? t("noData")}
                </TableCell>
                <TableCell className="text-right font-mono">
                  #{match.opponentRank ?? t("noData")}
                </TableCell>
                <TableCell className={`text-right font-mono ${gapColor(match.rankGap)}`}>
                  {formatGap(match.rankGap)}
                </TableCell>
                <TableCell className="text-right">
                  {match.isPlayed && match.result ? (
                    <Badge
                      variant={resultVariant(match.result)}
                      className={
                        match.result === "W"
                          ? "bg-emerald-600 text-white hover:bg-emerald-600"
                          : undefined
                      }
                    >
                      {results(match.result)} {match.scoreLabel}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-400 text-amber-700">
                      {match.isNext ? `→ ${t("upcoming")}` : t("upcoming")}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
