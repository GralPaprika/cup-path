import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { MatchDifficulty } from "@/lib/types";
import { computePathDiff } from "@/lib/domain/path-diff";

function opponent(id: string): MatchDifficulty["opponent"] {
  return {
    id,
    displayName: id,
    fifaCode: id,
    group: "A",
    confederation: "UEFA",
  };
}

function pathMatch(
  round: string,
  date: string,
  opponentId: string,
): MatchDifficulty {
  return {
    round,
    date,
    opponent: opponent(opponentId),
    opponentRank: 10,
    opponentPoints: 1700,
    teamRank: 5,
    teamPoints: 1800,
    rankGap: 5,
    pointsGap: -100,
    result: null,
    scoreLabel: null,
    isNext: false,
    isPlayed: false,
  };
}

describe("computePathDiff", () => {
  it("marks slots where opponents differ", () => {
    const actual = [pathMatch("Round of 32", "2026-07-01", "ARG")];
    const simulated = [pathMatch("Round of 32", "2026-07-01", "BRA")];
    const rows = computePathDiff(actual, simulated);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].opponentChanged, true);
  });

  it("includes slots only present in simulated path", () => {
    const simulated = [pathMatch("Round of 16", "2026-07-05", "FRA")];
    const rows = computePathDiff([], simulated);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].actualOpponentId, null);
    assert.equal(rows[0].simulatedOpponentId, "FRA");
  });

  it("sorts rows by date", () => {
    const actual = [
      pathMatch("Round of 16", "2026-07-10", "ARG"),
      pathMatch("Round of 32", "2026-07-01", "BRA"),
    ];
    const rows = computePathDiff(actual, actual);
    assert.equal(rows[0].date, "2026-07-01");
    assert.equal(rows[1].date, "2026-07-10");
  });
});
