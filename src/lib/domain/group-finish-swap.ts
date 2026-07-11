export type GroupFinishMap = Record<string, [string, string, string]>;

export function swapGroupPositions(
  finishes: GroupFinishMap,
  groupLetter: string,
  positionA: 1 | 2 | 3,
  positionB: 1 | 2 | 3,
): GroupFinishMap {
  if (positionA === positionB) return finishes;
  const current = finishes[groupLetter];
  if (!current) return finishes;

  const next: [string, string, string] = [...current] as [
    string,
    string,
    string,
  ];
  const temp = next[positionA - 1];
  next[positionA - 1] = next[positionB - 1];
  next[positionB - 1] = temp;

  return { ...finishes, [groupLetter]: next };
}
