import { parseRankingMode } from "@/lib/data/ranking-modes";
import type { RankingMode } from "@/lib/types";

export const RANKING_MODE_STORAGE_KEY = "cuppath:ranking-mode";
export const RANKING_MODE_COOKIE = "RANKING_MODE";

export function readRankingModePreference(): RankingMode | null {
  if (typeof window === "undefined") return null;

  const fromStorage = localStorage.getItem(RANKING_MODE_STORAGE_KEY);
  if (fromStorage) {
    return parseRankingMode(fromStorage);
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${RANKING_MODE_COOKIE}=([^;]*)`),
  );
  if (match?.[1]) {
    return parseRankingMode(decodeURIComponent(match[1]));
  }

  return null;
}

export function writeRankingModePreference(mode: RankingMode): void {
  localStorage.setItem(RANKING_MODE_STORAGE_KEY, mode);
  document.cookie = `${RANKING_MODE_COOKIE}=${mode};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
}

export function resolveRankingMode(
  urlMode: string | null,
  storedMode: RankingMode | null = null,
): RankingMode {
  if (urlMode) return parseRankingMode(urlMode);
  return storedMode ?? "live";
}
