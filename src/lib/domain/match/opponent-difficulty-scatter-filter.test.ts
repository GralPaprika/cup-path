import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filterOpponentDifficultyScatterPoints,
  type ScatterFilterablePoint,
} from "@/lib/domain/match/opponent-difficulty-scatter-filter";

function point(
  overrides: Partial<ScatterFilterablePoint> & Pick<ScatterFilterablePoint, "teamId">,
): ScatterFilterablePoint {
  return {
    won: true,
    displayName: overrides.teamId,
    ...overrides,
  };
}

describe("filterOpponentDifficultyScatterPoints", () => {
  const points = [
    point({ teamId: "MEX", displayName: "Mexico", won: true }),
    point({ teamId: "NED", displayName: "Netherlands", won: false }),
    point({ teamId: "ARG", displayName: "Argentina", won: true }),
    point({ teamId: "USA", displayName: "United States", won: false }),
  ];

  it("returns every point when both series are shown and query is empty", () => {
    assert.equal(
      filterOpponentDifficultyScatterPoints(points, {
        showWon: true,
        showLost: true,
        query: "",
      }).length,
      4,
    );
  });

  it("keeps only winners when showLost is false", () => {
    const filtered = filterOpponentDifficultyScatterPoints(points, {
      showWon: true,
      showLost: false,
      query: "",
    });
    assert.deepEqual(
      filtered.map((entry) => entry.teamId),
      ["MEX", "ARG"],
    );
  });

  it("keeps only losers when showWon is false", () => {
    const filtered = filterOpponentDifficultyScatterPoints(points, {
      showWon: false,
      showLost: true,
      query: "",
    });
    assert.deepEqual(
      filtered.map((entry) => entry.teamId),
      ["NED", "USA"],
    );
  });

  it("returns no points when both series are hidden", () => {
    assert.equal(
      filterOpponentDifficultyScatterPoints(points, {
        showWon: false,
        showLost: false,
        query: "",
      }).length,
      0,
    );
  });

  it("matches by FIFA code", () => {
    const filtered = filterOpponentDifficultyScatterPoints(points, {
      showWon: true,
      showLost: true,
      query: "mex",
    });
    assert.deepEqual(
      filtered.map((entry) => entry.teamId),
      ["MEX"],
    );
  });

  it("matches by display name", () => {
    const filtered = filterOpponentDifficultyScatterPoints(points, {
      showWon: true,
      showLost: true,
      query: "nether",
    });
    assert.deepEqual(
      filtered.map((entry) => entry.teamId),
      ["NED"],
    );
  });

  it("combines series and search filters", () => {
    const filtered = filterOpponentDifficultyScatterPoints(points, {
      showWon: true,
      showLost: false,
      query: "a",
    });
    assert.deepEqual(
      filtered.map((entry) => entry.teamId),
      ["ARG"],
    );
  });

  it("matches accent-insensitive display names", () => {
    const withAccent = [
      point({ teamId: "CIV", displayName: "Côte d'Ivoire", won: true }),
    ];
    const filtered = filterOpponentDifficultyScatterPoints(withAccent, {
      showWon: true,
      showLost: true,
      query: "cote",
    });
    assert.equal(filtered.length, 1);
  });
});
