"use client";

import type { ResolvedBracketMatch, Team } from "@/lib/types";
import { getTeamDisplayName } from "@/lib/i18n/team-display-name";
import { getRoundDisplayName } from "@/lib/i18n/round-display-name";
import { useTranslations } from "next-intl";
import { TeamFlag } from "@/components/team/team-flag";
import {
  BRACKET_COLUMNS,
  getBracketGridRows,
  getMatchLayout,
} from "@/components/bracket/bracket-tree-layout";
import { isThirdPlaceMatch } from "@/lib/domain/match/match-stages";
import { cn } from "@/lib/utils";

interface BracketTreeProps {
  matches: ResolvedBracketMatch[];
  teams: Team[];
  scenarioWinners: Record<number, string | undefined>;
  changedMatchNums: number[];
  pendingWinnerMatchNums: number[];
  focusTeamId: string;
  focusTeamMatchNums: number[];
  onSelectWinner: (matchNum: number, teamId: string) => void;
  showPickAllStrongest?: boolean;
  showPickSimulatedStrongest?: boolean;
  onPickAllStrongest?: () => void;
  onPickSimulatedStrongest?: () => void;
}

function BracketSide({
  side,
  teams,
  isWinner,
  isFocus,
  compact,
  selectable,
  onClick,
}: {
  side: ResolvedBracketMatch["home"];
  teams: Team[];
  isWinner: boolean;
  isFocus: boolean;
  compact?: boolean;
  selectable: boolean;
  onClick: () => void;
}) {
  const teamNames = useTranslations("teams");
  const team = side.teamId
    ? teams.find((entry) => entry.id === side.teamId)
    : null;
  const name = team ? getTeamDisplayName(teamNames, team) : null;
  const canSelect = selectable && Boolean(side.teamId);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!canSelect}
      className={cn(
        "flex w-full items-center gap-1.5 rounded border px-1.5 py-1 text-left transition-colors",
        compact ? "text-[10px]" : "text-xs",
        canSelect && "hover:border-wc-sky/40 hover:bg-white/5",
        isWinner && "border-wc-sky/40 bg-wc-sky/10",
        isFocus && "ring-1 ring-wc-orange/60",
        !canSelect && "cursor-default opacity-50",
      )}
    >
      <span className="shrink-0 font-mono text-[9px] font-semibold text-wc-orange">
        {side.slotLabel}
      </span>
      {team && name ? (
        <>
          <TeamFlag team={team} size="sm" />
          <span className="min-w-0 truncate font-medium text-white">{name}</span>
        </>
      ) : (
        <span className="text-muted-foreground">—</span>
      )}
    </button>
  );
}

function BracketMatchCard({
  match,
  teams,
  selectedWinnerId,
  overridden,
  changed,
  needsWinner,
  focusTeamId,
  focusTeamMatchNums,
  onSelectWinner,
}: {
  match: ResolvedBracketMatch;
  teams: Team[];
  selectedWinnerId: string | null;
  overridden: boolean;
  changed: boolean;
  needsWinner: boolean;
  focusTeamId: string;
  focusTeamMatchNums: number[];
  onSelectWinner: (matchNum: number, teamId: string) => void;
}) {
  const t = useTranslations("simulate.bracket");
  const stages = useTranslations("compare.stages");
  const involvesFocus = focusTeamMatchNums.includes(match.num);
  const isCenter = match.num === 103 || match.num === 104;
  const isThirdPlace = isThirdPlaceMatch(match.round);
  const canPickWinner = !isThirdPlace;

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col justify-center rounded-lg border border-white/8 bg-white/[0.02] p-1.5",
        changed && "border-wc-orange/40 bg-wc-orange/5",
        needsWinner && "border-wc-purple/50 bg-wc-purple/10 ring-1 ring-wc-purple/30",
        involvesFocus && !changed && !needsWinner && "border-wc-orange/25",
        isThirdPlace && "opacity-90",
      )}
    >
      {isCenter && (
        <p className="mb-1 text-center text-[9px] font-semibold uppercase tracking-widest text-wc-orange">
          {getRoundDisplayName(stages, match.round)}
        </p>
      )}
      <div className="mb-1 flex items-center justify-between gap-1">
        <span className="font-mono text-[9px] text-muted-foreground">
          #{match.num}
        </span>
        {needsWinner && (
          <span className="rounded bg-wc-purple/20 px-1 py-0.5 text-[8px] font-semibold uppercase text-wc-purple">
            {t("pickWinnerBadge")}
          </span>
        )}
        {overridden && !needsWinner && (
          <span className="rounded bg-wc-purple/15 px-1 py-0.5 text-[8px] font-semibold uppercase text-wc-purple">
            {t("simulated")}
          </span>
        )}
        {match.scoreLabel && !overridden && !needsWinner && (
          <span className="font-mono text-[9px] text-muted-foreground">
            {match.scoreLabel}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <BracketSide
          side={match.home}
          teams={teams}
          isWinner={selectedWinnerId === match.home.teamId}
          isFocus={focusTeamId === match.home.teamId}
          compact
          selectable={canPickWinner}
          onClick={() =>
            canPickWinner &&
            match.home.teamId &&
            onSelectWinner(match.num, match.home.teamId)
          }
        />
        <BracketSide
          side={match.away}
          teams={teams}
          isWinner={selectedWinnerId === match.away.teamId}
          isFocus={focusTeamId === match.away.teamId}
          compact
          selectable={canPickWinner}
          onClick={() =>
            canPickWinner &&
            match.away.teamId &&
            onSelectWinner(match.num, match.away.teamId)
          }
        />
      </div>
    </div>
  );
}

export function BracketTree({
  matches,
  teams,
  scenarioWinners,
  changedMatchNums,
  pendingWinnerMatchNums,
  focusTeamId,
  focusTeamMatchNums,
  onSelectWinner,
  showPickAllStrongest,
  showPickSimulatedStrongest,
  onPickAllStrongest,
  onPickSimulatedStrongest,
}: BracketTreeProps) {
  const t = useTranslations("simulate");
  const stages = useTranslations("compare.stages");
  const gridRows = getBracketGridRows();
  const matchByNum = new Map(matches.map((match) => [match.num, match]));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {t("knockoutBracket")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("bracketHint")}</p>
        </div>
        {(showPickAllStrongest || showPickSimulatedStrongest) && (
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            {showPickAllStrongest && onPickAllStrongest && (
              <button
                type="button"
                onClick={onPickAllStrongest}
                className="rounded-lg border border-wc-sky/30 px-3 py-1.5 text-sm font-medium text-wc-sky transition-colors hover:border-wc-sky/50 hover:bg-wc-sky/10"
              >
                {t("pickAllStrongestWinners")}
              </button>
            )}
            {showPickSimulatedStrongest && onPickSimulatedStrongest && (
              <button
                type="button"
                onClick={onPickSimulatedStrongest}
                className="rounded-lg border border-wc-purple/30 px-3 py-1.5 text-sm font-medium text-wc-purple transition-colors hover:border-wc-purple/50 hover:bg-wc-purple/10"
              >
                {t("pickSimulatedStrongestWinners")}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto pb-2">
        <div
          className="inline-grid w-full min-w-[1280px] gap-x-2 gap-y-1"
          style={{
            gridTemplateColumns: `repeat(${BRACKET_COLUMNS.length}, minmax(130px, 1fr))`,
            gridTemplateRows: `auto repeat(${gridRows}, minmax(0, auto))`,
          }}
        >
          {BRACKET_COLUMNS.map((column, columnIndex) => (
            <div
              key={column.key}
              className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
              style={{
                gridColumn: columnIndex + 1,
                gridRow: 1,
              }}
            >
              {stages(column.roundKey)}
            </div>
          ))}

          {matches.map((match) => {
            const layout = getMatchLayout(match.num);
            const overridden = Boolean(scenarioWinners[match.num]);
            const selectedWinnerId =
              scenarioWinners[match.num] ?? match.winnerTeamId;

            return (
              <div
                key={match.num}
                className="flex flex-col justify-center"
                style={{
                  gridColumn: layout.column + 1,
                  gridRow: `${layout.rowStart + 1} / span ${layout.rowSpan}`,
                }}
              >
                <BracketMatchCard
                  match={matchByNum.get(match.num) ?? match}
                  teams={teams}
                  selectedWinnerId={selectedWinnerId}
                  overridden={overridden}
                  changed={changedMatchNums.includes(match.num)}
                  needsWinner={pendingWinnerMatchNums.includes(match.num)}
                  focusTeamId={focusTeamId}
                  focusTeamMatchNums={focusTeamMatchNums}
                  onSelectWinner={onSelectWinner}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
