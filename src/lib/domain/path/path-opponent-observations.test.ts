import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { MatchDifficulty, TeamPathSummary } from "@/lib/types";
import {
  buildPathChartDataFromSummary,
  getMaxStageFromMatches,
  getSharedMaxStage,
} from "@/lib/domain/path/path-opponent-observations";

function opponent(id: string): MatchDifficulty["opponent"] {
  return {
    id,
    displayName: id,
    aliases: [id],
    group: "A",
    flagUrl: "",
    confederation: "UEFA",
  };
}

function pathMatch(round: string, opponentId: string): MatchDifficulty {
  return {
    round,
    date: "2026-07-01",
    opponent: opponent(opponentId),
    opponentRank: 10,
    opponentPoints: 1700,
    teamRank: 5,
    teamPoints: 1800,
    rankGap: 5,
    pointsGap: -100,
    result: null,
    scoreLabel: null,
    scorePensLabel: null,
    isNext: false,
    isPlayed: false,
  };
}

function summary(matches: MatchDifficulty[]): TeamPathSummary {
  return {
    team: {
      id: "ARG",
      displayName: "Argentina",
      aliases: ["Argentina"],
      group: "J",
      flagUrl: "",
      confederation: "CONMEBOL",
    },
    teamRank: 1,
    teamPoints: 1900,
    matches,
    avgOpponentPoints: 1700,
    avgOpponentRank: 10,
    isEliminated: false,
    playedCount: matches.length,
    totalCount: matches.length,
  };
}

describe("getMaxStageFromMatches", () => {
  it("returns null for an empty path", () => {
    assert.equal(getMaxStageFromMatches([]), null);
  });

  it("returns the highest stage present in the path", () => {
    const matches = [
      pathMatch("Matchday 1", "ALG"),
      pathMatch("Round of 32", "AUT"),
      pathMatch("Quarter-final", "SUI"),
    ];
    assert.equal(getMaxStageFromMatches(matches), "qf");
  });
});

describe("getSharedMaxStage", () => {
  it("returns null when every stage is null", () => {
    assert.equal(getSharedMaxStage(null, undefined), null);
  });

  it("returns the earliest stage reached across paths", () => {
    assert.equal(getSharedMaxStage("sf", "qf", null), "qf");
  });
});

describe("buildPathChartDataFromSummary", () => {
  it("truncates opponents to the shared max stage", () => {
    const fullSummary = summary([
      pathMatch("Matchday 1", "ALG"),
      pathMatch("Matchday 2", "AUT"),
      pathMatch("Matchday 3", "JOR"),
      pathMatch("Round of 32", "CPV"),
      pathMatch("Round of 16", "EGY"),
      pathMatch("Quarter-final", "SUI"),
      pathMatch("Semi-final", "ENG"),
    ]);

    const chart = buildPathChartDataFromSummary(fullSummary, "qf");

    assert.equal(chart.opponents.length, 6);
    assert.equal(chart.opponents.at(-1)?.teamId, "SUI");
    assert.equal(chart.avgOpponentPoints, 1700);
  });
});
