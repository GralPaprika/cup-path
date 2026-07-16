import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getCompareMaxStageReached,
  getTeamMaxStageReached,
  getTeamsAtStage,
  teamReachedStage,
} from "@/lib/domain/team/team-stage-logic";
import {
  bundledTestContext,
  createTestContext,
  groupAMatchesComplete,
  groupBMatchesComplete,
  scheduledMatch,
} from "@/lib/domain/core/test-fixtures";

describe("teamReachedStage", () => {
  it("treats every team as group-stage eligible", () => {
    const ctx = bundledTestContext();
    assert.equal(teamReachedStage(ctx, "MEX", "group"), true);
    assert.equal(teamReachedStage(ctx, "RSA", "group"), true);
  });

  it("uses advancing set for round of 32", () => {
    const ctx = createTestContext([
      ...groupAMatchesComplete(),
      ...groupBMatchesComplete(),
    ]);

    assert.equal(teamReachedStage(ctx, "MEX", "r32"), true);
    assert.equal(teamReachedStage(ctx, "KOR", "r32"), false);
  });
});

describe("getTeamMaxStageReached", () => {
  it("bumps stage after a knockout win", () => {
    const ctx = createTestContext([
      ...groupAMatchesComplete(),
      {
        team1: "Mexico",
        team2: "Brazil",
        round: "Round of 32",
        date: "2026-07-02",
        num: 79,
        score: { ft: [2, 1] },
      },
      scheduledMatch("Mexico", "France", "Round of 16", {
        num: 92,
        date: "2026-07-06",
      }),
    ]);

    assert.equal(getTeamMaxStageReached(ctx, "MEX"), "r16");
  });

  it("treats semi-final losers as eliminated before the final", () => {
    const ctx = createTestContext([
      {
        team1: "Mexico",
        team2: "Czechia",
        round: "Semi-final",
        date: "2026-07-14",
        num: 101,
        score: { ft: [2, 0] },
      },
      {
        team1: "Canada",
        team2: "Switzerland",
        round: "Semi-final",
        date: "2026-07-15",
        num: 102,
        score: { ft: [1, 0] },
      },
      scheduledMatch("Czechia", "Switzerland", "Match for third place", {
        num: 103,
        date: "2026-07-18",
      }),
      scheduledMatch("Mexico", "Canada", "Final", {
        num: 104,
        date: "2026-07-19",
      }),
    ]);

    assert.equal(getTeamMaxStageReached(ctx, "MEX"), "final");
    assert.equal(getTeamMaxStageReached(ctx, "CAN"), "final");
    assert.equal(getTeamMaxStageReached(ctx, "CZE"), "sf");
    assert.equal(getTeamMaxStageReached(ctx, "SUI"), "sf");
    assert.deepEqual([...getTeamsAtStage(ctx, "final")].sort(), ["CAN", "MEX"]);
  });
});

describe("getCompareMaxStageReached", () => {
  it("uses the earlier of two teams' max stages", () => {
    const ctx = createTestContext([
      ...groupAMatchesComplete(),
      {
        team1: "Mexico",
        team2: "Brazil",
        round: "Round of 32",
        date: "2026-07-02",
        num: 79,
        score: { ft: [2, 1] },
      },
      scheduledMatch("Mexico", "France", "Round of 16", {
        num: 92,
        date: "2026-07-06",
      }),
      ...groupBMatchesComplete(),
    ]);

    assert.equal(getTeamMaxStageReached(ctx, "MEX"), "r16");
    assert.equal(getTeamMaxStageReached(ctx, "KOR"), "group");
    assert.equal(getCompareMaxStageReached(ctx, "MEX", "KOR"), "group");
  });
});

describe("getTeamsAtStage", () => {
  it("returns all teams for the group stage", () => {
    const ctx = bundledTestContext();
    const teams = getTeamsAtStage(ctx, "group");
    assert.ok(teams.size >= 48);
  });
});
