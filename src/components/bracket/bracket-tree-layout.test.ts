import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BRACKET_COLUMNS,
  getMatchLayout,
  visibleColumnsForCurated,
  visibleColumnsForPathSlice,
} from "@/components/bracket/bracket-tree-layout";

describe("visibleColumnsForCurated", () => {
  it("returns an empty list when there are no matches", () => {
    assert.deepEqual(visibleColumnsForCurated([]), []);
  });

  it("crops to a contiguous column range covering curated matches", () => {
    // Mexico-side path: R32 #79, feeder #80, R16 #92 are all on the right half.
    const columns = visibleColumnsForCurated([79, 80, 92]);
    assert.deepEqual(
      columns.map((column) => column.key),
      ["r16-right", "r32-right"],
    );
    assert.ok(columns.every((column) => BRACKET_COLUMNS.includes(column)));
  });

  it("includes intermediate empty columns between path rounds", () => {
    const columns = visibleColumnsForCurated([79, 92, 99]);
    assert.deepEqual(
      columns.map((column) => column.key),
      ["qf-right", "r16-right", "r32-right"],
    );
  });

  it("keeps relative column indices aligned with getMatchLayout", () => {
    const matchNums = [79, 92];
    const columns = visibleColumnsForCurated(matchNums);
    const minColumn = Math.min(
      ...matchNums.map((num) => getMatchLayout(num).column),
    );

    for (const matchNum of matchNums) {
      const layout = getMatchLayout(matchNum);
      assert.ok(
        columns[layout.column - minColumn]?.matchNums.includes(matchNum),
      );
    }
  });
});

describe("visibleColumnsForPathSlice", () => {
  it("returns an empty list when there are no matches", () => {
    assert.deepEqual(visibleColumnsForPathSlice([]), []);
  });

  it("orders right-half paths left-to-right (R32 → R16)", () => {
    const columns = visibleColumnsForPathSlice([79, 80, 92]);
    assert.deepEqual(
      columns.map((column) => column.key),
      ["r32-right", "r16-right"],
    );
  });

  it("orders right-half spans left-to-right through QF", () => {
    const columns = visibleColumnsForPathSlice([79, 92, 99]);
    assert.deepEqual(
      columns.map((column) => column.key),
      ["r32-right", "r16-right", "qf-right"],
    );
  });

  it("keeps left-half paths chronological (sort is a no-op)", () => {
    const columns = visibleColumnsForPathSlice([73, 90, 97]);
    assert.deepEqual(
      columns.map((column) => column.key),
      ["r32-left", "r16-left", "qf-left"],
    );
  });
});
