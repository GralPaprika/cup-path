import { gapBinForPoints } from "@/lib/domain/match/match-outcome-gap";
import {
  TEAM_TIER_IDS,
  classifyTeamTier,
} from "@/lib/domain/team/team-tiers";
import type {
  EvenMatchesByTierInsight,
  MatchOutcomeGapEntry,
  TeamTierId,
} from "@/lib/types";

export type { EvenMatchesByTierInsight, EvenMatchesByTierRow } from "@/lib/types";

/** Prefer the stronger (higher) tier when an even match sits on a tier border. */
export function higherTeamTier(a: TeamTierId, b: TeamTierId): TeamTierId {
  return TEAM_TIER_IDS.indexOf(a) <= TEAM_TIER_IDS.indexOf(b) ? a : b;
}

function evenMatchBucketTier(
  entry: MatchOutcomeGapEntry,
): TeamTierId | null {
  if (
    entry.team1FifaPoints === null ||
    entry.team2FifaPoints === null ||
    gapBinForPoints(entry.gapPoints) !== "0-100"
  ) {
    return null;
  }

  return higherTeamTier(
    classifyTeamTier(entry.team1FifaPoints),
    classifyTeamTier(entry.team2FifaPoints),
  );
}

/**
 * Group-stage “partidos igualados” (gap ≤ 100 FIFA pts), counted by the
 * higher of the two teams’ strength tiers.
 */
export function computeEvenMatchesByTier(
  matches: MatchOutcomeGapEntry[],
): EvenMatchesByTierInsight | null {
  if (matches.length === 0) return null;

  const groupMatches = matches.filter((entry) => entry.stage === "group");
  if (groupMatches.length === 0) return null;

  const counts = Object.fromEntries(
    TEAM_TIER_IDS.map((tier) => [tier, 0]),
  ) as Record<TeamTierId, number>;

  let evenMatchCount = 0;
  for (const entry of groupMatches) {
    const tier = evenMatchBucketTier(entry);
    if (!tier) continue;
    counts[tier] += 1;
    evenMatchCount += 1;
  }

  if (evenMatchCount === 0) return null;

  return {
    groupStagePct: Math.round((groupMatches.length / matches.length) * 100),
    groupMatchCount: groupMatches.length,
    totalMatchCount: matches.length,
    evenMatchCount,
    rows: TEAM_TIER_IDS.filter((tier) => counts[tier] > 0).map((tier) => ({
      tier,
      count: counts[tier],
    })),
  };
}
