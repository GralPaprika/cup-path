import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildBestThirdRanking,
  getQualifyingThirdGroups,
} from "@/lib/domain/group/group-finishes";
import {
  createTestContext,
  groupAMatchesComplete,
  groupBMatchesComplete,
} from "@/lib/domain/core/test-fixtures";

function groupsABContext() {
  return createTestContext([...groupAMatchesComplete(), ...groupBMatchesComplete()]);
}

describe("getQualifyingThirdGroups", () => {
  it("marks the best third-place groups as qualifying", () => {
    const ctx = groupsABContext();
    const finishes = {
      A: ["MEX", "CZE", "RSA", "KOR"],
      B: ["CAN", "SUI", "BIH", "QAT"],
    };
    const qualifying = getQualifyingThirdGroups(ctx, finishes);
    assert.ok(qualifying.has("A"));
    assert.ok(qualifying.has("B"));
  });
});

describe("buildBestThirdRanking", () => {
  it("ranks third-place teams and flags qualifiers", () => {
    const ctx = groupsABContext();
    const finishes = {
      A: ["MEX", "CZE", "RSA", "KOR"],
      B: ["CAN", "SUI", "BIH", "QAT"],
    };
    const ranking = buildBestThirdRanking(ctx, finishes);
    assert.equal(ranking.length, 2);
    assert.equal(ranking[0].rank, 1);
    assert.ok(ranking.every((entry) => entry.qualifies));
  });
});

describe("group finish stats reuse", () => {
  it("keeps actual group-stage stats when positions are swapped", () => {
    const ctx = groupsABContext();
    const finishes = {
      A: ["RSA", "MEX", "KOR", "CZE"],
      B: ["CAN", "SUI", "BIH", "QAT"],
    };
    const ranking = buildBestThirdRanking(ctx, finishes);
    const mexicoThird = ranking.find((entry) => entry.teamId === "MEX");
    assert.equal(mexicoThird, undefined);
  });
});
