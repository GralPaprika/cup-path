import type { Team } from "@/lib/types";

export function enrichTeam(team: Team, flagUrl?: string): Team {
  if (!flagUrl || flagUrl === team.flagUrl) return team;
  return { ...team, flagUrl };
}
