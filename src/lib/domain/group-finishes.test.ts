import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { applyWorldCupBundle } from "@/lib/data/worldcup-loader";
import {
  buildBestThirdRanking,
  getQualifyingThirdGroups,
} from "@/lib/domain/group-finishes";
import {
  groupAMatchesComplete,
  groupBMatchesComplete,
  restoreBundledWorldCup,
} from "@/lib/domain/test-fixtures";

afterEach(() => {
  restoreBundledWorldCup();
});

function withGroupsAAndB(): void {
  applyWorldCupBundle({
    name: "test",
    matches: [...groupAMatchesComplete(), ...groupBMatchesComplete()],
  });
}

describe("getQualifyingThirdGroups", () => {
  it("marks the best third-place groups as qualifying", () => {
    withGroupsAAndB();
    const finishes = {
      A: ["MEX", "CZE", "RSA", "KOR"],
      B: ["CAN", "SUI", "BIH", "QAT"],
    };
    const qualifying = getQualifyingThirdGroups(finishes);
    assert.ok(qualifying.has("A"));
    assert.ok(qualifying.has("B"));
  });
});

describe("buildBestThirdRanking", () => {
  it("ranks third-place teams and flags qualifiers", () => {
    withGroupsAAndB();
    const finishes = {
      A: ["MEX", "CZE", "RSA", "KOR"],
      B: ["CAN", "SUI", "BIH", "QAT"],
    };
    const ranking = buildBestThirdRanking(finishes);
    assert.equal(ranking.length, 2);
    assert.equal(ranking[0].rank, 1);
    assert.ok(ranking.every((entry) => entry.qualifies));
  });
});

describe("group finish stats reuse", () => {
  it("keeps actual group-stage stats when positions are swapped", () => {
    withGroupsAAndB();
    const finishes = {
      A: ["RSA", "MEX", "KOR", "CZE"],
      B: ["CAN", "SUI", "BIH", "QAT"],
    };
    const ranking = buildBestThirdRanking(finishes);
    const mexicoThird = ranking.find((entry) => entry.teamId === "MEX");
    assert.equal(mexicoThird, undefined);
  });
});
