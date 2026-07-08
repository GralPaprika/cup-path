"use client";

import type { ComparisonEntry } from "@/lib/types";
import { useTranslations } from "next-intl";
import { TeamLabel } from "@/components/team-flag";
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

interface ComparisonChartProps {
  entries: ComparisonEntry[];
  selectedTeamId?: string;
  showDelta?: boolean;
}

function formatDelta(value: number | null): string {
  if (value === null) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatFifaPoints(Math.abs(value))}`;
}

export function ComparisonChart({
  entries,
  selectedTeamId,
  showDelta = false,
}: ComparisonChartProps) {
  const t = useTranslations("compare");
  const summary = useTranslations("summary");
  const maxPoints = Math.max(
    ...entries.map((entry) => entry.avgOpponentPoints ?? 0),
    1,
  );

  return (
    <Card className="border-emerald-200/60 shadow-sm">
      <CardHeader className="border-b bg-emerald-50/50">
        <CardTitle className="text-emerald-950">{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="hidden gap-3 lg:grid">
          {entries.slice(0, 8).map((entry) => {
            const width = ((entry.avgOpponentPoints ?? 0) / maxPoints) * 100;
            const isSelected = entry.team.id === selectedTeamId;
            return (
              <div key={entry.team.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className={cn(isSelected && "font-bold text-emerald-800")}>
                    <TeamLabel team={entry.team} showCode={false} flagSize="sm" />
                  </span>
                  <span className="font-mono font-medium">
                    {formatFifaPoints(entry.avgOpponentPoints)}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isSelected ? "bg-amber-400" : "bg-emerald-600",
                    )}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>#</TableHead>
                <TableHead>{t("team")}</TableHead>
                <TableHead className="text-right">{t("avgPoints")}</TableHead>
                <TableHead className="text-right">{t("avgRank")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                {showDelta && (
                  <TableHead className="text-right">{t("delta")}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow
                  key={entry.team.id}
                  className={cn(
                    entry.team.id === selectedTeamId &&
                      "bg-amber-50/80 font-medium",
                  )}
                >
                  <TableCell className="font-mono text-muted-foreground">
                    {entry.rankAmongTeams}
                  </TableCell>
                  <TableCell>
                    <TeamLabel team={entry.team} showCode flagSize="sm" />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatFifaPoints(entry.avgOpponentPoints)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {entry.avgOpponentRank !== null
                      ? Math.round(entry.avgOpponentRank).toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={entry.isEliminated ? "destructive" : "default"}
                      className={
                        entry.isEliminated
                          ? ""
                          : "bg-emerald-600 text-white hover:bg-emerald-600"
                      }
                    >
                      {entry.isEliminated ? summary("eliminated") : summary("active")}
                    </Badge>
                  </TableCell>
                  {showDelta && (
                    <TableCell className="text-right font-mono">
                      {formatDelta(entry.deltaVsSelected)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
