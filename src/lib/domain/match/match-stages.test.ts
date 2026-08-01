import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clampPathStages,
  parsePathStages,
  previousPathStage,
  serializePathStages,
  stagesAlignedToTeamRound,
  stagesBefore,
  stagesForTeamRoundChange,
  stagesThrough,
  syncTeamRoundToStages,
  visibleCountStages,
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

  it("builds stages strictly before a round", () => {
    assert.deepEqual([...stagesBefore("sf")], ["group", "r32", "r16", "qf"]);
    assert.deepEqual([...stagesBefore("final")], [
      "group",
      "r32",
      "r16",
      "qf",
      "sf",
    ]);
    assert.deepEqual([...stagesBefore("group")], []);
    assert.equal(previousPathStage("sf"), "qf");
    assert.equal(previousPathStage("group"), null);
  });

  it("keeps the selected team round at or beyond the furthest average stage", () => {
    assert.equal(syncTeamRoundToStages("final", new Set(["group", "r16"])), "final");
    assert.equal(syncTeamRoundToStages("group", new Set(["group", "qf"])), "qf");
    assert.equal(syncTeamRoundToStages("sf", new Set(["group", "qf"])), "sf");
    assert.equal(syncTeamRoundToStages("qf", new Set(["group", "qf"])), "qf");
  });

  it("hides count-match switches when Show teams is All", () => {
    assert.deepEqual(visibleCountStages("group"), []);
    assert.deepEqual(visibleCountStages("r32"), ["group", "r32"]);
    assert.deepEqual(visibleCountStages("sf"), [
      "group",
      "r32",
      "r16",
      "qf",
      "sf",
    ]);
  });

  it("defaults count stages when Show teams changes", () => {
    assert.deepEqual(
      [...stagesForTeamRoundChange("group", "group", new Set(["group"]))],
      ["group", "r32", "r16", "qf", "sf", "final"],
    );
    assert.deepEqual(
      [...stagesForTeamRoundChange("group", "r32", new Set(["group", "r32", "r16"]))],
      ["group", "r32"],
    );
    assert.deepEqual(
      [
        ...stagesForTeamRoundChange(
          "r16",
          "sf",
          new Set(["group", "r32"]),
        ),
      ],
      ["group", "r32", "qf", "sf"],
    );
    assert.deepEqual(
      [
        ...stagesForTeamRoundChange(
          "sf",
          "r16",
          new Set(["group", "r32", "r16", "qf"]),
        ),
      ],
      ["group", "r32", "r16"],
    );
  });

  it("aligns persisted stages to a hydrated Show teams selection", () => {
    assert.deepEqual(
      [...stagesAlignedToTeamRound("group", new Set(["group"]))],
      ["group", "r32", "r16", "qf", "sf", "final"],
    );
    assert.deepEqual(
      [...stagesAlignedToTeamRound("sf", new Set(["group", "r32", "final"]))],
      ["group", "r32"],
    );
    assert.deepEqual(
      [...stagesAlignedToTeamRound("r16", new Set(["final"]))],
      ["group", "r32", "r16"],
    );
  });
});
