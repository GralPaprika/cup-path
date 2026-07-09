import type { WorldCupBundle } from "@/lib/data/worldcup-paths";

export const OPENFOOTBALL_BASE_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026";

export const OPENFOOTBALL_FILES = [
  "worldcup.json",
  "worldcup.teams.json",
  "worldcup.groups.json",
] as const;

async function fetchOpenFootballFile(file: string): Promise<unknown> {
  const response = await fetch(`${OPENFOOTBALL_BASE_URL}/${file}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${file}: ${response.status}`);
  }

  return response.json();
}

export async function fetchWorldCupBundleFromSource(): Promise<WorldCupBundle> {
  const [worldcup, teams, groups] = await Promise.all([
    fetchOpenFootballFile("worldcup.json"),
    fetchOpenFootballFile("worldcup.teams.json"),
    fetchOpenFootballFile("worldcup.groups.json"),
  ]);

  const worldcupData = worldcup as { name?: string; matches: WorldCupBundle["matches"] };

  return {
    fetchedAt: new Date().toISOString(),
    name: worldcupData.name ?? "World Cup 2026",
    matches: worldcupData.matches,
    teams: teams as WorldCupBundle["teams"],
    groups: groups as WorldCupBundle["groups"],
  };
}
