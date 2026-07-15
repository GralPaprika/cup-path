import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildMatchOutcomeGapDataset,
  gapBinForPoints,
} from "@/lib/domain/match/match-outcome-gap";
import {
  createTestContext,
  playedGroupMatch,
  rankingEntry,
} from "@/lib/domain/core/test-fixtures";
import type { OpenFootballMatch } from "@/lib/types";

function knockoutMatch(
  team1: string,
  team2: string,
  score: OpenFootballMatch["score"],
  round = "Round of 16",
): OpenFootballMatch {
  return {
    team1,
    team2,
    round,
    date: "2026-07-01",
    num: 99,
    score,
  };
}

function rankingsMap(
  entries: Array<{ teamId: string; rank: number; points: number }>,
) {
  return new Map(entries.map((entry) => [entry.teamId, rankingEntry(entry.teamId, entry.rank, entry.points)]));
}

describe("buildMatchOutcomeGapDataset", () => {
  it("classifies group-stage draws from full-time goals", () => {
    const ctx = createTestContext([
      playedGroupMatch("Mexico", "Korea Republic", 1, 1),
    ]);
    const rankings = rankingsMap([
      { teamId: "MEX", rank: 10, points: 1800 },
      { teamId: "KOR", rank: 20, points: 1700 },
    ]);

    const dataset = buildMatchOutcomeGapDataset(ctx, rankings);
    assert.equal(dataset.matches.length, 1);
    assert.equal(dataset.matches[0].favoriteResult, "D");
    assert.equal(dataset.matches[0].gapPoints, 100);
  });

  it("classifies knockout extra-time wins as favorite win or upset", () => {
    const ctx = createTestContext([
      knockoutMatch("Belgium", "Senegal", { ft: [2, 2], et: [3, 2] }),
    ]);
    const rankings = rankingsMap([
      { teamId: "BEL", rank: 8, points: 1850 },
      { teamId: "SEN", rank: 30, points: 1650 },
    ]);

    const dataset = buildMatchOutcomeGapDataset(ctx, rankings);
    assert.equal(dataset.matches[0].favoriteResult, "W");
    assert.equal(dataset.matches[0].scoreLabel, "2-2 (3-2 aet)");
  });

  it("classifies penalty shootouts as draws for analytics", () => {
    const ctx = createTestContext([
      knockoutMatch("Germany", "Paraguay", {
        ft: [1, 1],
        et: [1, 1],
        p: [3, 4],
      }),
    ]);
    const rankings = rankingsMap([
      { teamId: "GER", rank: 5, points: 1900 },
      { teamId: "PAR", rank: 40, points: 1600 },
    ]);

    const dataset = buildMatchOutcomeGapDataset(ctx, rankings);
    assert.equal(dataset.matches[0].favoriteResult, "D");
    assert.equal(dataset.matches[0].scoreLabel, "1-1 (3-4 pens)");
  });

  it("maps favorite wins and upsets from favorite perspective", () => {
    const ctx = createTestContext([
      playedGroupMatch("Mexico", "South Africa", 2, 0),
      playedGroupMatch("South Africa", "Czechia", 2, 1),
    ]);
    const rankings = rankingsMap([
      { teamId: "MEX", rank: 10, points: 1800 },
      { teamId: "RSA", rank: 50, points: 1500 },
      { teamId: "CZE", rank: 25, points: 1700 },
    ]);

    const dataset = buildMatchOutcomeGapDataset(ctx, rankings);
    const favoriteWin = dataset.matches.find(
      (entry) => entry.team1.id === "MEX" && entry.team2.id === "RSA",
    );
    const upset = dataset.matches.find(
      (entry) => entry.team1.id === "RSA" && entry.team2.id === "CZE",
    );

    assert.equal(favoriteWin?.favoriteResult, "W");
    assert.equal(upset?.favoriteResult, "L");
  });

  it("treats equal FIFA points as evenly matched without a favorite", () => {
    const ctx = createTestContext([
      playedGroupMatch("Mexico", "Korea Republic", 1, 1),
      playedGroupMatch("Mexico", "Korea Republic", 2, 1),
    ]);
    const rankings = rankingsMap([
      { teamId: "MEX", rank: 10, points: 1800 },
      { teamId: "KOR", rank: 20, points: 1800 },
    ]);

    const dataset = buildMatchOutcomeGapDataset(ctx, rankings);
    assert.equal(dataset.matches.length, 1);

    const draw = dataset.matches[0];
    assert.equal(draw.favoriteResult, "D");
    assert.equal(draw.isEqualRating, true);
    assert.equal(draw.favoriteTeamId, null);
    assert.equal(draw.gapPoints, 0);
  });

  it("excludes decisive matches without resolvable favorite", () => {
    const ctx = createTestContext([
      playedGroupMatch("Mexico", "South Africa", 2, 0),
    ]);
    const rankings = rankingsMap([
      { teamId: "MEX", rank: 10, points: 1800 },
    ]);

    const dataset = buildMatchOutcomeGapDataset(ctx, rankings);
    assert.equal(dataset.matches.length, 0);
  });

  it("flags stage-local draw outliers using that stage's mean + 1 SD", () => {
    const matches = [
      playedGroupMatch("Mexico", "South Africa", 1, 1),
      playedGroupMatch("Mexico", "Czechia", 1, 1),
      playedGroupMatch("Korea Republic", "Czechia", 1, 1),
      playedGroupMatch("South Africa", "Korea Republic", 0, 1),
    ];
    const ctx = createTestContext(matches);
    const rankings = rankingsMap([
      { teamId: "MEX", rank: 10, points: 1800 },
      { teamId: "RSA", rank: 50, points: 1500 },
      { teamId: "CZE", rank: 25, points: 1700 },
      { teamId: "KOR", rank: 20, points: 1750 },
    ]);

    const dataset = buildMatchOutcomeGapDataset(ctx, rankings);
    const highGapDraw = dataset.matches.find(
      (entry) => entry.team1.id === "MEX" && entry.team2.id === "RSA",
    );
    assert.equal(highGapDraw?.favoriteResult, "D");
    assert.equal(highGapDraw?.isOutlier, true);
    assert.equal(highGapDraw?.outlierKind, "draw");
  });

  it("judges upset outliers only against the same stage's gap distribution", () => {
    const ctx = createTestContext([
      // Small-gap group upsets would pull a global upset threshold below 200.
      playedGroupMatch("South Africa", "Mexico", 1, 0),
      playedGroupMatch("Czechia", "Korea Republic", 1, 0),
      playedGroupMatch("South Africa", "Korea Republic", 1, 0),
      playedGroupMatch("Czechia", "Mexico", 1, 0),
      knockoutMatch("Belgium", "Senegal", { ft: [0, 1] }, "Round of 16"),
      knockoutMatch("Germany", "Paraguay", { ft: [2, 0] }, "Round of 16"),
      knockoutMatch("France", "Canada", { ft: [1, 0] }, "Round of 16"),
      knockoutMatch("Spain", "Morocco", { ft: [3, 0] }, "Round of 16"),
    ]);
    const rankings = rankingsMap([
      { teamId: "MEX", rank: 10, points: 1800 },
      { teamId: "KOR", rank: 20, points: 1720 },
      { teamId: "CZE", rank: 25, points: 1650 },
      { teamId: "RSA", rank: 50, points: 1550 },
      { teamId: "BEL", rank: 8, points: 1850 },
      { teamId: "SEN", rank: 30, points: 1650 },
      { teamId: "GER", rank: 5, points: 1900 },
      { teamId: "PAR", rank: 40, points: 1550 },
      { teamId: "FRA", rank: 4, points: 1920 },
      { teamId: "CAN", rank: 45, points: 1500 },
      { teamId: "ESP", rank: 3, points: 1950 },
      { teamId: "MAR", rank: 15, points: 1750 },
    ]);

    const dataset = buildMatchOutcomeGapDataset(ctx, rankings);
    const r16Upset = dataset.matches.find(
      (entry) => entry.team1.id === "BEL" && entry.team2.id === "SEN",
    );

    assert.equal(r16Upset?.stage, "r16");
    assert.equal(r16Upset?.favoriteResult, "L");
    assert.equal(r16Upset?.gapPoints, 200);
    // R16 all-tie gaps: 200, 350, 420, 200 → threshold ≈ 388, so 200 is not an R16 outlier.
    assert.equal(r16Upset?.isOutlier, false);
  });
});

describe("gapBinForPoints", () => {
  it("maps gaps into fixed bins", () => {
    assert.equal(gapBinForPoints(0), "0-25");
    assert.equal(gapBinForPoints(25), "0-25");
    assert.equal(gapBinForPoints(26), "26-50");
    assert.equal(gapBinForPoints(50), "26-50");
    assert.equal(gapBinForPoints(51), "51-100");
    assert.equal(gapBinForPoints(100), "51-100");
    assert.equal(gapBinForPoints(101), "101-250");
    assert.equal(gapBinForPoints(120), "101-250");
    assert.equal(gapBinForPoints(250), "101-250");
    assert.equal(gapBinForPoints(251), "251+");
    assert.equal(gapBinForPoints(300), "251+");
  });

  it("maps fractional FIFA gaps into the correct bin", () => {
    assert.equal(gapBinForPoints(100.38), "51-100");
    assert.equal(gapBinForPoints(50.5), "26-50");
    assert.equal(gapBinForPoints(100.99), "51-100");
    assert.equal(gapBinForPoints(101), "101-250");
    assert.equal(gapBinForPoints(250.99), "101-250");
    assert.equal(gapBinForPoints(251), "251+");
  });
});
