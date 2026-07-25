import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseSelectedGroupLetter } from "@/lib/client/group-selection";
import type { GroupComparisonCard } from "@/lib/types";

function card(letter: string, teamIds: string[]): GroupComparisonCard {
  return {
    groupLetter: letter,
    teams: teamIds.map((id) => ({
      team: { id },
    })),
  } as unknown as GroupComparisonCard;
}

describe("parseSelectedGroupLetter", () => {
  const groups = [card("A", ["ARG"]), card("C", ["BRA"]), card("D", ["ESP"])];

  it("prefers the deep-linked group when present in loaded data", () => {
    assert.equal(parseSelectedGroupLetter("C", groups), "C");
  });

  it("prefers the selected team's group over the URL group", () => {
    assert.equal(parseSelectedGroupLetter("C", groups, "ESP"), "D");
  });

  it("falls back to A when the URL group is unknown", () => {
    assert.equal(parseSelectedGroupLetter("Z", groups), "A");
  });
});
