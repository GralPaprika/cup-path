import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAllTeamSummaries,
  buildComparison,
} from "@/lib/domain/difficulty";
import { buildGroupStageDifficultyStrip } from "@/lib/domain/group-stage-difficulty";
import { DEFAULT_PATH_STAGES } from "@/lib/domain/match-stages";
import { bundledTestContext, rankingEntry } from "@/lib/domain/test-fixtures";

describe("buildGroupStageDifficultyStrip", () => {
  const ctx = bundledTestContext();

  it("sorts teams by avg group opponent points descending", () => {
    const rankings = new Map([
      ["MEX", rankingEntry("MEX", 14, 1700)],
      ["CZE", rankingEntry("CZE", 22, 1600)],
      ["KOR", rankingEntry("KOR", 23, 1500)],
      ["RSA", rankingEntry("RSA", 55, 1400)],
    ]);
    const summaries = buildAllTeamSummaries(ctx, rankings);
    const comparison = buildComparison(
      ctx,
      summaries,
      undefined,
      new Set(DEFAULT_PATH_STAGES),
      new Set(summaries.map((entry) => entry.team.id)),
      rankings,
    );

    const strip = buildGroupStageDifficultyStrip(ctx, comparison);

    assert.ok(strip);
    assert.ok(strip.entries.length >= 4);
    assert.equal(
      strip.entries.every(
        (entry, index, list) =>
          index === 0 ||
          entry.avgOpponentPoints <= list[index - 1]!.avgOpponentPoints,
      ),
      true,
    );
    assert.ok(strip.meanAvgOpponentPoints !== null);
    assert.ok(strip.stdDevAvgOpponentPoints !== null);
    assert.ok(strip.minAvgOpponentPoints !== null);
    assert.ok(strip.maxAvgOpponentPoints !== null);
  });

  it("builds qualification cohorts and spotlights from the strip", () => {
    const rankings = new Map([
      ["MEX", rankingEntry("MEX", 14, 1700)],
      ["CZE", rankingEntry("CZE", 22, 1600)],
      ["KOR", rankingEntry("KOR", 23, 1500)],
      ["RSA", rankingEntry("RSA", 55, 1400)],
    ]);
    const summaries = buildAllTeamSummaries(ctx, rankings);
    const comparison = buildComparison(
      ctx,
      summaries,
      undefined,
      new Set(DEFAULT_PATH_STAGES),
      new Set(summaries.map((entry) => entry.team.id)),
      rankings,
    );

    const strip = buildGroupStageDifficultyStrip(ctx, comparison);
    assert.ok(strip);

    const { insights } = strip;
    assert.equal(
      insights.aboveMean.total + insights.belowMean.total + insights.atMean.total,
      strip.entries.length,
    );
    assert.equal(
      insights.aboveMean.qualified + insights.aboveMean.eliminated,
      insights.aboveMean.total,
    );

    if (insights.hardestDrawSurvivor) {
      assert.equal(insights.hardestDrawSurvivor.team.id.length > 0, true);
      assert.ok(Number.isFinite(insights.hardestDrawSurvivor.deltaFromMean));
    }
  });
});
