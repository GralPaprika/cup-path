import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { applyWorldCupBundle } from "@/lib/data/worldcup-loader";
import {
  getCompareMaxStageReached,
  getTeamMaxStageReached,
  getTeamsAtStage,
  teamReachedStage,
} from "@/lib/domain/team-stage-logic";
import {
  groupAMatchesComplete,
  groupBMatchesComplete,
  restoreBundledWorldCup,
  scheduledMatch,
} from "@/lib/domain/test-fixtures";

afterEach(() => {
  restoreBundledWorldCup();
});

describe("teamReachedStage", () => {
  it("treats every team as group-stage eligible", () => {
    assert.equal(teamReachedStage("MEX", "group"), true);
    assert.equal(teamReachedStage("RSA", "group"), true);
  });

  it("uses advancing set for round of 32", () => {
    applyWorldCupBundle({
      name: "test",
      matches: [...groupAMatchesComplete(), ...groupBMatchesComplete()],
    });

    assert.equal(teamReachedStage("MEX", "r32"), true);
    assert.equal(teamReachedStage("KOR", "r32"), false);
  });
});

describe("getTeamMaxStageReached", () => {
  it("bumps stage after a knockout win", () => {
    applyWorldCupBundle({
      name: "test",
      matches: [
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
      ],
    });

    assert.equal(getTeamMaxStageReached("MEX"), "r16");
  });
});

describe("getCompareMaxStageReached", () => {
  it("uses the earlier of two teams' max stages", () => {
    applyWorldCupBundle({
      name: "test",
      matches: [
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
      ],
    });

    assert.equal(getTeamMaxStageReached("MEX"), "r16");
    assert.equal(getTeamMaxStageReached("KOR"), "group");
    assert.equal(getCompareMaxStageReached("MEX", "KOR"), "group");
  });
});

describe("getTeamsAtStage", () => {
  it("returns all teams for the group stage", () => {
    const teams = getTeamsAtStage("group");
    assert.ok(teams.size >= 48);
  });
});
