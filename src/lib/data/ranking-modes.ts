import type { RankingMode } from "@/lib/types";

export const RANKING_MODES: RankingMode[] = [
  "live",
  "june11",
  "april",
  "january",
  "november19",
];

export const SNAPSHOT_MODES = [
  "june11",
  "april",
  "january",
  "november19",
] as const;

export type SnapshotMode = (typeof SNAPSHOT_MODES)[number];

export const SNAPSHOT_DATES: Record<SnapshotMode, string> = {
  january: "2026-01-19",
  april: "2026-04-01",
  june11: "2026-06-11",
  november19: "2025-11-19",
};

const LEGACY_MODES: Record<string, RankingMode> = {
  yearStart: "january",
  tournamentStart: "june11",
};

export function parseRankingMode(value: string | null): RankingMode {
  if (value && LEGACY_MODES[value]) {
    return LEGACY_MODES[value];
  }
  if (value && RANKING_MODES.includes(value as RankingMode)) {
    return value as RankingMode;
  }
  return "live";
}

export function isSnapshotMode(mode: RankingMode): mode is SnapshotMode {
  return mode !== "live";
}
