import type { GroupComparisonCard } from "@/lib/types";

export function parseSelectedGroupLetter(
  urlGroup: string | null,
  groups: GroupComparisonCard[],
  selectedTeamId?: string,
): string {
  const letters = new Set(groups.map((group) => group.groupLetter));
  const normalized = urlGroup?.toUpperCase();

  if (selectedTeamId) {
    const teamGroup = groups.find((group) =>
      group.teams.some((entry) => entry.team.id === selectedTeamId),
    )?.groupLetter;
    if (teamGroup) return teamGroup;
  }

  if (normalized && letters.has(normalized)) {
    return normalized;
  }

  return letters.has("A") ? "A" : (groups[0]?.groupLetter ?? "A");
}
