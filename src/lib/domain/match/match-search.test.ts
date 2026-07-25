import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  matchTargetMatchesQuery,
  type MatchSearchTarget,
} from "@/lib/domain/match/match-search";

function target(
  overrides: Partial<MatchSearchTarget> = {},
): MatchSearchTarget {
  return {
    teamIds: ["MEX", "NED"],
    teamNames: ["Mexico", "Netherlands"],
    scoreFt: "2-1",
    scoreEt: null,
    decidedOnPenalties: false,
    ...overrides,
  };
}

describe("matchTargetMatchesQuery", () => {
  it("matches every row when the query is empty", () => {
    assert.equal(matchTargetMatchesQuery(target(), ""), true);
    assert.equal(matchTargetMatchesQuery(target(), "   "), true);
  });

  it("matches a score in either order", () => {
    const row = target({ scoreFt: "3-1" });
    assert.equal(matchTargetMatchesQuery(row, "3-1"), true);
    assert.equal(matchTargetMatchesQuery(row, "1-3"), true);
    assert.equal(matchTargetMatchesQuery(row, "3 - 1"), true);
    assert.equal(matchTargetMatchesQuery(row, "3:1"), true);
  });

  it("rejects numbers without a score separator", () => {
    assert.equal(matchTargetMatchesQuery(target({ scoreFt: "3-1" }), "31"), false);
  });

  it("matches an extra-time score when querying that line", () => {
    const row = target({
      scoreFt: "1-1",
      scoreEt: "3-1",
    });
    assert.equal(matchTargetMatchesQuery(row, "3-1"), true);
    assert.equal(matchTargetMatchesQuery(row, "1-3"), true);
    assert.equal(matchTargetMatchesQuery(row, "2-0"), false);
  });

  it("matches extra-time and penalty keywords", () => {
    const etRow = target({ scoreFt: "1-1", scoreEt: "2-1" });
    assert.equal(matchTargetMatchesQuery(etRow, "et"), true);
    assert.equal(matchTargetMatchesQuery(etRow, "aet"), true);
    assert.equal(matchTargetMatchesQuery(etRow, "extra"), true);
    assert.equal(matchTargetMatchesQuery(etRow, "prorroga"), true);

    const pensRow = target({
      scoreFt: "1-1",
      scoreEt: "1-1",
      decidedOnPenalties: true,
    });
    assert.equal(matchTargetMatchesQuery(pensRow, "pens"), true);
    assert.equal(matchTargetMatchesQuery(pensRow, "penales"), true);
    assert.equal(matchTargetMatchesQuery(pensRow, "shootout"), true);

    const noKeywordHit = target({
      teamIds: ["BRA", "ARG"],
      teamNames: ["Brazil", "Argentina"],
      scoreEt: null,
      decidedOnPenalties: false,
    });
    assert.equal(matchTargetMatchesQuery(noKeywordHit, "et"), false);
    assert.equal(matchTargetMatchesQuery(noKeywordHit, "pens"), false);
  });

  it("matches FIFA codes and accented country names", () => {
    const row = target({
      teamIds: ["MEX", "CUW"],
      teamNames: ["Mexico", "Curaçao"],
    });
    assert.equal(matchTargetMatchesQuery(row, "mex"), true);
    assert.equal(matchTargetMatchesQuery(row, "curacao"), true);
    assert.equal(matchTargetMatchesQuery(row, "cura"), true);
    assert.equal(matchTargetMatchesQuery(row, "brazil"), false);
  });

  it("does not fall through to name matching for score queries", () => {
    // "1-0" must not match a team named something containing "1-0"
    const row = target({
      teamIds: ["AAA", "BBB"],
      teamNames: ["Team 10", "Other"],
      scoreFt: "2-2",
    });
    assert.equal(matchTargetMatchesQuery(row, "1-0"), false);
  });

  it("still finds Netherlands when querying et via team name union", () => {
    // "et" is both an ET keyword and a substring of "Netherlands"
    const regulation = target({
      teamIds: ["MEX", "NED"],
      teamNames: ["Mexico", "Netherlands"],
      scoreEt: null,
    });
    assert.equal(matchTargetMatchesQuery(regulation, "et"), true);
  });
});
