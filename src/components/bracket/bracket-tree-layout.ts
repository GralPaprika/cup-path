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
