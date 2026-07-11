import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeGroupStandings,
  getAdvancingTeamIds,
  isTeamEliminatedFromGroup,
} from "@/lib/domain/group-standings";
import {
  groupAMatchesComplete,
  groupBMatchesComplete,
  playedGroupMatch,
} from "@/lib/domain/test-fixtures";

describe("computeGroupStandings", () => {
  it("orders by points, then goal difference, then goals scored", () => {
    const standings = computeGroupStandings(groupAMatchesComplete());
    assert.equal(standings[0].teamId, "MEX");
    assert.equal(standings[1].teamId, "CZE");
    assert.equal(standings[2].teamId, "RSA");
    assert.equal(standings[3].teamId, "KOR");
    assert.equal(standings[0].points, 9);
  });

  it("breaks ties on goal difference", () => {
    const matches = [
      playedGroupMatch("Mexico", "South Africa", 1, 0),
      playedGroupMatch("Korea Republic", "Czechia", 2, 0),
      playedGroupMatch("Mexico", "Korea Republic", 0, 0),
      playedGroupMatch("South Africa", "Czechia", 0, 0),
      playedGroupMatch("Mexico", "Czechia", 0, 0),
      playedGroupMatch("South Africa", "Korea Republic", 0, 0),
    ];
    const standings = computeGroupStandings(matches);
    const tied = standings.filter((row) => row.points === 5);
    assert.equal(tied.length, 2);
    assert.ok(tied[0].gd >= tied[1].gd);
  });
});

describe("getAdvancingTeamIds", () => {
  it("adds provisional top two from incomplete groups", () => {
    const incomplete = groupAMatchesComplete().slice(0, 2);
    const advancing = getAdvancingTeamIds(incomplete, ["Group A"]);
    assert.ok(advancing.has("MEX"));
    assert.ok(advancing.has("CZE"));
    assert.equal(advancing.size, 2);
  });

  it("adds best third-place teams when all groups are complete", () => {
    const matches = [...groupAMatchesComplete(), ...groupBMatchesComplete()];
    const advancing = getAdvancingTeamIds(matches, ["Group A", "Group B"]);
    assert.ok(advancing.has("MEX"));
    assert.ok(advancing.has("CZE"));
    assert.ok(advancing.has("CAN"));
    assert.ok(advancing.has("SUI"));
    assert.ok(advancing.has("RSA"));
    assert.ok(advancing.has("BIH"));
    assert.equal(advancing.size, 6);
  });
});

describe("isTeamEliminatedFromGroup", () => {
  it("returns false before the group stage finishes", () => {
    const incomplete = groupAMatchesComplete().slice(0, 2);
    assert.equal(isTeamEliminatedFromGroup("RSA", incomplete, ["Group A"]), false);
  });

  it("returns true for fourth place after the group completes", () => {
    const matches = groupAMatchesComplete();
    assert.equal(isTeamEliminatedFromGroup("KOR", matches, ["Group A"]), true);
    assert.equal(isTeamEliminatedFromGroup("MEX", matches, ["Group A"]), false);
  });
});
