import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildKnockoutStageAnalysis } from "@/lib/domain/knockout-stage-analysis";
import { buildKnockoutOpponentDifficultyStrip } from "@/lib/domain/knockout-opponent-difficulty";
import {
  createTestContext,
  groupAMatchesComplete,
  groupBMatchesComplete,
  rankingEntry,
} from "@/lib/domain/test-fixtures";

describe("buildKnockoutOpponentDifficultyStrip", () => {
  it("builds one entry per team from played Round of 32 fixtures", () => {
    const ctx = createTestContext([
        ...groupAMatchesComplete(),
        ...groupBMatchesComplete(),
        {
          round: "Round of 32",
          num: 73,
          date: "2026-06-29",
          team1: "Netherlands",
          team2: "Morocco",
          score: { ft: [2, 0] },
        },
      ]);

    const rankings = new Map([
      ["NED", rankingEntry("NED", 7, 1756)],
      ["MAR", rankingEntry("MAR", 11, 1713)],
    ]);

    const analysis = buildKnockoutStageAnalysis(ctx, "Round of 32", rankings);
    assert.ok(analysis?.opponentDifficulty);

    const strip = analysis.opponentDifficulty;
    assert.equal(strip.entries.length, 2);

    const ned = strip.entries.find((entry) => entry.team.id === "NED");
    const mar = strip.entries.find((entry) => entry.team.id === "MAR");
    assert.ok(ned);
    assert.ok(mar);
    assert.equal(ned.qualified, true);
    assert.equal(ned.opponentFifaPoints, 1713);
    assert.equal(mar.qualified, false);
    assert.equal(mar.opponentFifaPoints, 1756);
  });

  it("sorts entries by opponent FIFA points descending", () => {
    const strip = buildKnockoutOpponentDifficultyStrip([
      {
        matchNum: 1,
        date: "2026-06-29",
        team1: { id: "A", displayName: "A", aliases: [], group: "A", flagUrl: "", confederation: "UEFA" },
        team2: { id: "B", displayName: "B", aliases: [], group: "B", flagUrl: "", confederation: "UEFA" },
        team1FifaPoints: 1800,
        team2FifaPoints: 1500,
        gapPoints: 300,
        scoreFt: "1-0",
        scoreEt: null,
        scorePens: null,
        winnerTeamId: "A",
        upsetWin: false,
        isGapOutlier: false,
      },
    ]);

    assert.ok(strip);
    assert.equal(strip.entries[0]?.team.id, "B");
    assert.equal(strip.entries[0]?.opponentFifaPoints, 1800);
    assert.equal(strip.entries[1]?.team.id, "A");
    assert.equal(strip.entries[1]?.opponentFifaPoints, 1500);
  });
});
