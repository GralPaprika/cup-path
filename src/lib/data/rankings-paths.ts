import type { RankingMode } from "@/lib/types";

export const BLOB_PATHS: Record<RankingMode, string> = {
  live: "rankings/live.json",
  january: "rankings/snapshot-january.json",
  april: "rankings/snapshot-april.json",
  june11: "rankings/snapshot-june11.json",
};

export const RUNTIME_FILES: Record<RankingMode, string> = {
  live: "live.json",
  january: "january.json",
  april: "april.json",
  june11: "june11.json",
};

export function rankingsCacheTag(mode: RankingMode): string {
  return `rankings:${mode}`;
}
