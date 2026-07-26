import type { RoundDisplayKey } from "@/lib/i18n/round-display-name";

export interface BracketMatchLayout {
  matchNum: number;
  column: number;
  rowStart: number;
  rowSpan: number;
}

// Mirrored bracket: matches feeding SF #101 form the left half,
// matches feeding SF #102 form the right half, Final in the center.
// Within-column order follows the feed chains so adjacent cards
// pair into their next-round match.
const LEFT_R32 = [74, 77, 73, 75, 83, 84, 81, 82];
const LEFT_R16 = [89, 90, 93, 94];
const LEFT_QF = [97, 98];
const LEFT_SF = [101];

const RIGHT_R32 = [76, 78, 79, 80, 85, 87, 86, 88];
const RIGHT_R16 = [91, 92, 96, 95];
const RIGHT_QF = [99, 100];
const RIGHT_SF = [102];

const FINAL = 104;
const THIRD_PLACE = 103;

export interface BracketColumn {
  key: string;
  roundKey: RoundDisplayKey;
  matchNums: number[];
}

export const BRACKET_COLUMNS: BracketColumn[] = [
  { key: "r32-left", roundKey: "round32", matchNums: LEFT_R32 },
  { key: "r16-left", roundKey: "round16", matchNums: LEFT_R16 },
  { key: "qf-left", roundKey: "quarterFinal", matchNums: LEFT_QF },
  { key: "sf-left", roundKey: "semiFinal", matchNums: LEFT_SF },
  { key: "center", roundKey: "final", matchNums: [FINAL, THIRD_PLACE] },
  { key: "sf-right", roundKey: "semiFinal", matchNums: RIGHT_SF },
  { key: "qf-right", roundKey: "quarterFinal", matchNums: RIGHT_QF },
  { key: "r16-right", roundKey: "round16", matchNums: RIGHT_R16 },
  { key: "r32-right", roundKey: "round32", matchNums: RIGHT_R32 },
];

const GRID_ROWS = 8;

const LAYOUTS = new Map<number, BracketMatchLayout>();

function place(
  matchNums: number[],
  column: number,
  rowSpan: number,
): void {
  matchNums.forEach((matchNum, index) => {
    LAYOUTS.set(matchNum, {
      matchNum,
      column,
      rowStart: index * rowSpan + 1,
      rowSpan,
    });
  });
}

place(LEFT_R32, 0, 1);
place(LEFT_R16, 1, 2);
place(LEFT_QF, 2, 4);
place(LEFT_SF, 3, 8);
place(RIGHT_SF, 5, 8);
place(RIGHT_QF, 6, 4);
place(RIGHT_R16, 7, 2);
place(RIGHT_R32, 8, 1);
LAYOUTS.set(FINAL, { matchNum: FINAL, column: 4, rowStart: 2, rowSpan: 3 });
LAYOUTS.set(THIRD_PLACE, {
  matchNum: THIRD_PLACE,
  column: 4,
  rowStart: 5,
  rowSpan: 3,
});

export function getBracketGridRows(): number {
  return GRID_ROWS;
}

export function getMatchLayout(matchNum: number): BracketMatchLayout {
  return (
    LAYOUTS.get(matchNum) ?? {
      matchNum,
      column: 0,
      rowStart: 1,
      rowSpan: 1,
    }
  );
}

const PATH_SLICE_ROUND_ORDER: readonly RoundDisplayKey[] = [
  "round32",
  "round16",
  "quarterFinal",
  "semiFinal",
  "final",
];

/**
 * Contiguous column slice covering curated match nums so relative
 * bracket spacing stays intact while empty halves are cropped away.
 */
export function visibleColumnsForCurated(
  matchNums: Iterable<number>,
): BracketColumn[] {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (const matchNum of matchNums) {
    const { column } = getMatchLayout(matchNum);
    if (column < min) min = column;
    if (column > max) max = column;
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return [];
  }

  return BRACKET_COLUMNS.filter(
    (_, index) => index >= min && index <= max,
  );
}

/**
 * Path-slice columns collapsed to one column per round (R32 → Final),
 * merging left/right halves so cards can stack in a single track.
 */
export function visibleColumnsForPathSlice(
  matchNums: Iterable<number>,
): BracketColumn[] {
  const visible = new Set(matchNums);
  if (visible.size === 0) return [];

  const columns: BracketColumn[] = [];

  for (const roundKey of PATH_SLICE_ROUND_ORDER) {
    const merged: number[] = [];
    for (const column of BRACKET_COLUMNS) {
      if (column.roundKey !== roundKey) continue;
      for (const matchNum of column.matchNums) {
        if (visible.has(matchNum)) merged.push(matchNum);
      }
    }
    if (merged.length === 0) continue;
    columns.push({
      key: `path-${roundKey}`,
      roundKey,
      matchNums: merged,
    });
  }

  return columns;
}

export interface PathSliceMatchLayout {
  matchNum: number;
  columnIndex: number;
  rowStart: number;
  rowSpan: number;
}

/** sourceMatchNum values that feed into a match (home then away). */
export type PathSliceSourcesByMatch = ReadonlyMap<number, readonly number[]>;

/**
 * Bracket-branch placement for the path slice: earlier rounds stack as leaves,
 * later rounds span the vertical range of their visible feeder children so the
 * path reads like a tournament tree rather than a dense list.
 */
export function getPathSliceLayouts(
  visibleColumns: BracketColumn[],
  sourcesByMatch: PathSliceSourcesByMatch = new Map(),
): {
  layouts: Map<number, PathSliceMatchLayout>;
  gridRows: number;
} {
  const layouts = new Map<number, PathSliceMatchLayout>();

  function occupiedRowEnd(): number {
    let end = 0;
    for (const layout of layouts.values()) {
      end = Math.max(end, layout.rowStart + layout.rowSpan - 1);
    }
    return end;
  }

  visibleColumns.forEach((column, columnIndex) => {
    for (const matchNum of column.matchNums) {
      const childLayouts = (sourcesByMatch.get(matchNum) ?? [])
        .map((sourceNum) => layouts.get(sourceNum))
        .filter((layout): layout is PathSliceMatchLayout => layout != null);

      if (childLayouts.length > 0) {
        const rowStart = Math.min(...childLayouts.map((l) => l.rowStart));
        const rowEnd = Math.max(
          ...childLayouts.map((l) => l.rowStart + l.rowSpan - 1),
        );
        layouts.set(matchNum, {
          matchNum,
          columnIndex,
          rowStart,
          rowSpan: Math.max(1, rowEnd - rowStart + 1),
        });
        continue;
      }

      layouts.set(matchNum, {
        matchNum,
        columnIndex,
        rowStart: occupiedRowEnd() + 1,
        rowSpan: 1,
      });
    }
  });

  return { layouts, gridRows: occupiedRowEnd() };
}
