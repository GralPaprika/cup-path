"use client";

import type { GroupFinishCard, Team } from "@/lib/types";
import { getTeamDisplayName } from "@/lib/i18n/team-display-name";
import { useTranslations } from "next-intl";
import { TeamFlag } from "@/components/team-flag";
import { cn } from "@/lib/utils";

interface GroupFinishEditorProps {
  teams: Team[];
  groupCards: GroupFinishCard[];
  focusTeamId: string;
  onSwapPositions: (
    groupLetter: string,
    positionA: 1 | 2 | 3,
    positionB: 1 | 2 | 3,
  ) => void;
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
  position: 1 | 2 | 3;
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

export function GroupFinishEditor({
  teams,
  groupCards,
  focusTeamId,
  onSwapPositions,
}: GroupFinishEditorProps) {
  const t = useTranslations("simulate");

  return (
    <div className="glass-panel space-y-4 p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-white">{t("groupFinishes")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("groupFinishesHint")}</p>
      </div>

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
                  canSwapDown={position < 3}
                  onSwapUp={() =>
                    onSwapPositions(
                      card.groupLetter,
                      position,
                      (position - 1) as 1 | 2 | 3,
                    )
                  }
                  onSwapDown={() =>
                    onSwapPositions(
                      card.groupLetter,
                      position,
                      (position + 1) as 1 | 2 | 3,
                    )
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
