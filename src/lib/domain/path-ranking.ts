/** Competition ranking (1224): tied values share the same rank. */
export function assignCompetitionRanks(
  values: number[],
  higherIsBetter: boolean,
): number[] {
  const indexed = values.map((value, index) => ({ value, index }));
  indexed.sort((a, b) =>
    higherIsBetter ? b.value - a.value : a.value - b.value,
  );

  const ranks = new Array<number>(values.length);
  let start = 0;

  while (start < indexed.length) {
    let end = start;
    while (
      end + 1 < indexed.length &&
      indexed[end + 1].value === indexed[start].value
    ) {
      end += 1;
    }

    const rank = start + 1;
    for (let i = start; i <= end; i += 1) {
      ranks[indexed[i].index] = rank;
    }

    start = end + 1;
  }

  return ranks;
}

export function buildCompetitionRankMap(
  entries: Array<{ teamId: string; value: number }>,
  higherIsBetter: boolean,
): Map<string, number> {
  if (entries.length === 0) return new Map();

  const values = entries.map((entry) => entry.value);
  const ranks = assignCompetitionRanks(values, higherIsBetter);
  return new Map(entries.map((entry, index) => [entry.teamId, ranks[index]]));
}

export function rankTeamInCohort(
  entries: Array<{ teamId: string; value: number }>,
  teamId: string,
  higherIsBetter: boolean,
): number | null {
  if (entries.length === 0) return null;

  const values = entries.map((entry) => entry.value);
  const ranks = assignCompetitionRanks(values, higherIsBetter);
  const index = entries.findIndex((entry) => entry.teamId === teamId);
  return index >= 0 ? ranks[index] : null;
}
