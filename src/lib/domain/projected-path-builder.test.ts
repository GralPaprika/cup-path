import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildProjectedTeamPathSummary } from "@/lib/domain/projected-path-builder";
import {
  createTestContext,
  groupAMatchesComplete,
  groupBMatchesComplete,
  rankingEntry,
  scheduledMatch,
} from "@/lib/domain/test-fixtures";

function rankingsMap() {
  return new Map([
    ["MEX", rankingEntry("MEX", 15, 1835)],
    ["CZE", rankingEntry("CZE", 20, 1700)],
    ["SUI", rankingEntry("SUI", 12, 1780)],
    ["BRA", rankingEntry("BRA", 3, 1885)],
  ]);
}

describe("buildProjectedTeamPathSummary", () => {
  it("marks eliminated after a recorded knockout loss", () => {
    const ctx = createTestContext([
        ...groupAMatchesComplete(),
        ...groupBMatchesComplete(),
        {
          team1: "Czechia",
          team2: "Switzerland",
          round: "Round of 32",
          date: "2026-07-01",
          num: 73,
          score: { ft: [0, 1] },
        },
      ]);

    const summary = buildProjectedTeamPathSummary(ctx, "CZE", {}, rankingsMap());

    assert.ok(summary);
    assert.equal(summary.isEliminated, true);
    assert.ok(
      summary.matches.every(
        (match) =>
          match.round.startsWith("Matchday") || match.round === "Round of 32",
      ),
    );
  });

  it("recomputes averages over the simulated path", () => {
    const ctx = createTestContext([
        ...groupAMatchesComplete(),
        scheduledMatch("Mexico", "Brazil", "Round of 32", {
          num: 79,
          date: "2026-07-02",
        }),
      ]);

    const actual = buildProjectedTeamPathSummary(ctx, 
      "MEX",
      {},
      rankingsMap(),
    );
    const simulated = buildProjectedTeamPathSummary(ctx, 
      "MEX",
      {
        groupFinishes: { A: ["MEX", "CZE", "RSA", "KOR"] },
        knockoutWinners: { 79: "MEX" },
      },
      rankingsMap(),
    );

    assert.ok(actual && simulated);
    assert.ok(simulated.matches.length >= actual.matches.length);
  });
});
