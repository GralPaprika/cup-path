import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ResolvedBracketMatch } from "@/lib/types";
import {
  computePendingWinnerMatchNums,
  filterPendingToCuratedMatches,
  findChangedMatchNums,
  formatSlotLabel,
  getCuratedBracketMatchNums,
  getDownstreamMatchNums,
  getFocusPathFeederMatchNums,
  getFocusTeamMatchNums,
  isKnockoutWinnerOverride,
  resolveBracket,
  sanitizeKnockoutWinners,
} from "@/lib/domain/bracket/bracket-resolver";
import { bundledTestContext } from "@/lib/domain/core/test-fixtures";

describe("getFocusTeamMatchNums", () => {
  it("extends a SF winner into the Final, not third place", () => {
    const bracket = [
      {
        num: 101,
        round: "Semi-final",
        home: { teamId: "ESP", sourceMatchNum: 97, slotKind: "winner" },
        away: { teamId: "FRA", sourceMatchNum: 98, slotKind: "winner" },
        winnerTeamId: "ESP",
      },
      {
        num: 102,
        round: "Semi-final",
        home: { teamId: "ARG", sourceMatchNum: 99, slotKind: "winner" },
        away: { teamId: "ENG", sourceMatchNum: 100, slotKind: "winner" },
        winnerTeamId: "ARG",
      },
      {
        num: 103,
        round: "Match for third place",
        home: { teamId: null, sourceMatchNum: 101, slotKind: "loser" },
        away: { teamId: null, sourceMatchNum: 102, slotKind: "loser" },
        winnerTeamId: null,
      },
      {
        num: 104,
        round: "Final",
        home: { teamId: null, sourceMatchNum: 101, slotKind: "winner" },
        away: { teamId: null, sourceMatchNum: 102, slotKind: "winner" },
        winnerTeamId: null,
      },
    ] as ResolvedBracketMatch[];

    assert.deepEqual(getFocusTeamMatchNums(bracket, "ESP"), [101, 104]);
  });

  it("extends a SF loser into third place, not the Final", () => {
    const bracket = [
      {
        num: 101,
        round: "Semi-final",
        home: { teamId: "ESP", sourceMatchNum: 97, slotKind: "winner" },
        away: { teamId: "FRA", sourceMatchNum: 98, slotKind: "winner" },
        winnerTeamId: "ESP",
      },
      {
        num: 102,
        round: "Semi-final",
        home: { teamId: "ARG", sourceMatchNum: 99, slotKind: "winner" },
        away: { teamId: "ENG", sourceMatchNum: 100, slotKind: "winner" },
        winnerTeamId: "ARG",
      },
      {
        num: 103,
        round: "Match for third place",
        home: { teamId: null, sourceMatchNum: 101, slotKind: "loser" },
        away: { teamId: null, sourceMatchNum: 102, slotKind: "loser" },
        winnerTeamId: null,
      },
      {
        num: 104,
        round: "Final",
        home: { teamId: null, sourceMatchNum: 101, slotKind: "winner" },
        away: { teamId: null, sourceMatchNum: 102, slotKind: "winner" },
        winnerTeamId: null,
      },
    ] as ResolvedBracketMatch[];

    assert.deepEqual(getFocusTeamMatchNums(bracket, "FRA"), [101, 103]);
  });
});

describe("isKnockoutWinnerOverride", () => {
  it("is false when there is no selected winner", () => {
    assert.equal(isKnockoutWinnerOverride("SUI", null), false);
    assert.equal(isKnockoutWinnerOverride("SUI", undefined), false);
  });

  it("is false when the selected winner matches the actual winner", () => {
    assert.equal(isKnockoutWinnerOverride("SUI", "SUI"), false);
    assert.equal(isKnockoutWinnerOverride("sui", "SUI"), false);
  });

  it("is true when the selected winner differs from the actual winner", () => {
    assert.equal(isKnockoutWinnerOverride("SUI", "ALG"), true);
  });

  it("is true when a winner is selected but there is no actual result yet", () => {
    assert.equal(isKnockoutWinnerOverride(null, "ALG"), true);
    assert.equal(isKnockoutWinnerOverride(undefined, "ALG"), true);
  });

  it("is true for suppressed matches even when the pick matches the actual winner", () => {
    assert.equal(
      isKnockoutWinnerOverride("ARG", "ARG", {
        playedResultSuppressed: true,
      }),
      true,
    );
  });

  it("stays false for a real-result pick when the match is not suppressed", () => {
    assert.equal(
      isKnockoutWinnerOverride("ARG", "ARG", {
        playedResultSuppressed: false,
      }),
      false,
    );
  });
});

describe("formatSlotLabel", () => {
  it("formats group and winner slots", () => {
    assert.equal(
      formatSlotLabel({ kind: "groupPosition", group: "A", position: 1 }),
      "1A",
    );
    assert.equal(
      formatSlotLabel({ kind: "thirdAssigned", group: "D" }),
      "3D",
    );
    assert.equal(
      formatSlotLabel({ kind: "winner", matchNum: 73 }),
      "W73",
    );
  });
});

describe("getDownstreamMatchNums", () => {
  it("includes later rounds that depend on seed matches", () => {
    const downstream = getDownstreamMatchNums([73]);
    assert.ok(downstream.has(73));
    assert.ok(downstream.has(90));
  });
});

describe("findChangedMatchNums", () => {
  it("detects home or away changes", () => {
    const base = {
      num: 73,
      home: { teamId: "MEX" },
      away: { teamId: "CAN" },
    } as ResolvedBracketMatch;
    const changed = {
      ...base,
      away: { teamId: "SUI" },
    } as ResolvedBracketMatch;
    assert.deepEqual(findChangedMatchNums([base], [changed]), [73]);
  });
});

describe("sanitizeKnockoutWinners", () => {
  it("drops winners tied to stale matches", () => {
    const sanitized = sanitizeKnockoutWinners(
      { 73: "MEX", 90: "ARG" },
      new Set([73]),
    );
    assert.deepEqual(sanitized, { 90: "ARG" });
  });
});

describe("computePendingWinnerMatchNums", () => {
  it("lists played matches needing a winner after upstream changes", () => {
    const bracket = [
      {
        num: 73,
        round: "Round of 32",
        isPlayed: true,
        home: { teamId: "MEX" },
        away: { teamId: "CAN" },
      },
    ] as ResolvedBracketMatch[];
    const pending = computePendingWinnerMatchNums(
      bracket,
      new Set([73]),
      {},
    );
    assert.deepEqual(pending, [73]);
  });

  it("skips the third-place consolation match", () => {
    const bracket = [
      {
        num: 103,
        round: "Match for third place",
        isPlayed: true,
        home: { teamId: "FRA" },
        away: { teamId: "ENG" },
      },
      {
        num: 104,
        round: "Final",
        isPlayed: true,
        home: { teamId: "ESP" },
        away: { teamId: "ARG" },
      },
    ] as ResolvedBracketMatch[];
    const pending = computePendingWinnerMatchNums(
      bracket,
      new Set([103, 104]),
      {},
    );
    assert.deepEqual(pending, [104]);
  });
});

describe("filterPendingToCuratedMatches", () => {
  it("keeps only pending matches on the curated path", () => {
    assert.deepEqual(
      filterPendingToCuratedMatches([73, 100, 102], [85, 96, 100]),
      [100],
    );
  });

  it("returns empty when nothing overlaps", () => {
    assert.deepEqual(
      filterPendingToCuratedMatches([73, 102], [85, 96, 100]),
      [],
    );
  });
});

describe("getFocusPathFeederMatchNums", () => {
  it("collects opponent upstream matches for a focus path", () => {
    const bracket = [
      {
        num: 73,
        home: { teamId: "MEX", sourceMatchNum: undefined },
        away: { teamId: "CAN", sourceMatchNum: undefined },
        winnerTeamId: "MEX",
      },
      {
        num: 74,
        home: { teamId: "BRA", sourceMatchNum: undefined },
        away: { teamId: "USA", sourceMatchNum: undefined },
        winnerTeamId: "BRA",
      },
      {
        num: 90,
        home: { teamId: "MEX", sourceMatchNum: 73 },
        away: { teamId: "BRA", sourceMatchNum: 74 },
        winnerTeamId: null,
      },
    ] as ResolvedBracketMatch[];

    assert.deepEqual(getFocusPathFeederMatchNums(bracket, "MEX"), [74]);
    assert.deepEqual(getCuratedBracketMatchNums(bracket, "MEX").path, [73, 90]);
    assert.deepEqual(getCuratedBracketMatchNums(bracket, "MEX").feeders, [74]);
  });

  it("extends path from scenario winners before the next slot is occupied", () => {
    // Algeria is still only on #85 in a stale snapshot; scenario says they won.
    const bracket = [
      {
        num: 85,
        home: { teamId: "SUI", sourceMatchNum: undefined },
        away: { teamId: "ALG", sourceMatchNum: undefined },
        winnerTeamId: "SUI",
      },
      {
        num: 87,
        home: { teamId: "COL", sourceMatchNum: undefined },
        away: { teamId: "GHA", sourceMatchNum: undefined },
        winnerTeamId: "COL",
      },
      {
        num: 96,
        home: { teamId: "SUI", sourceMatchNum: 85 },
        away: { teamId: "COL", sourceMatchNum: 87 },
        winnerTeamId: null,
      },
    ] as ResolvedBracketMatch[];

    const curated = getCuratedBracketMatchNums(bracket, "ALG", {
      85: "ALG",
    });
    assert.deepEqual(curated.path, [85, 96]);
    assert.deepEqual(curated.feeders, [87]);
  });

  it("walks nested feeders when the opponent side is unresolved", () => {
    const bracket = [
      {
        num: 73,
        home: { teamId: "A", sourceMatchNum: undefined },
        away: { teamId: "B", sourceMatchNum: undefined },
      },
      {
        num: 74,
        home: { teamId: "C", sourceMatchNum: undefined },
        away: { teamId: "D", sourceMatchNum: undefined },
      },
      {
        num: 90,
        home: { teamId: null, sourceMatchNum: 73 },
        away: { teamId: null, sourceMatchNum: 74 },
      },
      {
        num: 98,
        home: { teamId: "FOCUS", sourceMatchNum: undefined },
        away: { teamId: null, sourceMatchNum: 90 },
      },
    ] as ResolvedBracketMatch[];

    const feeders = getFocusPathFeederMatchNums(bracket, "FOCUS");
    assert.deepEqual(feeders, [73, 74, 90]);
  });
});

describe("resolveBracket", () => {
  it("fills round-of-32 slots from group finishes", () => {
    const ctx = bundledTestContext();
    const bracket = resolveBracket(ctx, {
      groupFinishes: {
        A: ["MEX", "RSA", "KOR", "CZE"],
        B: ["CAN", "SUI", "BIH", "QAT"],
      },
    });

    const match73 = bracket.find((match) => match.num === 73);
    assert.ok(match73);
    assert.equal(match73.home.teamId, "RSA");
    assert.equal(match73.away.teamId, "SUI");
  });

  it("uses scenario knockout winners over recorded results", () => {
    const ctx = bundledTestContext();
    const bracket = resolveBracket(ctx, {
      groupFinishes: {
        A: ["MEX", "RSA", "KOR", "CZE"],
        B: ["CAN", "SUI", "BIH", "QAT"],
      },
      knockoutWinners: { 73: "RSA" },
    });

    const match90 = bracket.find((match) => match.num === 90);
    assert.ok(match90);
    assert.ok(
      match90.home.teamId === "RSA" || match90.away.teamId === "RSA",
    );
  });
});
