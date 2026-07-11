"use client";

import type { ResolvedBracketMatch, Team } from "@/lib/types";
import { getTeamDisplayName } from "@/lib/i18n/team-display-name";
import { useTranslations } from "next-intl";
import { TeamFlag } from "@/components/team-flag";
import { cn } from "@/lib/utils";

interface BracketMatchRowProps {
  match: ResolvedBracketMatch;
  teams: Team[];
  selectedWinnerId: string | null;
  overridden: boolean;
  changed: boolean;
  focusTeamId?: string;
  onSelectWinner: (matchNum: number, teamId: string) => void;
}

function SideCell({
  side,
  teams,
  isWinner,
  isFocus,
  onClick,
}: {
  side: ResolvedBracketMatch["home"];
  teams: Team[];
  isWinner: boolean;
  isFocus: boolean;
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
        "flex w-full flex-col items-end rounded-lg border px-3 py-2 text-right transition-colors",
        side.teamId && "hover:border-wc-sky/40 hover:bg-white/5",
        isWinner && "border-wc-sky/40 bg-wc-sky/10",
        isFocus && "ring-1 ring-wc-orange/50",
        !side.teamId && "cursor-default opacity-60",
      )}
    >
      <span className="font-mono text-[10px] font-semibold tracking-wide text-wc-orange">
        {side.slotLabel}
      </span>
      {team && name ? (
        <span className="mt-1 flex items-center justify-end gap-1.5">
          <TeamFlag team={team} size="sm" />
          <span className="text-sm font-medium text-white">{name}</span>
        </span>
      ) : (
        <span className="mt-1 text-sm text-muted-foreground">—</span>
      )}
    </button>
  );
}

export function BracketMatchRow({
  match,
  teams,
  selectedWinnerId,
  overridden,
  changed,
  focusTeamId,
  onSelectWinner,
}: BracketMatchRowProps) {
  const t = useTranslations("simulate.bracket");

  const involvesFocus =
    focusTeamId &&
    (match.home.teamId === focusTeamId || match.away.teamId === focusTeamId);

  return (
    <div
      className={cn(
        "rounded-xl border border-white/8 bg-white/[0.02] p-4",
        changed && "border-wc-orange/30 bg-wc-orange/5",
        involvesFocus && !changed && "border-white/12",
      )}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {match.round} · #{match.num}
          </p>
          {match.date && (
            <p className="text-[11px] text-muted-foreground">{match.date}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {overridden && (
            <span className="rounded-full border border-wc-purple/30 bg-wc-purple/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-wc-purple">
              {t("simulated")}
            </span>
          )}
          {match.scoreLabel && !overridden && (
            <span className="font-mono text-xs text-muted-foreground">
              {match.scoreLabel}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <SideCell
          side={match.home}
          teams={teams}
          isWinner={selectedWinnerId === match.home.teamId}
          isFocus={focusTeamId === match.home.teamId}
          onClick={() =>
            match.home.teamId &&
            onSelectWinner(match.num, match.home.teamId)
          }
        />
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t("vs")}
        </p>
        <SideCell
          side={match.away}
          teams={teams}
          isWinner={selectedWinnerId === match.away.teamId}
          isFocus={focusTeamId === match.away.teamId}
          onClick={() =>
            match.away.teamId &&
            onSelectWinner(match.num, match.away.teamId)
          }
        />
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">{t("pickWinner")}</p>
    </div>
  );
}
