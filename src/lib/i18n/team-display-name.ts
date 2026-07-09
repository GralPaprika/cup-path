import type { Team } from "@/lib/types";

type TeamTranslator = (teamId: string) => string;

export function getTeamDisplayName(
  t: TeamTranslator,
  team: Pick<Team, "id" | "displayName">,
): string {
  const translated = t(team.id);
  return translated === `teams.${team.id}` ? team.displayName : translated;
}

export function normalizeTeamSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function teamMatchesQuery(
  team: Pick<Team, "id" | "displayName">,
  localizedName: string,
  query: string,
): boolean {
  const normalized = normalizeTeamSearch(query);
  if (!normalized) return true;

  return (
    normalizeTeamSearch(localizedName).includes(normalized) ||
    team.id.toLowerCase().includes(normalized)
  );
}
