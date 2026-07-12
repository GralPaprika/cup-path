import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildMatchScoreBreakdown } from "@/lib/domain/match-score";

describe("buildMatchScoreBreakdown", () => {
  it("returns full-time only for regulation wins", () => {
    assert.deepEqual(buildMatchScoreBreakdown({ ft: [2, 1] }), {
      ft: "2-1",
      et: null,
      pens: null,
    });
  });

  it("includes extra time and penalties when present", () => {
    assert.deepEqual(
      buildMatchScoreBreakdown({
        ft: [1, 1],
        et: [1, 1],
        p: [4, 3],
      }),
      {
        ft: "1-1",
        et: "1-1",
        pens: "4-3",
      },
    );
  });

  it("includes extra time without penalties", () => {
    assert.deepEqual(
      buildMatchScoreBreakdown({
        ft: [2, 2],
        et: [3, 2],
      }),
      {
        ft: "2-2",
        et: "3-2",
        pens: null,
      },
    );
  });
});
