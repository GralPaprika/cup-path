import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildStrongestKnockoutWinners,
  hasStrongestWinnerTargets,
} from "@/lib/domain/strongest-path-winners";
import {
  createTestContext,
  groupAMatchesComplete,
  groupBMatchesComplete,
} from "@/lib/domain/test-fixtures";

describe("buildStrongestKnockoutWinners", () => {
  it("picks the higher FIFA points team for played knockout matches", () => {
    const ctx = createTestContext([
      ...groupAMatchesComplete(),
      ...groupBMatchesComplete(),
      {
        team1: "Czechia",
        team2: "Switzerland",
        round: "Round of 32",
        date: "2026-07-01",
        num: 73,
        score: { ft: [1, 0] },
      },
    ]);

    const scenario = {
      groupFinishes: {
        A: ["MEX", "CZE", "RSA", "KOR"],
        B: ["CAN", "SUI", "BIH", "QAT"],
      },
    };

    const teamRankings = {
      CZE: { rank: 20, points: 1700 },
      SUI: { rank: 15, points: 1780 },
    };

    const winners = buildStrongestKnockoutWinners(
      ctx,
      scenario,
      { 73: "CZE" },
      teamRankings,
      new Set(),
      undefined,
      "all",
    );

    assert.ok(winners);
    assert.equal(winners[73], "SUI");
  });

  it("returns null when no overrides are needed", () => {
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

    const scenario = {
      groupFinishes: {
        A: ["MEX", "CZE", "RSA", "KOR"],
        B: ["CAN", "SUI", "BIH", "QAT"],
      },
    };

    const teamRankings = {
      CZE: { rank: 20, points: 1700 },
      SUI: { rank: 15, points: 1780 },
    };

    const winners = buildStrongestKnockoutWinners(
      ctx,
      scenario,
      { 73: "SUI" },
      teamRankings,
      new Set(),
      undefined,
      "all",
    );

    assert.equal(winners, null);
    assert.equal(
      hasStrongestWinnerTargets(
        ctx,
        scenario,
        { 73: "SUI" },
        teamRankings,
        new Set(),
        undefined,
        "all",
      ),
      false,
    );
  });
});
