import teamKitColorsJson from "../../../data/worldcup/2026/team-kit-colors.json";

export type KitVariant = "home" | "away";

export type TeamKitColors = {
  home: string;
  away: string;
};

export const TEAM_KIT_COLORS: Record<string, TeamKitColors> =
  teamKitColorsJson as Record<string, TeamKitColors>;

export function getTeamKitColor(
  teamId: string,
  variant: KitVariant,
): string | null {
  const kit = TEAM_KIT_COLORS[teamId];
  return kit?.[variant] ?? null;
}
