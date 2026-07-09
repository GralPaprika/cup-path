import "server-only";

import type { PathStage } from "@/lib/types";
import { getAllTeams, resolveTeam } from "@/lib/data/team-registry";
import {
  getMatchWinner,
  isMatchPlayed,
} from "@/lib/data/worldcup-loader";
import { getAdvancingTeams, getTeamMatches } from "@/lib/domain/path-builder";
import { getMatchStage, PATH_STAGES } from "@/lib/domain/match-stages";

function stageIndex(stage: PathStage): number {
  return PATH_STAGES.indexOf(stage);
}

function teamWonKnockoutMatch(
  teamId: string,
  match: ReturnType<typeof getTeamMatches>[number],
): boolean {
  if (!isMatchPlayed(match) || match.round.startsWith("Matchday")) return false;

  const winner = getMatchWinner(match);
  const winnerTeam = winner ? resolveTeam(winner) : undefined;
  return winnerTeam?.id === teamId;
}

function highestStageReached(teamId: string): PathStage {
  const matches = getTeamMatches(teamId);
  let highest = 0;

  for (const match of matches) {
    const stage = getMatchStage(match.round);
    if (!stage) continue;

    const stageIdx = stageIndex(stage);
    highest = Math.max(highest, stageIdx);

    if (teamWonKnockoutMatch(teamId, match) && stageIdx < PATH_STAGES.length - 1) {
      highest = Math.max(highest, stageIdx + 1);
    }
  }

  return PATH_STAGES[highest];
}

export function getTeamMaxStageReached(teamId: string): PathStage {
  return highestStageReached(teamId);
}

export function teamReachedStage(teamId: string, minStage: PathStage): boolean {
  if (minStage === "group") return true;

  if (minStage === "r32") {
    const advancing = getAdvancingTeams();
    if (advancing.has(teamId)) return true;
  }

  return stageIndex(highestStageReached(teamId)) >= stageIndex(minStage);
}

export function getTeamsAtStage(minStage: PathStage): Set<string> {
  return new Set(
    getAllTeams()
      .filter((team) => teamReachedStage(team.id, minStage))
      .map((team) => team.id),
  );
}

export function countTeamsAtStage(minStage: PathStage): number {
  return getTeamsAtStage(minStage).size;
}

export function getTeamCountsByStage(): Record<PathStage, number> {
  return Object.fromEntries(
    PATH_STAGES.map((stage) => [stage, countTeamsAtStage(stage)]),
  ) as Record<PathStage, number>;
}
