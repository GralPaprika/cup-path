import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildKnockoutStageAnalysis } from "@/lib/domain/knockout-stage-analysis";
import {
  createTestContext,
  groupAMatchesComplete,
  groupBMatchesComplete,
  rankingEntry,
} from "@/lib/domain/test-fixtures";

function rankingsMap(
  entries: Array<{ id: string; rank: number; points: number }>,
): Map<string, ReturnType<typeof rankingEntry>> {
  return new Map(
    entries.map(({ id, rank, points }) => [id, rankingEntry(id, rank, points)]),
  );
}

describe("buildKnockoutStageAnalysis", () => {
  it("returns null when no Round of 32 matches have been played", () => {
    const ctx = createTestContext([...groupAMatchesComplete(), ...groupBMatchesComplete()]);

    const rankings = rankingsMap([
      { id: "MEX", rank: 14, points: 1670 },
      { id: "CZE", rank: 22, points: 1590 },
      { id: "KOR", rank: 23, points: 1580 },
      { id: "RSA", rank: 60, points: 1400 },
    ]);

    assert.equal(buildKnockoutStageAnalysis(ctx, "Round of 32", rankings), null);
  });

  it("builds one fixture row per played Round of 32 tie", () => {
    const ctx = createTestContext([
        ...groupAMatchesComplete(),
        ...groupBMatchesComplete(),
        {
          round: "Round of 32",
          num: 73,
          date: "2026-06-29",
          team1: "Netherlands",
          team2: "Morocco",
          score: { ft: [1, 1], p: [4, 3] },
        },
      ]);

    const rankings = rankingsMap([
      { id: "NED", rank: 7, points: 1756 },
      { id: "MAR", rank: 11, points: 1713 },
      { id: "MEX", rank: 14, points: 1670 },
      { id: "CZE", rank: 22, points: 1590 },
      { id: "KOR", rank: 23, points: 1580 },
      { id: "RSA", rank: 60, points: 1400 },
    ]);

    const analysis = buildKnockoutStageAnalysis(ctx, "Round of 32", rankings);

    assert.ok(analysis);
    assert.equal(analysis.matchCount, 1);
    assert.equal(analysis.participantCount, 2);
    assert.equal(analysis.avgParticipantFifaPoints, 1734.5);
    assert.equal(analysis.medianParticipantFifaRank, 9);
    assert.equal(analysis.fixtures.length, 1);

    const fixture = analysis.fixtures[0];
    assert.ok(fixture);
    assert.equal(fixture.winnerTeamId, "NED");
    assert.equal(fixture.upsetWin, false);
    assert.equal(fixture.scoreFt, "1-1");
    assert.equal(fixture.scorePens, "4-3");
    assert.equal(fixture.team1.id, "NED");
    assert.equal(fixture.team2.id, "MAR");
  });

  it("returns null when no Round of 16 matches have been played", () => {
    const ctx = createTestContext([...groupAMatchesComplete(), ...groupBMatchesComplete()]);

    const rankings = rankingsMap([
      { id: "MEX", rank: 14, points: 1670 },
      { id: "CZE", rank: 22, points: 1590 },
    ]);

    assert.equal(buildKnockoutStageAnalysis(ctx, "Round of 16", rankings), null);
  });
});
