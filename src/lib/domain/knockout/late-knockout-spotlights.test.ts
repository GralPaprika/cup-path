import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildKnockoutStageAnalysis } from "@/lib/domain/knockout/knockout-stage-analysis";
import { buildLateKnockoutMatchSpotlights } from "@/lib/domain/knockout/late-knockout-spotlights";
import {
  createTestContext,
  groupAMatchesComplete,
  groupBMatchesComplete,
  rankingEntry,
} from "@/lib/domain/core/test-fixtures";

function rankingsMap(
  entries: Array<{ id: string; rank: number; points: number }>,
): Map<string, ReturnType<typeof rankingEntry>> {
  return new Map(
    entries.map(({ id, rank, points }) => [id, rankingEntry(id, rank, points)]),
  );
}

const BASE_RANKINGS = rankingsMap([
  { id: "MEX", rank: 14, points: 1670 },
  { id: "CZE", rank: 22, points: 1590 },
  { id: "KOR", rank: 23, points: 1580 },
  { id: "RSA", rank: 60, points: 1400 },
  { id: "CAN", rank: 40, points: 1500 },
  { id: "SUI", rank: 18, points: 1630 },
  { id: "BIH", rank: 70, points: 1350 },
  { id: "QAT", rank: 50, points: 1450 },
  { id: "NED", rank: 7, points: 1756 },
  { id: "MAR", rank: 11, points: 1713 },
]);

/** Minimal path: groups + R32 + R16 + QF + SF for Mexico and Czechia. */
function lateRoundMatches() {
  return [
    ...groupAMatchesComplete(),
    ...groupBMatchesComplete(),
    {
      round: "Round of 32",
      num: 73,
      date: "2026-06-29",
      team1: "Mexico",
      team2: "Qatar",
      score: { ft: [2, 0] as [number, number] },
    },
    {
      round: "Round of 32",
      num: 74,
      date: "2026-06-30",
      team1: "Czechia",
      team2: "Bosnia and Herzegovina",
      score: { ft: [1, 0] as [number, number] },
    },
    {
      round: "Round of 16",
      num: 89,
      date: "2026-07-04",
      team1: "Mexico",
      team2: "Switzerland",
      score: { ft: [3, 1] as [number, number] },
    },
    {
      round: "Round of 16",
      num: 90,
      date: "2026-07-05",
      team1: "Czechia",
      team2: "Canada",
      score: { ft: [2, 2] as [number, number], p: [4, 3] as [number, number] },
    },
    {
      round: "Quarter-final",
      num: 97,
      date: "2026-07-10",
      team1: "Mexico",
      team2: "Netherlands",
      score: { ft: [1, 0] as [number, number] },
    },
    {
      round: "Quarter-final",
      num: 98,
      date: "2026-07-11",
      team1: "Czechia",
      team2: "Morocco",
      score: { ft: [0, 0] as [number, number], et: [1, 0] as [number, number] },
    },
    {
      round: "Semi-final",
      num: 101,
      date: "2026-07-14",
      team1: "Mexico",
      team2: "Czechia",
      score: { ft: [2, 1] as [number, number] },
    },
  ];
}

describe("buildLateKnockoutMatchSpotlights", () => {
  it("returns null when there are 4 or more ties", () => {
    const ctx = createTestContext([
      ...groupAMatchesComplete(),
      ...groupBMatchesComplete(),
      {
        round: "Round of 32",
        num: 73,
        date: "2026-06-29",
        team1: "Mexico",
        team2: "Qatar",
        score: { ft: [1, 0] as [number, number] },
      },
      {
        round: "Round of 32",
        num: 74,
        date: "2026-06-30",
        team1: "Czechia",
        team2: "South Africa",
        score: { ft: [1, 0] as [number, number] },
      },
      {
        round: "Round of 32",
        num: 75,
        date: "2026-06-30",
        team1: "Canada",
        team2: "Korea Republic",
        score: { ft: [1, 0] as [number, number] },
      },
      {
        round: "Round of 32",
        num: 76,
        date: "2026-07-01",
        team1: "Switzerland",
        team2: "Bosnia and Herzegovina",
        score: { ft: [1, 0] as [number, number] },
      },
    ]);

    const analysis = buildKnockoutStageAnalysis(ctx, "Round of 32", BASE_RANKINGS);
    assert.ok(analysis);
    assert.equal(analysis.matchCount, 4);
    assert.equal(analysis.lateMatchSpotlights, null);
    assert.equal(
      buildLateKnockoutMatchSpotlights(
        ctx,
        "Round of 32",
        analysis.fixtures,
        BASE_RANKINGS,
      ),
      null,
    );
  });

  it("builds a semi-final spotlight with path averages excluding the SF itself", () => {
    const ctx = createTestContext(lateRoundMatches());
    const analysis = buildKnockoutStageAnalysis(ctx, "Semi-final", BASE_RANKINGS);

    assert.ok(analysis);
    assert.equal(analysis.matchCount, 1);
    assert.ok(analysis.lateMatchSpotlights);
    assert.equal(analysis.lateMatchSpotlights.length, 1);

    const spotlight = analysis.lateMatchSpotlights[0]!;
    assert.equal(spotlight.fixture.team1.id, "MEX");
    assert.equal(spotlight.fixture.team2.id, "CZE");
    assert.equal(spotlight.fixture.gapPoints, 80);
    assert.equal(spotlight.fixture.winnerTeamId, "MEX");

    // Mexico group: 2+1+3=6 GF, 0+0+1=1 GA; R32 2-0; R16 3-1; QF 1-0 → GF 12, GA 2
    assert.equal(spotlight.team1Path.goalsFor, 12);
    assert.equal(spotlight.team1Path.goalsAgainst, 2);
    assert.equal(spotlight.team1Path.goalDiff, 10);

    // Czechia group: 1+3+1=5 GF, 1+0+3=4 GA; R32 1-0; R16 FT 2-2 (pens ignored); QF ET 1-0 → GF 9, GA 6
    assert.equal(spotlight.team2Path.goalsFor, 9);
    assert.equal(spotlight.team2Path.goalsAgainst, 6);
    assert.equal(spotlight.team2Path.goalDiff, 3);

    // Road stops before the SF: 3 group + R32 + R16 + QF
    assert.equal(spotlight.team1Path.opponents.length, 6);
    assert.equal(spotlight.team2Path.opponents.length, 6);

    // Mexico road rivals: RSA 1400, KOR 1580, CZE 1590, QAT 1450, SUI 1630, NED 1756
    const mexAvg = (1400 + 1580 + 1590 + 1450 + 1630 + 1756) / 6;
    assert.ok(spotlight.team1Path.avgOpponentPoints !== null);
    assert.ok(
      Math.abs(spotlight.team1Path.avgOpponentPoints! - mexAvg) < 0.01,
    );
  });

  it("counts ET goals and ignores penalty shoot-out tallies", () => {
    const ctx = createTestContext(lateRoundMatches());
    const analysis = buildKnockoutStageAnalysis(ctx, "Semi-final", BASE_RANKINGS);
    assert.ok(analysis?.lateMatchSpotlights?.[0]);

    const cze = analysis.lateMatchSpotlights[0]!.team2Path;
    // QF used ET 1-0 (not FT 0-0); R16 used FT 2-2 (pens not added)
    assert.equal(cze.goalsFor, 9);
    assert.equal(cze.goalsAgainst, 6);
  });
});
