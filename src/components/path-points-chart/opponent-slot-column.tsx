import type { OpponentPointsObservation } from "@/lib/domain/path/path-opponent-observations";
import { TeamFlag } from "@/components/team/team-flag";
import { OPPONENT_SLOT_MIN_WIDTH } from "@/components/path-points-chart/constants";

interface OpponentSlotColumnProps {
  opponent: OpponentPointsObservation | undefined;
  color: string;
  changed?: boolean;
}

export function OpponentSlotColumn({
  opponent,
  color,
  changed,
}: OpponentSlotColumnProps) {
  if (!opponent) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          minWidth: OPPONENT_SLOT_MIN_WIDTH,
        }}
      >
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>—</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        minWidth: OPPONENT_SLOT_MIN_WIDTH,
        borderRadius: changed ? 6 : undefined,
        boxShadow: changed ? "inset 0 0 0 1px rgba(251, 146, 60, 0.4)" : undefined,
      }}
    >
      <TeamFlag
        team={{
          id: opponent.teamId,
          flagUrl: opponent.flagUrl,
          displayName: opponent.displayName,
        }}
        size="sm"
      />
      <span
        style={{
          color,
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 9,
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        {opponent.teamId}
      </span>
    </div>
  );
}
