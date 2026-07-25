import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { OpenFootballMatch, OpenFootballScore } from "@/lib/types";
import {
  getMatchWinner,
  isKnockoutRound,
  isMatchPlayed,
} from "@/lib/domain/match/match-result";

function makeMatch(
  score: OpenFootballScore | undefined,
  round = "Round of 16",
): OpenFootballMatch {
  return {
    round,
    date: "2026-06-01",
    team1: "AAA",
    team2: "BBB",
    score,
  };
}

describe("isKnockoutRound", () => {
  it("treats matchday rounds as group stage", () => {
    assert.equal(isKnockoutRound("Matchday 1"), false);
    assert.equal(isKnockoutRound("Matchday 3"), false);
  });

  it("treats non-matchday rounds as knockout", () => {
    assert.equal(isKnockoutRound("Round of 16"), true);
    assert.equal(isKnockoutRound("Final"), true);
  });
});

describe("isMatchPlayed", () => {
  it("is true only when a full-time score exists", () => {
    assert.equal(isMatchPlayed(makeMatch({ ft: [1, 0] })), true);
    assert.equal(isMatchPlayed(makeMatch(undefined)), false);
    assert.equal(isMatchPlayed(makeMatch({ ht: [0, 0] })), false);
  });
});

describe("getMatchWinner", () => {
  it("returns null when the match has no full-time score", () => {
    assert.equal(getMatchWinner(makeMatch(undefined)), null);
  });

  it("returns the higher-scoring team in regulation", () => {
    assert.equal(getMatchWinner(makeMatch({ ft: [2, 1] })), "AAA");
    assert.equal(getMatchWinner(makeMatch({ ft: [0, 3] })), "BBB");
  });

  it("resolves draws via extra time", () => {
    assert.equal(getMatchWinner(makeMatch({ ft: [1, 1], et: [2, 1] })), "AAA");
    assert.equal(getMatchWinner(makeMatch({ ft: [1, 1], et: [1, 2] })), "BBB");
  });

  it("resolves extra-time draws via penalties", () => {
    assert.equal(
      getMatchWinner(makeMatch({ ft: [1, 1], et: [1, 1], p: [4, 3] })),
      "AAA",
    );
    assert.equal(
      getMatchWinner(makeMatch({ ft: [0, 0], p: [2, 4] })),
      "BBB",
    );
  });

  it("returns null when a draw cannot be broken", () => {
    assert.equal(getMatchWinner(makeMatch({ ft: [1, 1] })), null);
    assert.equal(getMatchWinner(makeMatch({ ft: [1, 1], et: [2, 2] })), null);
  });
});
