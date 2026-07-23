import type { RankingMode } from "@/lib/types";

export const BLOB_PATHS: Record<RankingMode, string> = {
  july20: "rankings/snapshot-july20.json",
  january: "rankings/snapshot-january.json",
  april: "rankings/snapshot-april.json",
  june11: "rankings/snapshot-june11.json",
  november19: "rankings/snapshot-november19.json",
};

export const RUNTIME_FILES: Record<RankingMode, string> = {
  july20: "july20.json",
  january: "january.json",
  april: "april.json",
  june11: "june11.json",
  november19: "november19.json",
};

export function rankingsCacheTag(mode: RankingMode): string {
  return `rankings:${mode}`;
}
