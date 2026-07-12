import type { PathStage } from "@/lib/types";
import type { TournamentContext } from "@/lib/domain/tournament-context";
import {
  getMatchWinner,
  isMatchPlayed,
} from "@/lib/data/worldcup-loader";
import {
  getAdvancingTeams,
  getTeamMatches,
} from "@/lib/domain/path-builder";
import { getMatchStage, PATH_STAGES } from "@/lib/domain/match-stages";

function stageIndex(stage: PathStage): number {
  return PATH_STAGES.indexOf(stage);
}

function teamWonKnockoutMatch(
  ctx: TournamentContext,
  teamId: string,
  match: ReturnType<typeof getTeamMatches>[number],
): boolean {
  if (!isMatchPlayed(match) || match.round.startsWith("Matchday")) return false;

  const winner = getMatchWinner(match);
  const winnerTeam = winner ? ctx.resolveTeam(winner) : undefined;
  return winnerTeam?.id === teamId;
}

function highestStageReached(
  ctx: TournamentContext,
  teamId: string,
): PathStage {
  const matches = getTeamMatches(ctx, teamId);
  let highest = 0;

  for (const match of matches) {
    const stage = getMatchStage(match.round);
    if (!stage) continue;

    const stageIdx = stageIndex(stage);
    highest = Math.max(highest, stageIdx);

    if (teamWonKnockoutMatch(ctx, teamId, match) && stageIdx < PATH_STAGES.length - 1) {
      highest = Math.max(highest, stageIdx + 1);
    }
  }

  return PATH_STAGES[highest];
}

export function getTeamMaxStageReached(
  ctx: TournamentContext,
  teamId: string,
): PathStage {
  return highestStageReached(ctx, teamId);
}

export function getCompareMaxStageReached(
  ctx: TournamentContext,
  teamAId?: string,
  teamBId?: string,
): PathStage | undefined {
  if (teamAId && teamBId && teamAId !== teamBId) {
    const sharedIndex = Math.min(
      stageIndex(getTeamMaxStageReached(ctx, teamAId)),
      stageIndex(getTeamMaxStageReached(ctx, teamBId)),
    );
    return PATH_STAGES[sharedIndex];
  }
  if (teamAId) return getTeamMaxStageReached(ctx, teamAId);
  if (teamBId) return getTeamMaxStageReached(ctx, teamBId);
  return undefined;
}

export function teamReachedStage(
  ctx: TournamentContext,
  teamId: string,
  minStage: PathStage,
): boolean {
  if (minStage === "group") return true;

  if (minStage === "r32") {
    const advancing = getAdvancingTeams(ctx);
    if (advancing.has(teamId)) return true;
  }

  return stageIndex(highestStageReached(ctx, teamId)) >= stageIndex(minStage);
}

export function getTeamsAtStage(
  ctx: TournamentContext,
  minStage: PathStage,
): Set<string> {
  return new Set(
    ctx
      .getAllTeams()
      .filter((team) => teamReachedStage(ctx, team.id, minStage))
      .map((team) => team.id),
  );
}

export function countTeamsAtStage(
  ctx: TournamentContext,
  minStage: PathStage,
): number {
  return getTeamsAtStage(ctx, minStage).size;
}

export function getTeamCountsByStage(
  ctx: TournamentContext,
): Record<PathStage, number> {
  return Object.fromEntries(
    PATH_STAGES.map((stage) => [stage, countTeamsAtStage(ctx, stage)]),
  ) as Record<PathStage, number>;
}
