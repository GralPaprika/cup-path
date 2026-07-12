import type { OpenFootballMatch, Team } from "@/lib/types";

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildTeamLookup(teams: Team[]) {
  const byId = new Map<string, Team>();
  const byAlias = new Map<string, Team>();

  for (const team of teams) {
    byId.set(team.id, team);
    for (const alias of team.aliases) {
      byAlias.set(normalizeName(alias), team);
    }
  }

  return { byId, byAlias, teams };
}

export interface TournamentContext {
  readonly matches: OpenFootballMatch[];
  resolveTeam(name: string): Team | undefined;
  getTeamById(id: string): Team | undefined;
  getAllTeams(): Team[];
  getTeamsByGroup(group: string): Team[];
}

export function createTournamentContext(
  matches: OpenFootballMatch[],
  teams: Team[],
): TournamentContext {
  const { byId, byAlias, teams: registryTeams } = buildTeamLookup(teams);

  return {
    matches,
    resolveTeam(name: string) {
      const direct = byId.get(name.toUpperCase());
      if (direct) return direct;
      return byAlias.get(normalizeName(name));
    },
    getTeamById(id: string) {
      return byId.get(id.toUpperCase());
    },
    getAllTeams() {
      return [...registryTeams].sort((a, b) =>
        a.displayName.localeCompare(b.displayName),
      );
    },
    getTeamsByGroup(group: string) {
      return registryTeams.filter(
        (team) => team.group === group.toUpperCase(),
      );
    },
  };
}
