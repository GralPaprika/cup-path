"use client";

import type { ResolvedBracketMatch, Team } from "@/lib/types";
import { getTeamDisplayName } from "@/lib/i18n/team-display-name";
import { useTranslations } from "next-intl";
import { TeamFlag } from "@/components/team-flag";
import {
  BRACKET_COLUMNS,
  getBracketGridRows,
  getMatchLayout,
} from "@/components/bracket-tree-layout";
import { cn } from "@/lib/utils";

interface BracketTreeProps {
  matches: ResolvedBracketMatch[];
  teams: Team[];
  scenarioWinners: Record<number, string | undefined>;
  changedMatchNums: number[];
  focusTeamId: string;
  focusTeamMatchNums: number[];
  onSelectWinner: (matchNum: number, teamId: string) => void;
}

function BracketSide({
  side,
  teams,
  isWinner,
  isFocus,
  compact,
  onClick,
}: {
  side: ResolvedBracketMatch["home"];
  teams: Team[];
  isWinner: boolean;
  isFocus: boolean;
  compact?: boolean;
  onClick: () => void;
}) {
  const teamNames = useTranslations("teams");
  const team = side.teamId
    ? teams.find((entry) => entry.id === side.teamId)
    : null;
  const name = team ? getTeamDisplayName(teamNames, team) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!side.teamId}
      className={cn(
        "flex w-full items-center gap-1.5 rounded border px-1.5 py-1 text-left transition-colors",
        compact ? "text-[10px]" : "text-xs",
        side.teamId && "hover:border-wc-sky/40 hover:bg-white/5",
        isWinner && "border-wc-sky/40 bg-wc-sky/10",
        isFocus && "ring-1 ring-wc-orange/60",
        !side.teamId && "cursor-default opacity-50",
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
  focusTeamId,
  focusTeamMatchNums,
  onSelectWinner,
}: {
  match: ResolvedBracketMatch;
  teams: Team[];
  selectedWinnerId: string | null;
  overridden: boolean;
  changed: boolean;
  focusTeamId: string;
  focusTeamMatchNums: number[];
  onSelectWinner: (matchNum: number, teamId: string) => void;
}) {
  const t = useTranslations("simulate.bracket");
  const involvesFocus = focusTeamMatchNums.includes(match.num);
  const isThirdPlace = match.num === 103;

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col justify-center rounded-lg border border-white/8 bg-white/[0.02] p-1.5",
        changed && "border-wc-orange/40 bg-wc-orange/5",
        involvesFocus && !changed && "border-wc-orange/25",
        isThirdPlace && "opacity-90",
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-1">
        <span className="font-mono text-[9px] text-muted-foreground">
          #{match.num}
        </span>
        {overridden && (
          <span className="rounded bg-wc-purple/15 px-1 py-0.5 text-[8px] font-semibold uppercase text-wc-purple">
            {t("simulated")}
          </span>
        )}
        {match.scoreLabel && !overridden && (
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
          onClick={() =>
            match.home.teamId && onSelectWinner(match.num, match.home.teamId)
          }
        />
        <BracketSide
          side={match.away}
          teams={teams}
          isWinner={selectedWinnerId === match.away.teamId}
          isFocus={focusTeamId === match.away.teamId}
          compact
          onClick={() =>
            match.away.teamId && onSelectWinner(match.num, match.away.teamId)
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
  focusTeamId,
  focusTeamMatchNums,
  onSelectWinner,
}: BracketTreeProps) {
  const t = useTranslations("simulate");
  const gridRows = getBracketGridRows();
  const matchByNum = new Map(matches.map((match) => [match.num, match]));

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-white">
          {t("knockoutBracket")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("bracketHint")}</p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div
          className="inline-grid min-w-[920px] gap-x-2 gap-y-0"
          style={{
            gridTemplateColumns: `repeat(${BRACKET_COLUMNS.length}, minmax(160px, 1fr))`,
            gridTemplateRows: `repeat(${gridRows}, minmax(28px, auto))`,
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
              {column.label}
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
