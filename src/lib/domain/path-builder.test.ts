import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { applyWorldCupBundle } from "@/lib/data/worldcup-loader";
import { buildTeamPath, isTeamEliminated } from "@/lib/domain/path-builder";
import {
  groupAMatchesComplete,
  restoreBundledWorldCup,
  scheduledMatch,
} from "@/lib/domain/test-fixtures";

afterEach(() => {
  restoreBundledWorldCup();
});

describe("buildTeamPath", () => {
  it("truncates after a knockout loss", () => {
    applyWorldCupBundle({
      name: "test",
      matches: [
        ...groupAMatchesComplete(),
        {
          team1: "Mexico",
          team2: "Brazil",
          round: "Round of 32",
          date: "2026-07-02",
          num: 79,
          score: { ft: [0, 2] },
        },
      ],
    });

    const path = buildTeamPath("MEX");
    const rounds = path.map((entry) => entry.match.round);
    assert.ok(rounds.every((round) => round.startsWith("Matchday") || round === "Round of 32"));
    assert.equal(path.at(-1)?.result, "L");
  });

  it("includes scheduled knockout matches for active teams", () => {
    applyWorldCupBundle({
      name: "test",
      matches: [
        ...groupAMatchesComplete(),
        scheduledMatch("Mexico", "Brazil", "Round of 32", {
          num: 79,
          date: "2026-07-02",
        }),
      ],
    });

    const path = buildTeamPath("MEX");
    assert.equal(path.at(-1)?.match.round, "Round of 32");
    assert.equal(path.at(-1)?.isPlayed, false);
  });

  it("truncates at the last group match when a team does not advance", () => {
    applyWorldCupBundle({
      name: "test",
      matches: [
        ...groupAMatchesComplete(),
        scheduledMatch("South Korea", "Brazil", "Round of 32", {
          num: 73,
          date: "2026-07-01",
        }),
      ],
    });

    const path = buildTeamPath("KOR");
    assert.ok(path.every((entry) => entry.match.round.startsWith("Matchday")));
    assert.equal(isTeamEliminated("KOR"), true);
  });
});
