import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ResolvedBracketMatch } from "@/lib/types";
import {
  computePendingWinnerMatchNums,
  findChangedMatchNums,
  formatSlotLabel,
  getDownstreamMatchNums,
  resolveBracket,
  sanitizeKnockoutWinners,
} from "@/lib/domain/bracket-resolver";
import { bundledTestContext } from "@/lib/domain/test-fixtures";

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
