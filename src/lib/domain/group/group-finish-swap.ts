export type GroupFinishTuple = [string, string, string, string];
export type GroupFinishMap = Record<string, GroupFinishTuple>;
export type GroupFinishPosition = 1 | 2 | 3 | 4;

export function normalizeGroupFinish(
  ids: [string, string, string] | GroupFinishTuple,
  fourthFallback = "",
): GroupFinishTuple {
  if (ids.length >= 4) {
    return [
      ids[0] ?? "",
      ids[1] ?? "",
      ids[2] ?? "",
      ids[3] ?? fourthFallback,
    ];
  }
  return [ids[0] ?? "", ids[1] ?? "", ids[2] ?? "", fourthFallback];
}

export function swapGroupPositions(
  finishes: GroupFinishMap,
  groupLetter: string,
  positionA: GroupFinishPosition,
  positionB: GroupFinishPosition,
): GroupFinishMap {
  if (positionA === positionB) return finishes;
  const current = finishes[groupLetter];
  if (!current) return finishes;

  const next: GroupFinishTuple = [...current];
  const temp = next[positionA - 1];
  next[positionA - 1] = next[positionB - 1];
  next[positionB - 1] = temp;

  return { ...finishes, [groupLetter]: next };
}

export function compactGroupFinishes(
  finishes: GroupFinishMap,
  baseline: GroupFinishMap,
): GroupFinishMap | undefined {
  const diffs: GroupFinishMap = {};
  for (const [letter, ids] of Object.entries(finishes)) {
    const base = baseline[letter];
    if (!base) continue;
    if (
      ids[0] !== base[0] ||
      ids[1] !== base[1] ||
      ids[2] !== base[2] ||
      ids[3] !== base[3]
    ) {
      diffs[letter] = ids;
    }
  }
  return Object.keys(diffs).length > 0 ? diffs : undefined;
}

export function groupFinishesDifferFromBaseline(
  finishes: GroupFinishMap | undefined,
  baseline: GroupFinishMap,
): boolean {
  if (!finishes) return false;
  return compactGroupFinishes(finishes, baseline) !== undefined;
}
