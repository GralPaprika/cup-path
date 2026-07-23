import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeEvenMatchesByTier,
  higherTeamTier,
} from "@/lib/domain/match/even-matches-by-tier";
import type { MatchOutcomeGapEntry, PathStage, Team } from "@/lib/types";

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

function entry(opts: {
  index: number;
  stage?: PathStage;
  team1Points: number;
  team2Points: number;
}): MatchOutcomeGapEntry {
  const gapPoints = Math.abs(opts.team1Points - opts.team2Points);
  return {
    id: `m-${opts.index}`,
    matchNum: opts.index,
    stage: opts.stage ?? "group",
    round: "Matchday 1",
    groupLetter: "A",
    team1: team("AAA", "Alpha"),
    team2: team("BBB", "Beta"),
    team1FifaPoints: opts.team1Points,
    team2FifaPoints: opts.team2Points,
    gapPoints,
    favoriteTeamId:
      opts.team1Points >= opts.team2Points ? "AAA" : "BBB",
    favoriteResult: "W",
    isEqualRating: gapPoints === 0,
    scoreLabel: "1-0",
    isOutlier: false,
    outlierKind: null,
  };
}

describe("higherTeamTier", () => {
  it("returns the stronger tier", () => {
    assert.equal(
      higherTeamTier("titleFavorites", "contenders"),
      "titleFavorites",
    );
    assert.equal(higherTeamTier("outsiders", "makeweights"), "outsiders");
    assert.equal(higherTeamTier("darkHorses", "darkHorses"), "darkHorses");
  });
});

describe("computeEvenMatchesByTier", () => {
  it("returns null without group matches or even matches", () => {
    assert.equal(computeEvenMatchesByTier([]), null);
    assert.equal(
      computeEvenMatchesByTier([
        entry({
          index: 1,
          stage: "roundOf16",
          team1Points: 1800,
          team2Points: 1750,
        }),
      ]),
      null,
    );
    assert.equal(
      computeEvenMatchesByTier([
        entry({ index: 1, team1Points: 1800, team2Points: 1500 }),
      ]),
      null,
    );
  });

  it("buckets even group matches by the higher tier", () => {
    const insight = computeEvenMatchesByTier([
      // favorite vs contender (gap 50) → titleFavorites
      entry({ index: 1, team1Points: 1820, team2Points: 1770 }),
      // contender vs contender
      entry({ index: 2, team1Points: 1740, team2Points: 1710 }),
      // dark horse vs outsider (gap 80) → darkHorses
      entry({ index: 3, team1Points: 1600, team2Points: 1520 }),
      // wide gap — ignored
      entry({ index: 4, team1Points: 1850, team2Points: 1500 }),
      // knockout even match — ignored for buckets, counted in total
      entry({
        index: 5,
        stage: "roundOf16",
        team1Points: 1800,
        team2Points: 1750,
      }),
    ]);

    assert.ok(insight);
    assert.equal(insight.totalMatchCount, 5);
    assert.equal(insight.groupMatchCount, 4);
    assert.equal(insight.groupStagePct, 80);
    assert.equal(insight.evenMatchCount, 3);
    assert.deepEqual(insight.rows, [
      { tier: "titleFavorites", count: 1 },
      { tier: "contenders", count: 1 },
      { tier: "darkHorses", count: 1 },
    ]);
  });
});
