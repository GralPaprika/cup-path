import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { GroupComparisonCard } from "@/lib/types";
import { computeGroupStrengthOrdering } from "@/lib/domain/group/group-strength-ordering";

function groupCard(
  letter: string,
  avgFifaPoints: number,
  avgFifaRank: number,
): GroupComparisonCard {
  return {
    groupName: `Group ${letter}`,
    groupLetter: letter,
    teams: [],
    isComplete: true,
    avgFifaRank,
    avgFifaPoints,
    fifaRankStats: {
      count: 4,
      mean: avgFifaRank,
      median: avgFifaRank,
      variance: 0,
      stdDev: 0,
      min: avgFifaRank,
      max: avgFifaRank,
    },
    fifaPointsStats: {
      count: 4,
      mean: avgFifaPoints,
      median: avgFifaPoints,
      variance: 0,
      stdDev: 0,
      min: avgFifaPoints,
      max: avgFifaPoints,
    },
  };
}

describe("computeGroupStrengthOrdering", () => {
  it("assigns shared 1224 ranks for tied average FIFA points", () => {
    const ordering = computeGroupStrengthOrdering([
      groupCard("A", 1800, 10),
      groupCard("B", 1700, 20),
      groupCard("C", 1650, 25),
      groupCard("D", 1650, 26),
      groupCard("E", 1600, 30),
    ]);

    assert.equal(ordering.rankByPoints.A, 1);
    assert.equal(ordering.rankByPoints.B, 2);
    assert.equal(ordering.rankByPoints.C, 3);
    assert.equal(ordering.rankByPoints.D, 3);
    assert.equal(ordering.rankByPoints.E, 5);
  });

  it("ranks lower average FIFA rank as stronger (rank 1)", () => {
    const ordering = computeGroupStrengthOrdering([
      groupCard("A", 1800, 12),
      groupCard("B", 1800, 8),
    ]);

    assert.equal(ordering.rankByAvgRank.B, 1);
    assert.equal(ordering.rankByAvgRank.A, 2);
  });
});
