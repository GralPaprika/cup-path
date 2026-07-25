import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveTeamAnalysisStageSync } from "@/lib/domain/team/team-analysis-stage-sync";

describe("resolveTeamAnalysisStageSync", () => {
  it("expands stages through the response reach after a team switch", () => {
    const result = resolveTeamAnalysisStageSync(
      new Set(["group", "r32", "r16", "qf", "sf", "final"]),
      undefined,
      "r16",
    );

    assert.equal(result.action, "expand");
    if (result.action === "expand") {
      assert.deepEqual([...result.stages], ["group", "r32", "r16"]);
    }
  });

  it("clamps stages that exceed the response reach", () => {
    const result = resolveTeamAnalysisStageSync(
      new Set(["group", "r32", "r16", "qf"]),
      "qf",
      "r16",
    );

    assert.equal(result.action, "clamp");
    if (result.action === "clamp") {
      assert.deepEqual([...result.stages], ["group", "r32", "r16"]);
    }
  });

  it("commits when stages are within reach", () => {
    const result = resolveTeamAnalysisStageSync(
      new Set(["group", "r32"]),
      "r16",
      "r16",
    );

    assert.equal(result.action, "commit");
  });
});
