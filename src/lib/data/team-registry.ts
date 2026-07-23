import type { OpenFootballTeam, RankingMode, RankingsSnapshot, Team } from "@/lib/types";
import { getFifaFlagUrl } from "@/lib/data/flag-utils";
import bundledTeams from "../../../data/worldcup/2026/worldcup.teams.json";

const EXTRA_ALIASES: Record<string, string[]> = {
  USA: ["United States", "US", "United States of America"],
  KOR: ["Korea Republic", "South Korea", "Korea"],
  RSA: ["South Africa"],
  CIV: ["Cote d'Ivoire", "Ivory Coast", "Côte d'Ivoire"],
  COD: ["Congo DR", "DR Congo", "Democratic Republic of the Congo"],
  TUR: ["Türkiye", "Turkey"],
  CUW: ["Curacao", "Curaçao"],
  CPV: ["Cabo Verde", "Cape Verde"],
  IRN: ["IR Iran", "Iran"],
  CZE: ["Czechia", "Czech Republic"],
  BIH: ["Bosnia and Herzegovina", "Bosnia & Herzegovina"],
  KSA: ["Saudi Arabia", "KSA"],
  NED: ["Netherlands", "Holland"],
  SUI: ["Switzerland"],
  ENG: ["England"],
  GER: ["Germany"],
  SCO: ["Scotland"],
  WAL: ["Wales"],
};

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function teamFromOpenFootball(raw: OpenFootballTeam): Team {
  return buildTeam(raw);
}

function buildTeam(raw: OpenFootballTeam): Team {
  const aliases = new Set<string>([
    raw.name,
    raw.fifa_code,
    ...(raw.name_normalised ? [raw.name_normalised] : []),
    ...(EXTRA_ALIASES[raw.fifa_code] ?? []),
  ]);

  return {
    id: raw.fifa_code,
    displayName: raw.name,
    aliases: [...aliases],
    group: raw.group,
    flagUrl: getFifaFlagUrl(raw.fifa_code),
    confederation: raw.confed,
  };
}

let teams: Team[] = [];
let byId = new Map<string, Team>();
let byAlias = new Map<string, Team>();

function rebuildLookupMaps(nextTeams: Team[]): void {
  teams = nextTeams;
  byId = new Map<string, Team>();
  byAlias = new Map<string, Team>();

  for (const team of teams) {
    byId.set(team.id, team);
    for (const alias of team.aliases) {
      byAlias.set(normalizeName(alias), team);
    }
  }
}

export function initializeTeamRegistry(rawTeams: OpenFootballTeam[]): void {
  rebuildLookupMaps(rawTeams.map(buildTeam));
}

initializeTeamRegistry(bundledTeams as OpenFootballTeam[]);

export function getAllTeams(): Team[] {
  return [...teams].sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function getTeamById(id: string): Team | undefined {
  return byId.get(id.toUpperCase());
}

export function resolveTeam(name: string): Team | undefined {
  const direct = byId.get(name.toUpperCase());
  if (direct) return direct;
  return byAlias.get(normalizeName(name));
}

export function getTeamsByGroup(group: string): Team[] {
  return teams.filter((team) => team.group === group.toUpperCase());
}

export function enrichTeam(team: Team, flagUrl?: string): Team {
  if (!flagUrl || flagUrl === team.flagUrl) return team;
  return { ...team, flagUrl };
}

export function enrichTeamsFromSnapshot(
  teamsList: Team[],
  snapshot: RankingsSnapshot,
): Team[] {
  const flagMap = new Map(
    snapshot.entries
      .filter((entry) => entry.flagUrl)
      .map((entry) => [entry.teamId, entry.flagUrl!]),
  );

  return teamsList.map((team) => enrichTeam(team, flagMap.get(team.id)));
}

export async function getAllTeamsEnriched(
  mode?: RankingMode,
): Promise<Team[]> {
  const { ensureWorldCupData } = await import("@/lib/data/worldcup-store");
  await ensureWorldCupData();

  const { getRankingsSnapshot } = await import("@/lib/data/rankings-store");
  const snapshot = await getRankingsSnapshot(mode ?? "july20");
  return enrichTeamsFromSnapshot(getAllTeams(), snapshot);
}

export function applyFlagMapToTeams(
  teamsList: Team[],
  flagMap: Map<string, string>,
): Team[] {
  return teamsList.map((team) => enrichTeam(team, flagMap.get(team.id)));
}
