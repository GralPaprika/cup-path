import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildTeamPath, isTeamEliminated } from "@/lib/domain/path-builder";
import {
  createTestContext,
  groupAMatchesComplete,
  scheduledMatch,
} from "@/lib/domain/test-fixtures";

describe("buildTeamPath", () => {
  it("truncates after a knockout loss", () => {
    const ctx = createTestContext([
      ...groupAMatchesComplete(),
      {
        team1: "Mexico",
        team2: "Brazil",
        round: "Round of 32",
        date: "2026-07-02",
        num: 79,
        score: { ft: [0, 2] },
      },
    ]);

    const path = buildTeamPath(ctx, "MEX");
    const rounds = path.map((entry) => entry.match.round);
    assert.ok(rounds.every((round) => round.startsWith("Matchday") || round === "Round of 32"));
    assert.equal(path.at(-1)?.result, "L");
  });

  it("includes scheduled knockout matches for active teams", () => {
    const ctx = createTestContext([
      ...groupAMatchesComplete(),
      scheduledMatch("Mexico", "Brazil", "Round of 32", {
        num: 79,
        date: "2026-07-02",
      }),
    ]);

    const path = buildTeamPath(ctx, "MEX");
    assert.equal(path.at(-1)?.match.round, "Round of 32");
    assert.equal(path.at(-1)?.isPlayed, false);
  });

  it("truncates at the last group match when a team does not advance", () => {
    const ctx = createTestContext([
      ...groupAMatchesComplete(),
      scheduledMatch("South Korea", "Brazil", "Round of 32", {
        num: 73,
        date: "2026-07-01",
      }),
    ]);

    const path = buildTeamPath(ctx, "KOR");
    assert.ok(path.every((entry) => entry.match.round.startsWith("Matchday")));
    assert.equal(isTeamEliminated(ctx, "KOR"), true);
  });
});
