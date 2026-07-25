export interface NumericStats {
  count: number;
  mean: number | null;
  median: number | null;
  variance: number | null;
  stdDev: number | null;
  min: number | null;
  max: number | null;
}

export interface CohortOrderingCorrelation {
  spearmanRho: number | null;
  kendallTau: number | null;
  comparableTeamCount: number;
}
