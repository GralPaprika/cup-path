import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeFilteredAverages } from "@/lib/domain/core/difficulty";
import type { MatchDifficulty, PathStage } from "@/lib/types";
import {
  assignCompetitionRanks,
  buildCompetitionRankMap,
  rankTeamInCohort,
} from "@/lib/domain/path/path-ranking";
import { computeMean, computeNumericStats } from "@/lib/domain/group/group-stats";
import { getMatchStage, isThirdPlaceMatch } from "@/lib/domain/match/match-stages";

function match(
  round: string,
  opponentPoints: number | null,
  opponentRank: number | null,
  isPlayed = true,
): MatchDifficulty {
  return {
    round,
    date: "2026-06-01",
    opponent: {
      id: "AAA",
      displayName: "Team A",
      fifaCode: "AAA",
      group: "A",
      confederation: "UEFA",
    },
    opponentPoints,
    opponentRank,
    teamRank: 10,
    teamPoints: 1500,
    rankGap: null,
    pointsGap: null,
    result: isPlayed ? "W" : null,
    scoreLabel: isPlayed ? "1-0" : null,
    isNext: false,
    isPlayed,
  };
}

describe("computeMean", () => {
  it("returns null for empty input", () => {
    assert.equal(computeMean([]), null);
  });

  it("computes arithmetic mean", () => {
    assert.equal(computeMean([10, 20, 30]), 20);
  });
});

describe("computeFilteredAverages", () => {
  const stages = new Set<PathStage>(["group", "r32"]);

  it("averages only matches in selected stages with data", () => {
    const matches = [
      match("Matchday 1", 1800, 5),
      match("Matchday 2", 1600, 20),
      match("Round of 32", 1900, 3),
      match("Round of 16", 1700, 12),
    ];

    const result = computeFilteredAverages(matches, stages);
    assert.equal(result.avgOpponentPoints, (1800 + 1600 + 1900) / 3);
    assert.equal(result.avgOpponentRank, (5 + 20 + 3) / 3);
  });

  it("excludes unplayed matches when playedOnly is set", () => {
    const matches = [
      match("Matchday 1", 1800, 5, true),
      match("Matchday 2", 1600, 20, false),
    ];

    const result = computeFilteredAverages(matches, new Set(["group"]), {
      playedOnly: true,
    });
    assert.equal(result.avgOpponentPoints, 1800);
    assert.equal(result.avgOpponentRank, 5);
  });

  it("excludes the third-place match from path stages", () => {
    assert.equal(getMatchStage("Match for third place"), null);
    assert.equal(isThirdPlaceMatch("Match for third place"), true);
    assert.equal(isThirdPlaceMatch("Final"), false);
  });
});

describe("competition ranks", () => {
  it("assigns shared ranks for ties (1224)", () => {
    assert.deepEqual(assignCompetitionRanks([100, 90, 90, 80], true), [1, 2, 2, 4]);
  });

  it("builds rank map for cohort entries", () => {
    const map = buildCompetitionRankMap(
      [
        { teamId: "A", value: 100 },
        { teamId: "B", value: 90 },
        { teamId: "C", value: 90 },
      ],
      true,
    );
    assert.equal(map.get("A"), 1);
    assert.equal(map.get("B"), 2);
    assert.equal(map.get("C"), 2);
  });

  it("returns null when team is absent from cohort", () => {
    const rank = rankTeamInCohort(
      [{ teamId: "A", value: 100 }],
      "B",
      true,
    );
    assert.equal(rank, null);
  });
});

describe("computeNumericStats", () => {
  it("uses population variance", () => {
    const stats = computeNumericStats([2, 4, 4, 4, 5, 5, 7, 9]);
    assert.equal(stats.mean, 5);
    assert.equal(stats.variance, 4);
    assert.equal(stats.stdDev, 2);
  });
});
