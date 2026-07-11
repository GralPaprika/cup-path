import type { MatchDifficulty, PathDiffRow } from "@/lib/types";

function slotKey(match: MatchDifficulty): string {
  return `${match.round}|${match.date}`;
}

export function computePathDiff(
  actualMatches: MatchDifficulty[],
  simulatedMatches: MatchDifficulty[],
): PathDiffRow[] {
  const actualBySlot = new Map(
    actualMatches.map((match) => [slotKey(match), match]),
  );
  const simulatedBySlot = new Map(
    simulatedMatches.map((match) => [slotKey(match), match]),
  );
  const slots = new Set([...actualBySlot.keys(), ...simulatedBySlot.keys()]);

  const rows: PathDiffRow[] = [];

  for (const slot of slots) {
    const actual = actualBySlot.get(slot);
    const simulated = simulatedBySlot.get(slot);
    const round = actual?.round ?? simulated?.round ?? "";
    const date = actual?.date ?? simulated?.date ?? "";
    const actualOpponentId = actual?.opponent.id ?? null;
    const simulatedOpponentId = simulated?.opponent.id ?? null;

    rows.push({
      round,
      date,
      actualOpponentId,
      simulatedOpponentId,
      opponentChanged: actualOpponentId !== simulatedOpponentId,
    });
  }

  return rows.sort((a, b) => a.date.localeCompare(b.date));
}
