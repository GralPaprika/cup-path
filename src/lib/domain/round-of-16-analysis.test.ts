import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { applyWorldCupBundle } from "@/lib/data/worldcup-loader";
import { buildRound16Analysis } from "@/lib/domain/round-of-16-analysis";
import {
  groupAMatchesComplete,
  groupBMatchesComplete,
  rankingEntry,
  restoreBundledWorldCup,
} from "@/lib/domain/test-fixtures";

afterEach(() => {
  restoreBundledWorldCup();
});

function rankingsMap(
  entries: Array<{ id: string; rank: number; points: number }>,
): Map<string, ReturnType<typeof rankingEntry>> {
  return new Map(
    entries.map(({ id, rank, points }) => [id, rankingEntry(id, rank, points)]),
  );
}

describe("buildRound16Analysis", () => {
  it("returns null when no Round of 16 matches have been played", () => {
    applyWorldCupBundle({
      name: "test",
      matches: [...groupAMatchesComplete(), ...groupBMatchesComplete()],
    });

    const rankings = rankingsMap([
      { id: "MEX", rank: 14, points: 1670 },
      { id: "CZE", rank: 22, points: 1590 },
      { id: "KOR", rank: 23, points: 1580 },
      { id: "RSA", rank: 60, points: 1400 },
    ]);

    assert.equal(buildRound16Analysis([], rankings), null);
  });

  it("builds one fixture row per played Round of 16 tie", () => {
    applyWorldCupBundle({
      name: "test",
      matches: [
        ...groupAMatchesComplete(),
        ...groupBMatchesComplete(),
        {
          round: "Round of 16",
          num: 89,
          date: "2026-07-04",
          team1: "Paraguay",
          team2: "France",
          score: { ft: [0, 1] },
        },
      ],
    });

    const rankings = rankingsMap([
      { id: "PAR", rank: 52, points: 1450 },
      { id: "FRA", rank: 2, points: 1850 },
      { id: "MEX", rank: 14, points: 1670 },
      { id: "CZE", rank: 22, points: 1590 },
      { id: "KOR", rank: 23, points: 1580 },
      { id: "RSA", rank: 60, points: 1400 },
    ]);

    const analysis = buildRound16Analysis([], rankings);

    assert.ok(analysis);
    assert.equal(analysis.matchCount, 1);
    assert.equal(analysis.participantCount, 2);
    assert.equal(analysis.fixtures.length, 1);

    const fixture = analysis.fixtures[0];
    assert.ok(fixture);
    assert.equal(fixture.winnerTeamId, "FRA");
    assert.equal(fixture.upsetWin, false);
    assert.equal(fixture.scoreFt, "0-1");
    assert.equal(fixture.team1.id, "PAR");
    assert.equal(fixture.team2.id, "FRA");
    assert.equal(fixture.gapPoints, 400);
  });
});
