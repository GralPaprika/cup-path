export interface BracketMatchLayout {
  matchNum: number;
  column: number;
  rowStart: number;
  rowSpan: number;
}

const R32 = Array.from({ length: 16 }, (_, index) => 73 + index);
const R16 = Array.from({ length: 8 }, (_, index) => 89 + index);
const QF = Array.from({ length: 4 }, (_, index) => 97 + index);
const SF = [101, 102];
const FINAL = [104];
const THIRD = [103];

export const BRACKET_COLUMNS = [
  { key: "r32", label: "Round of 32", matchNums: R32 },
  { key: "r16", label: "Round of 16", matchNums: R16 },
  { key: "qf", label: "Quarter-final", matchNums: QF },
  { key: "sf", label: "Semi-final", matchNums: SF },
  { key: "final", label: "Final", matchNums: [...THIRD, ...FINAL] },
] as const;

const GRID_ROWS = 16;

function layoutForMatch(matchNum: number): BracketMatchLayout {
  if (matchNum >= 73 && matchNum <= 88) {
    return {
      matchNum,
      column: 0,
      rowStart: matchNum - 73 + 1,
      rowSpan: 1,
    };
  }

  if (matchNum >= 89 && matchNum <= 96) {
    const index = matchNum - 89;
    return {
      matchNum,
      column: 1,
      rowStart: index * 2 + 1,
      rowSpan: 2,
    };
  }

  if (matchNum >= 97 && matchNum <= 100) {
    const index = matchNum - 97;
    return {
      matchNum,
      column: 2,
      rowStart: index * 4 + 1,
      rowSpan: 4,
    };
  }

  if (matchNum === 101) {
    return { matchNum, column: 3, rowStart: 1, rowSpan: 8 };
  }
  if (matchNum === 102) {
    return { matchNum, column: 3, rowStart: 9, rowSpan: 8 };
  }
  if (matchNum === 103) {
    return { matchNum, column: 4, rowStart: 4, rowSpan: 4 };
  }
  if (matchNum === 104) {
    return { matchNum, column: 4, rowStart: 1, rowSpan: 16 };
  }

  return { matchNum, column: 0, rowStart: 1, rowSpan: 1 };
}

export function getBracketGridRows(): number {
  return GRID_ROWS;
}

export function getMatchLayout(matchNum: number): BracketMatchLayout {
  return layoutForMatch(matchNum);
}

export function getAllMatchLayouts(): BracketMatchLayout[] {
  return BRACKET_COLUMNS.flatMap((column) =>
    column.matchNums.map((matchNum) => layoutForMatch(matchNum)),
  );
}
