"use client";

import { useRouter } from "next/navigation";
import type {
  GroupComparisonCard,
  GroupQualificationStatus,
  RankingMode,
} from "@/lib/types";
import { useTranslations } from "next-intl";
import { TeamLabel } from "@/components/team-flag";
import { StatsBlock } from "@/components/stats-block";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatFifaPoints, formatStatValue } from "@/lib/format";

const QUALIFICATION_ROW_STYLES: Record<
  Exclude<GroupQualificationStatus, null>,
  string
> = {
  first: "bg-wc-green/12 hover:bg-wc-green/18",
  second: "bg-wc-sky/12 hover:bg-wc-sky/18",
  bestThird: "bg-wc-purple/12 hover:bg-wc-purple/18",
};

function formatGoalDifference(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

function formatStandingValue(played: number, value: number | string): string {
  return played > 0 ? String(value) : "—";
}

interface GroupDetailPanelProps {
  group: GroupComparisonCard;
  mode: RankingMode;
  selectedTeamId?: string;
}

export function GroupDetailPanel({
  group,
  mode,
  selectedTeamId,
}: GroupDetailPanelProps) {
  const router = useRouter();
  const t = useTranslations("groups");
  const summary = useTranslations("summary");

  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      <header className="border-b border-white/8 px-5 py-4">
        <h3 className="text-lg font-semibold text-white">
          {t("detailTitle", { group: group.groupLetter })}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {group.isComplete ? t("groupComplete") : t("detailSubtitle")}
        </p>
      </header>

      <div className="flex flex-col gap-6 p-5">
        <div className="overflow-x-auto [&_[data-slot=table-container]]:overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/6 hover:bg-transparent">
                <TableHead className="px-3 text-center text-xs text-muted-foreground">
                  {t("groupPos")}
                </TableHead>
                <TableHead className="min-w-[8rem] px-3 text-xs text-muted-foreground">
                  {t("team")}
                </TableHead>
                <TableHead className="px-3 text-center text-xs text-muted-foreground">
                  {t("groupPts")}
                </TableHead>
                <TableHead className="px-3 text-center text-xs text-muted-foreground">
                  {t("groupGd")}
                </TableHead>
                <TableHead className="px-3 text-center text-xs text-muted-foreground">
                  {t("goalsFor")}
                </TableHead>
                <TableHead className="px-3 text-center text-xs text-muted-foreground">
                  {t("goalsAgainst")}
                </TableHead>
                <TableHead className="px-3 text-right text-xs text-muted-foreground">
                  {summary("fifaPoints")}
                </TableHead>
                <TableHead className="px-3 text-right text-xs text-muted-foreground">
                  {summary("fifaRank")}
                </TableHead>
                <TableHead className="px-3 text-right text-xs text-muted-foreground">
                  {t("pathAvgPoints")}
                </TableHead>
                <TableHead className="px-3 text-right text-xs text-muted-foreground">
                  {t("pathAvgRank")}
                </TableHead>
                <TableHead className="px-3 text-center text-xs text-muted-foreground">
                  {t("pathRank")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {group.teams.map((entry) => {
                const isSelected = entry.team.id === selectedTeamId;
                const analysisHref = `/?team=${entry.team.id}&mode=${mode}`;

                return (
                  <TableRow
                    key={entry.team.id}
                    className={cn(
                      "cursor-pointer border-white/6 transition-colors",
                      entry.qualificationStatus &&
                        QUALIFICATION_ROW_STYLES[entry.qualificationStatus],
                      !entry.qualificationStatus && "hover:bg-white/4",
                      isSelected && "ring-1 ring-inset ring-wc-sky/50",
                    )}
                    onClick={() => router.push(analysisHref)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(analysisHref);
                      }
                    }}
                    tabIndex={0}
                    role="link"
                    aria-label={`${entry.team.displayName} analysis`}
                  >
                    <TableCell className="px-3 py-2.5 text-center font-mono text-sm text-muted-foreground">
                      {entry.standing.position}
                    </TableCell>
                    <TableCell className="max-w-[10rem] whitespace-normal px-3 py-2.5">
                      <TeamLabel
                        team={entry.team}
                        showCode
                        flagSize="sm"
                        className="w-full"
                        nameClassName="text-sm font-medium text-white"
                      />
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-center font-mono text-sm tabular-nums text-white">
                      {formatStandingValue(
                        entry.standing.played,
                        entry.standing.points,
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-center font-mono text-sm tabular-nums text-muted-foreground">
                      {entry.standing.played > 0
                        ? formatGoalDifference(entry.standing.gd)
                        : "—"}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-center font-mono text-sm tabular-nums text-white">
                      {formatStandingValue(
                        entry.standing.played,
                        entry.standing.gf,
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-center font-mono text-sm tabular-nums text-white">
                      {formatStandingValue(
                        entry.standing.played,
                        entry.standing.ga,
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-sm tabular-nums text-wc-orange">
                      {formatFifaPoints(entry.fifaPoints)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-sm tabular-nums text-white">
                      {entry.fifaRank ?? "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-sm tabular-nums text-wc-orange">
                      {formatFifaPoints(entry.avgOpponentPoints)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-sm tabular-nums text-white">
                      {entry.avgOpponentRank !== null
                        ? formatStatValue(entry.avgOpponentRank, 1)
                        : "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2.5 text-center font-mono text-sm tabular-nums text-muted-foreground">
                      {entry.rankAmongTeams ?? "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-4 border-t border-white/8 pt-6">
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {t("statsTitle")}
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatsBlock
                title={t("fifaPointsStats")}
                stats={group.fifaPointsStats}
                isRank={false}
              />
              <StatsBlock
                title={t("fifaRankStats")}
                stats={group.fifaRankStats}
                isRank
              />
            </div>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("statsNote")}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("pathStatsNote")}
          </p>
        </div>
      </div>
    </section>
  );
}

export function parseSelectedGroupLetter(
  urlGroup: string | null,
  groups: GroupComparisonCard[],
  selectedTeamId?: string,
): string {
  const letters = new Set(groups.map((group) => group.groupLetter));
  const normalized = urlGroup?.toUpperCase();

  if (selectedTeamId) {
    const teamGroup = groups.find((group) =>
      group.teams.some((entry) => entry.team.id === selectedTeamId),
    )?.groupLetter;
    if (teamGroup) return teamGroup;
  }

  if (normalized && letters.has(normalized)) {
    return normalized;
  }

  return letters.has("A") ? "A" : (groups[0]?.groupLetter ?? "A");
}
