import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildGroupExpectedAnalysis } from "@/lib/domain/group-expected-finishes";
import {
  createTestContext,
  groupAMatchesComplete,
  groupBMatchesComplete,
  playedGroupMatch,
  rankingEntry,
} from "@/lib/domain/test-fixtures";

function rankingsMap(
  entries: Array<{ id: string; rank: number; points: number }>,
): Map<string, ReturnType<typeof rankingEntry>> {
  return new Map(
    entries.map(({ id, rank, points }) => [id, rankingEntry(id, rank, points)]),
  );
}

function gapForEntry(entry: { gapPoints: number }): number {
  return entry.gapPoints;
}

describe("buildGroupExpectedAnalysis", () => {
  it("marks favorite win as expected and landed", () => {
    const ctx = createTestContext(groupAMatchesComplete());

    const rankings = rankingsMap([
      { id: "MEX", rank: 14, points: 1700 },
      { id: "CZE", rank: 22, points: 1600 },
      { id: "KOR", rank: 23, points: 1500 },
      { id: "RSA", rank: 55, points: 1400 },
    ]);
    const analysis = buildGroupExpectedAnalysis(ctx, rankings);

    assert.ok(analysis);
    const mexVsRsa = analysis.matchLedger.find(
      (entry) =>
        entry.team1.id === "MEX" &&
        entry.team2.id === "RSA" &&
        entry.team1Expected === "W" &&
        entry.team1Actual === "W",
    );
    assert.ok(mexVsRsa);
    assert.equal(mexVsRsa.expectedWinLanded, true);
    assert.equal(mexVsRsa.expectedWinMissed, false);
  });

  it("marks favorite loss as expected win missed with upset", () => {
    const ctx = createTestContext([
        playedGroupMatch("Mexico", "South Africa", 0, 2, {
          round: "Matchday 1",
          date: "2026-06-11",
        }),
        ...groupAMatchesComplete().slice(1),
      ]);

    const rankings = rankingsMap([
      { id: "MEX", rank: 14, points: 1700 },
      { id: "CZE", rank: 22, points: 1600 },
      { id: "KOR", rank: 23, points: 1500 },
      { id: "RSA", rank: 55, points: 1400 },
    ]);
    const analysis = buildGroupExpectedAnalysis(ctx, rankings);

    assert.ok(analysis);
    const upset = analysis.matchLedger.find(
      (entry) => entry.team1.id === "MEX" && entry.team2.id === "RSA",
    );
    assert.ok(upset);
    assert.equal(upset.expectedWinMissed, true);
    assert.equal(upset.unexpectedDefeat, true);
    assert.equal(upset.upsetWin, true);
  });

  it("expects a draw when FIFA points are equal", () => {
    const ctx = createTestContext([
        playedGroupMatch("Mexico", "Czechia", 1, 1, {
          round: "Matchday 1",
          date: "2026-06-11",
        }),
        playedGroupMatch("Korea Republic", "South Africa", 2, 0, {
          round: "Matchday 1",
          date: "2026-06-11",
        }),
        playedGroupMatch("Mexico", "Korea Republic", 1, 0, {
          round: "Matchday 2",
          date: "2026-06-18",
        }),
        playedGroupMatch("South Africa", "Czechia", 0, 3, {
          round: "Matchday 2",
          date: "2026-06-18",
        }),
        playedGroupMatch("Mexico", "Czechia", 3, 1, {
          round: "Matchday 3",
          date: "2026-06-25",
        }),
        playedGroupMatch("South Africa", "Korea Republic", 2, 1, {
          round: "Matchday 3",
          date: "2026-06-25",
        }),
      ]);

    const rankings = rankingsMap([
      { id: "MEX", rank: 14, points: 1600 },
      { id: "CZE", rank: 22, points: 1600 },
      { id: "KOR", rank: 23, points: 1500 },
      { id: "RSA", rank: 55, points: 1400 },
    ]);
    const analysis = buildGroupExpectedAnalysis(ctx, rankings);

    assert.ok(analysis);
    const equalRatedDraw = analysis.matchLedger.find(
      (entry) => entry.team1.id === "MEX" && entry.team2.id === "CZE",
    );
    assert.ok(equalRatedDraw);
    assert.equal(equalRatedDraw.team1Expected, "D");
    assert.equal(equalRatedDraw.team2Expected, "D");
    assert.equal(equalRatedDraw.team1Actual, "D");
    assert.equal(equalRatedDraw.expectedWinLanded, true);
  });

  it("orders expected positions by expected points then FIFA points", () => {
    const ctx = createTestContext(groupAMatchesComplete());

    const rankings = rankingsMap([
      { id: "MEX", rank: 14, points: 1700 },
      { id: "CZE", rank: 22, points: 1600 },
      { id: "KOR", rank: 23, points: 1500 },
      { id: "RSA", rank: 55, points: 1400 },
    ]);
    const analysis = buildGroupExpectedAnalysis(ctx, rankings);

    assert.ok(analysis);
    const mexFinish = analysis.expectedFinishes.find(
      (finish) => finish.team.id === "MEX",
    );
    assert.ok(mexFinish);
    assert.equal(mexFinish.expectedPosition, 1);
    assert.equal(mexFinish.actualPosition, 1);
  });

  it("flags eliminated teams that finished worse than their paper position", () => {
    const ctx = createTestContext([
        ...groupAMatchesComplete().slice(0, -1),
        playedGroupMatch("South Africa", "Korea Republic", 1, 2, {
          round: "Matchday 3",
          date: "2026-06-25",
        }),
      ]);

    const rankings = rankingsMap([
      { id: "RSA", rank: 8, points: 1900 },
      { id: "MEX", rank: 14, points: 1700 },
      { id: "CZE", rank: 22, points: 1600 },
      { id: "KOR", rank: 23, points: 1500 },
    ]);
    const analysis = buildGroupExpectedAnalysis(ctx, rankings);

    assert.ok(analysis);
    const rsa = analysis.eliminatedUnderperformers.find(
      (entry) => entry.team.id === "RSA",
    );
    assert.ok(rsa);
    assert.equal(rsa.expectedPosition, 1);
    assert.equal(rsa.actualPosition, 4);
    assert.equal(rsa.positionDelta, 3);
  });

  it("omits incomplete groups from the analysis", () => {
    const ctx = createTestContext(groupAMatchesComplete().slice(0, 2));

    const rankings = rankingsMap([
      { id: "MEX", rank: 14, points: 1700 },
      { id: "CZE", rank: 22, points: 1600 },
      { id: "KOR", rank: 23, points: 1500 },
      { id: "RSA", rank: 55, points: 1400 },
    ]);
    const analysis = buildGroupExpectedAnalysis(ctx, rankings);

    assert.equal(analysis, null);
  });

  it("aggregates match counts across complete groups", () => {
    const ctx = createTestContext([...groupAMatchesComplete(), ...groupBMatchesComplete()]);

    const rankings = rankingsMap([
      { id: "MEX", rank: 14, points: 1700 },
      { id: "CZE", rank: 22, points: 1600 },
      { id: "KOR", rank: 23, points: 1500 },
      { id: "RSA", rank: 55, points: 1400 },
      { id: "CAN", rank: 30, points: 1650 },
      { id: "SUI", rank: 18, points: 1620 },
      { id: "BIH", rank: 45, points: 1450 },
      { id: "QAT", rank: 60, points: 1380 },
    ]);
    const analysis = buildGroupExpectedAnalysis(ctx, rankings);

    assert.ok(analysis);
    assert.equal(analysis.matchCount, 12);
    assert.ok(analysis.meanAbsPointsGapFavorite !== null);
    assert.ok(analysis.favoriteMatchCount > 0);
  });

  it("computes draw gap stats from actual drawn matches", () => {
    const ctx = createTestContext([
        playedGroupMatch("Mexico", "Czechia", 1, 1, {
          round: "Matchday 1",
          date: "2026-06-11",
        }),
        playedGroupMatch("Korea Republic", "South Africa", 2, 0, {
          round: "Matchday 1",
          date: "2026-06-11",
        }),
        playedGroupMatch("Mexico", "Korea Republic", 1, 0, {
          round: "Matchday 2",
          date: "2026-06-18",
        }),
        playedGroupMatch("South Africa", "Czechia", 1, 1, {
          round: "Matchday 2",
          date: "2026-06-18",
        }),
        playedGroupMatch("Mexico", "Czechia", 3, 1, {
          round: "Matchday 3",
          date: "2026-06-25",
        }),
        playedGroupMatch("South Africa", "Korea Republic", 2, 1, {
          round: "Matchday 3",
          date: "2026-06-25",
        }),
      ]);

    const rankings = rankingsMap([
      { id: "MEX", rank: 14, points: 1600 },
      { id: "CZE", rank: 22, points: 1600 },
      { id: "KOR", rank: 23, points: 1500 },
      { id: "RSA", rank: 55, points: 1400 },
    ]);
    const analysis = buildGroupExpectedAnalysis(ctx, rankings);

    assert.ok(analysis);
    assert.equal(analysis.actualDrawCount, 2);
    assert.equal(analysis.minPointsGapOnDraw, 0);
    assert.equal(analysis.maxPointsGapOnDraw, 200);
    assert.equal(analysis.meanPointsGapOnDraws, 100);
    assert.ok(analysis.highestGapDrawMatch);
    assert.equal(gapForEntry(analysis.highestGapDrawMatch!), 200);
    assert.ok(analysis.lowestGapDrawMatch);
    assert.equal(gapForEntry(analysis.lowestGapDrawMatch!), 0);
    assert.equal(analysis.stdDevPointsGapOnDraws, 100);

    const equalDraw = analysis.drawMatches.find(
      (entry) => entry.paperDrawNote === "equalRating",
    );
    assert.ok(equalDraw);
    assert.equal(equalDraw.gapPoints, 0);
    assert.equal(equalDraw.isDrawGapOutlier, false);

    const outlierDraw = analysis.drawMatches.find(
      (entry) => entry.gapPoints === 200,
    );
    assert.ok(outlierDraw);
    assert.equal(outlierDraw.paperDrawNote, "favoriteDrew");
    assert.equal(outlierDraw.isDrawGapOutlier, true);
    assert.ok(analysis.biggestUnderdogDrawMatch);
    assert.equal(analysis.biggestUnderdogDrawMatch?.gapPoints, 200);
    assert.equal(analysis.biggestUnderdogDrawMatch?.paperDrawNote, "favoriteDrew");
  });

  it("sorts draw matches by gap descending", () => {
    const ctx = createTestContext([
        playedGroupMatch("Mexico", "Czechia", 1, 1, {
          round: "Matchday 1",
          date: "2026-06-11",
        }),
        playedGroupMatch("Korea Republic", "South Africa", 2, 0, {
          round: "Matchday 1",
          date: "2026-06-11",
        }),
        playedGroupMatch("Mexico", "Korea Republic", 1, 0, {
          round: "Matchday 2",
          date: "2026-06-18",
        }),
        playedGroupMatch("South Africa", "Czechia", 1, 1, {
          round: "Matchday 2",
          date: "2026-06-18",
        }),
        playedGroupMatch("Mexico", "Czechia", 3, 1, {
          round: "Matchday 3",
          date: "2026-06-25",
        }),
        playedGroupMatch("South Africa", "Korea Republic", 2, 1, {
          round: "Matchday 3",
          date: "2026-06-25",
        }),
      ]);

    const rankings = rankingsMap([
      { id: "MEX", rank: 14, points: 1600 },
      { id: "CZE", rank: 22, points: 1600 },
      { id: "KOR", rank: 23, points: 1500 },
      { id: "RSA", rank: 55, points: 1400 },
    ]);
    const analysis = buildGroupExpectedAnalysis(ctx, rankings);

    assert.ok(analysis);
    assert.equal(
      analysis.drawMatches.every(
        (entry, index, list) =>
          index === 0 || entry.gapPoints <= list[index - 1]!.gapPoints,
      ),
      true,
    );
  });

  it("computes win/loss gap stats from decisive group matches", () => {
    const ctx = createTestContext(groupAMatchesComplete());

    const rankings = rankingsMap([
      { id: "MEX", rank: 14, points: 1700 },
      { id: "CZE", rank: 22, points: 1600 },
      { id: "KOR", rank: 23, points: 1500 },
      { id: "RSA", rank: 55, points: 1400 },
    ]);
    const analysis = buildGroupExpectedAnalysis(ctx, rankings);

    assert.ok(analysis);
    assert.equal(analysis.actualWinLossCount, 5);
    assert.ok(analysis.meanPointsGapOnWinLoss !== null);
    assert.ok(analysis.highestGapWinLossMatch);
    assert.ok(analysis.lowestGapWinLossMatch);
    assert.ok(analysis.highestGapWinLossMatch?.scoreLabel);
  });

  it("annotates win/loss matches with big surprise and SD outlier flags", () => {
    const ctx = createTestContext([
        playedGroupMatch("Mexico", "South Africa", 0, 2, {
          round: "Matchday 1",
          date: "2026-06-11",
        }),
        ...groupAMatchesComplete().slice(1),
      ]);

    const rankings = rankingsMap([
      { id: "MEX", rank: 14, points: 1700 },
      { id: "CZE", rank: 22, points: 1600 },
      { id: "KOR", rank: 23, points: 1500 },
      { id: "RSA", rank: 55, points: 1400 },
    ]);
    const analysis = buildGroupExpectedAnalysis(ctx, rankings);

    assert.ok(analysis);
    assert.equal(analysis.winLossMatches.length, 5);
    assert.equal(
      analysis.winLossMatches.every(
        (entry, index, list) =>
          index === 0 || entry.gapPoints <= list[index - 1]!.gapPoints,
      ),
      true,
    );

    const upset = analysis.winLossMatches.find(
      (entry) => entry.team1.id === "MEX" && entry.team2.id === "RSA",
    );
    assert.ok(upset);
    assert.equal(upset.upsetWin, true);
    assert.equal(upset.isWinLossGapOutlier, true);
    assert.equal(analysis.biggestUnderdogWinMatch?.upsetWin, true);
    assert.ok((analysis.biggestUnderdogWinMatch?.gapPoints ?? 0) >= upset.gapPoints);

    const favoriteWin = analysis.winLossMatches.find(
      (entry) =>
        entry.team1.id === "MEX" &&
        entry.team2.id === "KOR" &&
        entry.expectedWinLanded,
    );
    assert.ok(favoriteWin);
    assert.equal(favoriteWin.isWinLossGapOutlier, false);
  });

  it("splits gap stats between favorite and evenly matched matches", () => {
    const ctx = createTestContext([
        playedGroupMatch("Mexico", "Czechia", 1, 1, {
          round: "Matchday 1",
          date: "2026-06-11",
        }),
        playedGroupMatch("Korea Republic", "South Africa", 2, 0, {
          round: "Matchday 1",
          date: "2026-06-11",
        }),
        playedGroupMatch("Mexico", "Korea Republic", 1, 0, {
          round: "Matchday 2",
          date: "2026-06-18",
        }),
        playedGroupMatch("South Africa", "Czechia", 0, 3, {
          round: "Matchday 2",
          date: "2026-06-18",
        }),
        playedGroupMatch("Mexico", "Czechia", 3, 1, {
          round: "Matchday 3",
          date: "2026-06-25",
        }),
        playedGroupMatch("South Africa", "Korea Republic", 2, 1, {
          round: "Matchday 3",
          date: "2026-06-25",
        }),
      ]);

    const rankings = rankingsMap([
      { id: "MEX", rank: 14, points: 1600 },
      { id: "CZE", rank: 22, points: 1600 },
      { id: "KOR", rank: 23, points: 1500 },
      { id: "RSA", rank: 55, points: 1400 },
    ]);
    const analysis = buildGroupExpectedAnalysis(ctx, rankings);

    assert.ok(analysis);
    assert.equal(analysis.equalRatingMatchCount, 2);
    assert.equal(analysis.favoriteMatchCount, 4);
    assert.ok(analysis.meanAbsPointsGapFavorite !== null);
  });
});
