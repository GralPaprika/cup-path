import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Team } from "@/lib/types";
import { enrichTeam } from "@/lib/domain/team/team-enrich";

function makeTeam(flagUrl = "original.svg"): Team {
  return {
    id: "AAA",
    displayName: "Team A",
    aliases: ["Team A"],
    group: "A",
    flagUrl,
    confederation: "UEFA",
  };
}

describe("enrichTeam", () => {
  it("returns the same reference when no flag override is given", () => {
    const team = makeTeam();
    assert.equal(enrichTeam(team), team);
    assert.equal(enrichTeam(team, undefined), team);
  });

  it("returns the same reference when the flag is unchanged", () => {
    const team = makeTeam("same.svg");
    assert.equal(enrichTeam(team, "same.svg"), team);
  });

  it("returns a new team with the overriding flag", () => {
    const team = makeTeam("old.svg");
    const enriched = enrichTeam(team, "new.svg");
    assert.notEqual(enriched, team);
    assert.equal(enriched.flagUrl, "new.svg");
    assert.equal(team.flagUrl, "old.svg");
    assert.equal(enriched.id, team.id);
  });
});
