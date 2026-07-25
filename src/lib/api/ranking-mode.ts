import { RANKING_MODE_COOKIE } from "@/lib/client/ranking-mode-preference";
import { parseRankingMode } from "@/lib/data/ranking-modes";
import type { RankingMode } from "@/lib/types";

function readCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  for (const item of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = item.trim().split("=");
    if (rawName === name) return decodeURIComponent(rawValue.join("="));
  }
  return null;
}

export function resolveRankingMode(
  request: Request,
  explicitMode?: string | null,
): RankingMode {
  if (explicitMode) return parseRankingMode(explicitMode);
  return parseRankingMode(readCookie(request, RANKING_MODE_COOKIE));
}
