import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BRACKET_COLUMNS,
  exclusiveCenterMatchNums,
  getMatchLayout,
  getPathSliceLayouts,
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

  it("collapses right-half paths into one column per round (R32 → R16)", () => {
    const columns = visibleColumnsForPathSlice([79, 80, 92]);
    assert.deepEqual(
      columns.map((column) => column.key),
      ["path-round32", "path-round16"],
    );
    assert.deepEqual(columns[0]?.matchNums, [79, 80]);
    assert.deepEqual(columns[1]?.matchNums, [92]);
  });

  it("orders right-half spans left-to-right through QF", () => {
    const columns = visibleColumnsForPathSlice([79, 92, 99]);
    assert.deepEqual(
      columns.map((column) => column.key),
      ["path-round32", "path-round16", "path-quarterFinal"],
    );
  });

  it("collapses left-half paths into one column per round", () => {
    const columns = visibleColumnsForPathSlice([73, 90, 97]);
    assert.deepEqual(
      columns.map((column) => column.key),
      ["path-round32", "path-round16", "path-quarterFinal"],
    );
    assert.deepEqual(columns[0]?.matchNums, [73]);
  });

  it("merges left and right halves into a single column per round", () => {
    // Path on left (#77) plus opposite-half feeder (#76) both R32.
    const columns = visibleColumnsForPathSlice([77, 76, 89, 91]);
    assert.deepEqual(
      columns.map((column) => column.key),
      ["path-round32", "path-round16"],
    );
    assert.deepEqual(columns[0]?.matchNums, [77, 76]);
    assert.deepEqual(columns[1]?.matchNums, [89, 91]);
  });
});

describe("exclusiveCenterMatchNums", () => {
  it("hides third place when the focus path is the Final", () => {
    assert.deepEqual(
      [...exclusiveCenterMatchNums([101, 103, 104], [101, 104])].sort(
        (a, b) => a - b,
      ),
      [101, 104],
    );
  });

  it("hides the Final when the focus path is third place", () => {
    assert.deepEqual(
      [...exclusiveCenterMatchNums([101, 103, 104], [101, 103])].sort(
        (a, b) => a - b,
      ),
      [101, 103],
    );
  });

  it("hides third place when the focus path includes neither", () => {
    assert.deepEqual(
      [...exclusiveCenterMatchNums([101, 103, 104], [101])].sort(
        (a, b) => a - b,
      ),
      [101, 104],
    );
  });
});

describe("getPathSliceLayouts", () => {
  it("places a single path chain on one aligned row", () => {
    const columns = visibleColumnsForPathSlice([77, 89, 97]);
    const sources = new Map<number, number[]>([
      [89, [77]],
      [97, [89]],
    ]);
    const { layouts, gridRows } = getPathSliceLayouts(columns, sources);

    assert.equal(gridRows, 1);
    assert.deepEqual(layouts.get(77), {
      matchNum: 77,
      columnIndex: 0,
      rowStart: 1,
      rowSpan: 1,
    });
    assert.deepEqual(layouts.get(89), {
      matchNum: 89,
      columnIndex: 1,
      rowStart: 1,
      rowSpan: 1,
    });
    assert.deepEqual(layouts.get(97), {
      matchNum: 97,
      columnIndex: 2,
      rowStart: 1,
      rowSpan: 1,
    });
  });

  it("spans a later match across its visible feeder children", () => {
    // Path R32 #77 + feeder R32 #76 both feed R16 #89.
    const columns = visibleColumnsForPathSlice([77, 76, 89]);
    const sources = new Map<number, number[]>([[89, [77, 76]]]);
    const { layouts, gridRows } = getPathSliceLayouts(columns, sources);

    assert.equal(gridRows, 2);
    assert.deepEqual(layouts.get(77), {
      matchNum: 77,
      columnIndex: 0,
      rowStart: 1,
      rowSpan: 1,
    });
    assert.deepEqual(layouts.get(76), {
      matchNum: 76,
      columnIndex: 0,
      rowStart: 2,
      rowSpan: 1,
    });
    assert.deepEqual(layouts.get(89), {
      matchNum: 89,
      columnIndex: 1,
      rowStart: 1,
      rowSpan: 2,
    });
  });

  it("propagates branch height through the path", () => {
    const columns = visibleColumnsForPathSlice([77, 76, 89, 97]);
    const sources = new Map<number, number[]>([
      [89, [77, 76]],
      [97, [89]],
    ]);
    const { layouts, gridRows } = getPathSliceLayouts(columns, sources);

    assert.equal(gridRows, 2);
    assert.deepEqual(layouts.get(97), {
      matchNum: 97,
      columnIndex: 2,
      rowStart: 1,
      rowSpan: 2,
    });
  });
});
