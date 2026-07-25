import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clampPathStages,
  parsePathStages,
  serializePathStages,
  stagesThrough,
  syncTeamRoundToStages,
} from "@/lib/domain/match/match-stages";

describe("match stages", () => {
  it("parses valid stages and falls back to group", () => {
    assert.deepEqual([...parsePathStages("group,r16,invalid")], ["group", "r16"]);
    assert.deepEqual([...parsePathStages(null)], ["group"]);
    assert.deepEqual([...parsePathStages("invalid")], ["group"]);
  });

  it("serializes stages in tournament order", () => {
    assert.equal(serializePathStages(new Set(["final", "group", "qf"])), "group,qf,final");
  });

  it("clamps stages to the furthest reachable round", () => {
    assert.deepEqual(
      [...clampPathStages(new Set(["group", "r16", "final"]), "r16")],
      ["group", "r16"],
    );
    assert.deepEqual([...clampPathStages(new Set(["final"]), "r16")], ["group"]);
  });

  it("builds all stages through a round", () => {
    assert.deepEqual([...stagesThrough("qf")], ["group", "r32", "r16", "qf"]);
  });

  it("keeps the selected team round aligned to selected stages", () => {
    assert.equal(syncTeamRoundToStages("final", new Set(["group", "r16"])), "r16");
    assert.equal(syncTeamRoundToStages("group", new Set(["group", "qf"])), "qf");
  });
});
