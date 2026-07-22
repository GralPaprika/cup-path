import type {
  RankingEntry,
  Team,
  TeamTierDataset,
  TeamTierId,
  TeamTierMember,
} from "@/lib/types";
import type { TournamentContext } from "@/lib/domain/tournament/tournament-context";
import { getTeamsAtStage } from "@/lib/domain/team/team-stage-logic";

export const TEAM_TIER_IDS: readonly TeamTierId[] = [
  "titleFavorites",
  "contenders",
  "darkHorses",
  "outsiders",
  "makeweights",
] as const;

/** FIFA points cuts — see docs/team-tiers.md */
export function classifyTeamTier(points: number): TeamTierId {
  if (points >= 1800) return "titleFavorites";
  if (points >= 1700) return "contenders";
  if (points >= 1580) return "darkHorses";
  if (points >= 1450) return "outsiders";
  return "makeweights";
}

function withFlag(team: Team, flagUrl?: string): Team {
  if (!flagUrl || flagUrl === team.flagUrl) return team;
  return { ...team, flagUrl };
}

export function buildTeamTiersDataset(
  ctx: TournamentContext,
  rankings: Map<string, RankingEntry>,
): TeamTiersDataset {
  const membersByTier = Object.fromEntries(
    TEAM_TIER_IDS.map((tier) => [tier, [] as TeamTierMember[]]),
  ) as Record<TeamTierId, TeamTierMember[]>;

  for (const teamId of getTeamsAtStage(ctx, "group")) {
    const team = ctx.getTeamById(teamId);
    const ranking = rankings.get(teamId);
    if (!team || !ranking) continue;

    const member: TeamTierMember = {
      team: withFlag(team, ranking.flagUrl),
      fifaRank: ranking.rank,
      fifaPoints: ranking.points,
    };
    membersByTier[classifyTeamTier(ranking.points)].push(member);
  }

  for (const tier of TEAM_TIER_IDS) {
    membersByTier[tier].sort(
      (a, b) => b.fifaPoints - a.fifaPoints || a.fifaRank - b.fifaRank,
    );
  }

  return { tiers: membersByTier };
}
