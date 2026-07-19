import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeGapStoryInsight } from "@/components/facts/match-outcome-gap-chart";
import type { MatchOutcomeGapEntry, Team } from "@/lib/types";

function team(id: string, name: string): Team {
  return {
    id,
    displayName: name,
    aliases: [name],
    group: "A",
    flagUrl: "",
    confederation: "UEFA",
  };
}

function entry(
  gapPoints: number,
  favoriteResult: MatchOutcomeGapEntry["favoriteResult"],
  index: number,
): MatchOutcomeGapEntry {
  return {
    id: `m-${index}`,
    matchNum: index,
    stage: "group",
    round: "Matchday 1",
    groupLetter: "A",
    team1: team("AAA", "Alpha"),
    team2: team("BBB", "Beta"),
    team1FifaPoints: 1800,
    team2FifaPoints: 1800 - gapPoints,
    gapPoints,
    favoriteTeamId: "AAA",
    favoriteResult,
    isEqualRating: gapPoints === 0,
    scoreLabel: "1-0",
    isOutlier: false,
    outlierKind: null,
  };
}

describe("computeGapStoryInsight", () => {
  it("returns null when either bin has fewer than 3 matches", () => {
    const matches = [
      entry(50, "L", 1),
      entry(80, "D", 2),
      entry(300, "W", 3),
      entry(400, "W", 4),
      entry(500, "D", 5),
    ];
    assert.equal(computeGapStoryInsight(matches), null);
  });

  it("summarizes underdog results in the close and wide bins", () => {
    const matches = [
      entry(50, "L", 1),
      entry(80, "D", 2),
      entry(100, "D", 3),
      entry(20, "W", 4),
      entry(300, "W", 5),
      entry(400, "W", 6),
      entry(500, "D", 7),
      entry(260, "W", 8),
    ];

    const insight = computeGapStoryInsight(matches);
    assert.ok(insight);
    assert.equal(insight.closeCount, 4);
    assert.equal(insight.closeUnderdogWins, 1);
    assert.equal(insight.closeDraws, 2);
    assert.equal(insight.closePointPct, 75);
    assert.equal(insight.wideCount, 4);
    assert.equal(insight.wideUnderdogWins, 0);
    assert.equal(insight.wideDraws, 1);
  });
});
