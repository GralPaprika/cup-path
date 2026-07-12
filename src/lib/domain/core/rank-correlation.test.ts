import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeCohortOrderingCorrelation,
  kendallTau,
  spearmanRho,
} from "@/lib/domain/core/rank-correlation";

describe("spearmanRho", () => {
  it("returns 1 for perfect agreement", () => {
    assert.equal(spearmanRho([1, 2, 3], [1, 2, 3]), 1);
  });

  it("returns -1 for perfect disagreement", () => {
    assert.equal(spearmanRho([1, 2, 3], [3, 2, 1]), -1);
  });
});

describe("kendallTau (tau-b)", () => {
  it("returns 1 for perfect agreement", () => {
    assert.equal(kendallTau([1, 2, 3], [1, 2, 3]), 1);
  });

  it("returns -1 for perfect disagreement", () => {
    assert.equal(kendallTau([1, 2, 3], [3, 2, 1]), -1);
  });

  it("accounts for ties without collapsing toward zero", () => {
    const rankA = [1.5, 1.5, 3];
    const rankB = [1, 2, 3];
    const tau = kendallTau(rankA, rankB);
    assert.ok(tau !== null);
    assert.ok(tau > 0.5);
  });

  it("returns null when denominator is zero", () => {
    assert.equal(kendallTau([1, 1, 1], [2, 2, 2]), null);
  });
});

describe("computeCohortOrderingCorrelation", () => {
  it("returns null coefficients for fewer than two teams", () => {
    const result = computeCohortOrderingCorrelation([1800], [10]);
    assert.equal(result.spearmanRho, null);
    assert.equal(result.kendallTau, null);
    assert.equal(result.comparableTeamCount, 1);
  });

  it("returns high correlation when orderings align", () => {
    const points = [1900, 1700, 1500];
    const ranks = [5, 15, 30];
    const result = computeCohortOrderingCorrelation(points, ranks);
    assert.ok(result.spearmanRho !== null && result.spearmanRho > 0.9);
    assert.ok(result.kendallTau !== null && result.kendallTau > 0.9);
  });
});
