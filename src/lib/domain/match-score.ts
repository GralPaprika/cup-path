import type { OpenFootballScore } from "@/lib/types";

export interface MatchScoreBreakdown {
  ft: string;
  et: string | null;
  pens: string | null;
}

function formatPair(pair: [number, number]): string {
  return `${pair[0]}-${pair[1]}`;
}

export function buildMatchScoreBreakdown(
  score: OpenFootballScore | undefined,
): MatchScoreBreakdown | null {
  if (!score?.ft) return null;

  return {
    ft: formatPair(score.ft),
    et: score.et ? formatPair(score.et) : null,
    pens: score.p ? formatPair(score.p) : null,
  };
}
