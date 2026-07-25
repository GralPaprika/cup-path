export type RankingMode =
  | "july20"
  | "june11"
  | "april"
  | "january"
  | "november19";

export interface RankingEntry {
  teamId: string;
  rank: number;
  points: number;
  flagUrl?: string;
  previousRank?: number;
}

export interface RankingsSnapshot {
  mode: RankingMode | "snapshot";
  fetchedAt: string;
  sourceDate: string;
  entries: RankingEntry[];
}

export interface RankingsMeta {
  july20Date: string | null;
  januaryDate: string | null;
  aprilDate: string | null;
  june11Date: string | null;
  november19Date: string | null;
}
