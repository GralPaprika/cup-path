import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_RANKING_MODE,
  isSnapshotMode,
  parseRankingMode,
  RANKING_MODES,
  SNAPSHOT_DATES,
  SNAPSHOT_MODES,
} from "@/lib/data/ranking-modes";

describe("ranking modes", () => {
  it("defaults missing and unknown values to the July 20 snapshot", () => {
    assert.equal(DEFAULT_RANKING_MODE, "july20");
    assert.equal(parseRankingMode(null), "july20");
    assert.equal(parseRankingMode("unknown"), "july20");
  });

  it("accepts current modes and maps legacy aliases", () => {
    for (const mode of RANKING_MODES) assert.equal(parseRankingMode(mode), mode);
    assert.equal(parseRankingMode("live"), "july20");
    assert.equal(parseRankingMode("yearStart"), "january");
    assert.equal(parseRankingMode("tournamentStart"), "june11");
  });

  it("keeps the snapshot registry complete", () => {
    assert.deepEqual([...SNAPSHOT_MODES], RANKING_MODES);
    assert.deepEqual(
      Object.keys(SNAPSHOT_DATES).sort(),
      [...SNAPSHOT_MODES].sort(),
    );
    for (const mode of RANKING_MODES) assert.equal(isSnapshotMode(mode), true);
  });
});
