function assignAverageRanks(values: number[], higherIsHarder: boolean): number[] {
  const indexed = values.map((value, index) => ({ value, index }));
  indexed.sort((a, b) =>
    higherIsHarder ? b.value - a.value : a.value - b.value,
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

    const averageRank = (start + end + 2) / 2;

    for (let i = start; i <= end; i += 1) {
      ranks[indexed[i].index] = averageRank;
    }

    start = end + 1;
  }

  return ranks;
}

export function spearmanRho(rankA: number[], rankB: number[]): number | null {
  const n = rankA.length;
  if (n < 2 || rankA.length !== rankB.length) return null;

  const meanA = rankA.reduce((sum, value) => sum + value, 0) / n;
  const meanB = rankB.reduce((sum, value) => sum + value, 0) / n;

  let numerator = 0;
  let denomA = 0;
  let denomB = 0;

  for (let i = 0; i < n; i += 1) {
    const deltaA = rankA[i] - meanA;
    const deltaB = rankB[i] - meanB;
    numerator += deltaA * deltaB;
    denomA += deltaA * deltaA;
    denomB += deltaB * deltaB;
  }

  if (denomA === 0 || denomB === 0) return null;
  return numerator / Math.sqrt(denomA * denomB);
}

/** Kendall τ-b: adjusts concordance denominator for ties in either array. */
export function kendallTau(rankA: number[], rankB: number[]): number | null {
  const n = rankA.length;
  if (n < 2 || rankA.length !== rankB.length) return null;

  let concordant = 0;
  let discordant = 0;
  let tiesAOnly = 0;
  let tiesBOnly = 0;

  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      const signA = Math.sign(rankA[i] - rankA[j]);
      const signB = Math.sign(rankB[i] - rankB[j]);

      if (signA === 0 && signB === 0) continue;
      if (signA === 0) {
        tiesAOnly += 1;
        continue;
      }
      if (signB === 0) {
        tiesBOnly += 1;
        continue;
      }

      if (signA === signB) concordant += 1;
      else discordant += 1;
    }
  }

  const denominator = Math.sqrt(
    (concordant + discordant + tiesAOnly) *
      (concordant + discordant + tiesBOnly),
  );
  if (denominator === 0) return null;
  return (concordant - discordant) / denominator;
}

export interface CohortOrderingCorrelation {
  spearmanRho: number | null;
  kendallTau: number | null;
  comparableTeamCount: number;
}

export function computeCohortOrderingCorrelation(
  pointsValues: number[],
  rankValues: number[],
): CohortOrderingCorrelation {
  const count = Math.min(pointsValues.length, rankValues.length);

  if (count < 2) {
    return {
      spearmanRho: null,
      kendallTau: null,
      comparableTeamCount: count,
    };
  }

  const points = pointsValues.slice(0, count);
  const ranks = rankValues.slice(0, count);
  const pointsRanks = assignAverageRanks(points, true);
  const rankRanks = assignAverageRanks(ranks, false);

  return {
    spearmanRho: spearmanRho(pointsRanks, rankRanks),
    kendallTau: kendallTau(pointsRanks, rankRanks),
    comparableTeamCount: count,
  };
}
