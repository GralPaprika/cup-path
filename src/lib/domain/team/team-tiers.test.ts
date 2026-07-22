import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classifyTeamTier,
  TEAM_TIER_IDS,
} from "@/lib/domain/team/team-tiers";

describe("classifyTeamTier", () => {
  it("buckets FIFA points by the documented cuts", () => {
    assert.equal(classifyTeamTier(1800), "titleFavorites");
    assert.equal(classifyTeamTier(1799.99), "contenders");
    assert.equal(classifyTeamTier(1700), "contenders");
    assert.equal(classifyTeamTier(1699.99), "darkHorses");
    assert.equal(classifyTeamTier(1580), "darkHorses");
    assert.equal(classifyTeamTier(1579.99), "outsiders");
    assert.equal(classifyTeamTier(1450), "outsiders");
    assert.equal(classifyTeamTier(1449.99), "makeweights");
  });

  it("exposes tiers in display order", () => {
    assert.deepEqual([...TEAM_TIER_IDS], [
      "titleFavorites",
      "contenders",
      "darkHorses",
      "outsiders",
      "makeweights",
    ]);
  });
});
