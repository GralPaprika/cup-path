import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAvgPointsContext,
  computePointsPercentile,
  findClosestPointsAnchor,
} from "@/lib/domain/points-anchor";
import { rankingEntry } from "@/lib/domain/test-fixtures";

const rankings = [
  rankingEntry("MEX", 10, 1800),
  rankingEntry("ARG", 1, 1900),
  rankingEntry("CAN", 20, 1700),
  rankingEntry("RSA", 50, 1500),
];

describe("computePointsPercentile", () => {
  it("returns null for null target", () => {
    assert.equal(computePointsPercentile(null, rankings), null);
  });

  it("uses strict less-than comparison", () => {
    const result = computePointsPercentile(1700, rankings);
    assert.ok(result);
    assert.equal(result.percentile, 25);
    assert.equal(result.poolSize, 4);
  });

  it("returns 0 when target is lowest", () => {
    const result = computePointsPercentile(1500, rankings);
    assert.ok(result);
    assert.equal(result.percentile, 0);
  });
});

describe("findClosestPointsAnchor", () => {
  it("picks closest points and breaks ties by rank", () => {
    const entries = [
      rankingEntry("MEX", 5, 1750),
      rankingEntry("ARG", 3, 1750),
    ];
    const anchor = findClosestPointsAnchor(1748, entries);
    assert.ok(anchor);
    assert.equal(anchor.team.id, "ARG");
    assert.equal(anchor.gap, 2);
  });

  it("excludes team when excludeTeamId is set", () => {
    const anchor = findClosestPointsAnchor(
      1800,
      rankings,
      { excludeTeamId: "MEX" },
    );
    assert.ok(anchor);
    assert.equal(anchor.team.id, "ARG");
  });
});

describe("buildAvgPointsContext", () => {
  it("combines percentile and anchor", () => {
    const context = buildAvgPointsContext(1800, rankings, {
      excludeTeamId: "MEX",
    });
    assert.ok(context);
    assert.equal(context.poolSize, 4);
    assert.ok(context.anchor);
  });
});
