"use client";

import { useState } from "react";
import type { BestThirdRankingEntry, GroupFinishCard, Team } from "@/lib/types";
import type { GroupFinishPosition } from "@/lib/domain/group/group-finish-swap";
import { getTeamDisplayName } from "@/lib/i18n/team-display-name";
import { useTranslations } from "next-intl";
import { TeamFlag } from "@/components/team/team-flag";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface GroupFinishEditorProps {
  teams: Team[];
  groupCards: GroupFinishCard[];
  bestThirdRanking: BestThirdRankingEntry[];
  focusTeamId: string;
  onSwapPositions: (
    groupLetter: string,
    positionA: GroupFinishPosition,
    positionB: GroupFinishPosition,
  ) => void;
  onSortByPoints: () => void;
}

function PositionRow({
  position,
  teamId,
  teams,
  focusTeamId,
  thirdQualifies,
  onSwapUp,
  onSwapDown,
  canSwapUp,
  canSwapDown,
}: {
  position: GroupFinishPosition;
  teamId: string;
  teams: Team[];
  focusTeamId: string;
  thirdQualifies: boolean;
  onSwapUp: () => void;
  onSwapDown: () => void;
  canSwapUp: boolean;
  canSwapDown: boolean;
}) {
  const teamNames = useTranslations("teams");
  const t = useTranslations("simulate.groups");
  const team = teams.find((entry) => entry.id === teamId);
  const name = team ? getTeamDisplayName(teamNames, team) : teamId;
  const isFocus = teamId === focusTeamId;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-white/8 px-2 py-1.5",
        isFocus && "border-wc-orange/40 bg-wc-orange/5",
        position === 3 && thirdQualifies && "border-wc-sky/30 bg-wc-sky/5",
        position === 4 && "opacity-80",
      )}
    >
      <span className="w-5 shrink-0 text-center font-mono text-xs font-semibold text-wc-orange">
        {position}
      </span>
      {team ? (
        <TeamFlag team={team} size="sm" />
      ) : (
        <span className="h-4 w-6 shrink-0" />
      )}
      <span className="min-w-0 flex-1 truncate text-sm text-white">{name}</span>
      {position === 3 && thirdQualifies && (
        <span className="shrink-0 rounded bg-wc-sky/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-wc-sky">
          {t("bestThird")}
        </span>
      )}
      {position === 4 && (
        <span className="shrink-0 rounded bg-white/8 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-muted-foreground">
          {t("eliminated")}
        </span>
      )}
      <div className="flex shrink-0 flex-col gap-0.5">
        <button
          type="button"
          disabled={!canSwapUp}
          onClick={onSwapUp}
          className="rounded border border-white/10 px-1 text-[10px] text-muted-foreground transition-colors hover:border-white/20 hover:text-white disabled:opacity-30"
          aria-label={t("moveUp")}
        >
          ↑
        </button>
        <button
          type="button"
          disabled={!canSwapDown}
          onClick={onSwapDown}
          className="rounded border border-white/10 px-1 text-[10px] text-muted-foreground transition-colors hover:border-white/20 hover:text-white disabled:opacity-30"
          aria-label={t("moveDown")}
        >
          ↓
        </button>
      </div>
    </div>
  );
}

function BestThirdRankingTable({
  teams,
  ranking,
  focusTeamId,
}: {
  teams: Team[];
  ranking: BestThirdRankingEntry[];
  focusTeamId: string;
}) {
  const t = useTranslations("simulate.bestThird");
  const teamNames = useTranslations("teams");

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("subtitle")}</p>

      <div className="overflow-x-auto rounded-xl border border-white/8">
        <Table>
          <TableHeader>
            <TableRow className="border-white/8 hover:bg-transparent">
              <TableHead className="text-muted-foreground">{t("rank")}</TableHead>
              <TableHead className="text-muted-foreground">{t("group")}</TableHead>
              <TableHead className="text-muted-foreground">{t("team")}</TableHead>
              <TableHead className="text-right text-muted-foreground">
                {t("played")}
              </TableHead>
              <TableHead className="text-right text-muted-foreground">
                {t("points")}
              </TableHead>
              <TableHead className="text-right text-muted-foreground">
                {t("gd")}
              </TableHead>
              <TableHead className="text-right text-muted-foreground">
                {t("gf")}
              </TableHead>
              <TableHead className="text-right text-muted-foreground">
                {t("ga")}
              </TableHead>
              <TableHead className="text-right text-muted-foreground">
                {t("status")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranking.map((entry) => {
              const team = teams.find((item) => item.id === entry.teamId);
              const name = team
                ? getTeamDisplayName(teamNames, team)
                : entry.teamId;
              const isFocus = entry.teamId === focusTeamId;
              const isCutoff = entry.rank === 8;

              return (
                <TableRow
                  key={`${entry.groupLetter}-${entry.teamId}`}
                  className={cn(
                    "border-white/6",
                    entry.qualifies && "bg-wc-sky/5",
                    isFocus && "bg-wc-orange/5",
                    isCutoff && "border-b-2 border-b-wc-sky/40",
                  )}
                >
                  <TableCell className="font-mono tabular-nums text-white">
                    #{entry.rank}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {entry.groupLetter}
                  </TableCell>
                  <TableCell>
                    {team ? (
                      <span className="inline-flex items-center gap-2">
                        <TeamFlag team={team} size="sm" />
                        <span className="font-medium text-white">{name}</span>
                      </span>
                    ) : (
                      name
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                    {entry.played}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-wc-orange">
                    {entry.points}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-white">
                    {entry.gd > 0 ? `+${entry.gd}` : entry.gd}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                    {entry.gf}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                    {entry.ga}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        entry.qualifies
                          ? "bg-wc-sky/15 text-wc-sky"
                          : "bg-white/8 text-muted-foreground",
                      )}
                    >
                      {entry.qualifies ? t("qualifies") : t("eliminated")}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">{t("footnote")}</p>
    </div>
  );
}

export function GroupFinishEditor({
  teams,
  groupCards,
  bestThirdRanking,
  focusTeamId,
  onSwapPositions,
  onSortByPoints,
}: GroupFinishEditorProps) {
  const t = useTranslations("simulate");
  const [activeTab, setActiveTab] = useState<"groups" | "bestThird">("groups");

  return (
    <div className="glass-panel space-y-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{t("groupFinishes")}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("groupFinishesHint")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSortByPoints}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-colors hover:border-wc-sky/30 hover:bg-wc-sky/10"
          >
            {t("sortByPoints")}
          </button>
        </div>
      </div>

      <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("groups")}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            activeTab === "groups"
              ? "bg-white/12 text-white"
              : "text-muted-foreground hover:text-white",
          )}
        >
          {t("groupsTab")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bestThird")}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            activeTab === "bestThird"
              ? "bg-white/12 text-white"
              : "text-muted-foreground hover:text-white",
          )}
        >
          {t("bestThirdTab")}
        </button>
      </div>

      {activeTab === "groups" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {groupCards.map((card) => (
            <div
              key={card.groupLetter}
              className="rounded-xl border border-white/8 bg-white/[0.02] p-3"
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("groupLabel", { letter: card.groupLetter })}
              </p>
              <div className="space-y-1.5">
                {card.positions.map(({ position, teamId }) => (
                  <PositionRow
                    key={position}
                    position={position}
                    teamId={teamId}
                    teams={teams}
                    focusTeamId={focusTeamId}
                    thirdQualifies={card.thirdQualifies}
                    canSwapUp={position > 1}
                    canSwapDown={position < 4}
                    onSwapUp={() =>
                      onSwapPositions(
                        card.groupLetter,
                        position,
                        (position - 1) as GroupFinishPosition,
                      )
                    }
                    onSwapDown={() =>
                      onSwapPositions(
                        card.groupLetter,
                        position,
                        (position + 1) as GroupFinishPosition,
                      )
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <BestThirdRankingTable
          teams={teams}
          ranking={bestThirdRanking}
          focusTeamId={focusTeamId}
        />
      )}
    </div>
  );
}
