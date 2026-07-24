import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildTeamPath, isTeamEliminated } from "@/lib/domain/path/path-builder";
import {
  createTestContext,
  groupAMatchesComplete,
  scheduledMatch,
} from "@/lib/domain/core/test-fixtures";

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

  it("uses extra-time score from the selected team's perspective", () => {
    const ctx = createTestContext([
      {
        team1: "Spain",
        team2: "Argentina",
        round: "Final",
        date: "2026-07-19",
        num: 104,
        score: { ft: [0, 0], et: [1, 0] },
      },
    ]);

    const spainFinal = buildTeamPath(ctx, "ESP").at(-1);
    assert.equal(spainFinal?.scoreLabel, "1-0 (aet)");
    assert.equal(spainFinal?.scorePensLabel, null);

    const argentinaFinal = buildTeamPath(ctx, "ARG").at(-1);
    assert.equal(argentinaFinal?.scoreLabel, "0-1 (aet)");
    assert.equal(argentinaFinal?.scorePensLabel, null);
  });

  it("shows full-time score with home-away pens on a second label", () => {
    const ctx = createTestContext([
      {
        team1: "Netherlands",
        team2: "Morocco",
        round: "Round of 32",
        date: "2026-06-29",
        num: 75,
        score: { ft: [1, 1], et: [1, 1], p: [2, 3] },
      },
    ]);

    const morocco = buildTeamPath(ctx, "MAR").at(-1);
    assert.equal(morocco?.scoreLabel, "1-1");
    assert.equal(morocco?.scorePensLabel, "(2-3 pens)");
    assert.equal(morocco?.result, "W");
  });

  it("includes the third-place match after a semi-final loss", () => {
    const ctx = createTestContext([
      {
        team1: "England",
        team2: "Argentina",
        round: "Semi-final",
        date: "2026-07-15",
        num: 102,
        score: { ft: [1, 2] },
      },
      {
        team1: "France",
        team2: "England",
        round: "Match for third place",
        date: "2026-07-18",
        num: 103,
        score: { ft: [4, 6] },
      },
    ]);

    const path = buildTeamPath(ctx, "ENG");
    assert.equal(path.at(-1)?.match.round, "Match for third place");
    assert.equal(path.at(-1)?.result, "W");
  });
});
