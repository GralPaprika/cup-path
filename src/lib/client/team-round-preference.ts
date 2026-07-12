import type { PathStage } from "@/lib/types";
import { parseTeamRound } from "@/lib/domain/match/match-stages";

export type TeamRoundPageId = "compare";

function storageKey(pageId: TeamRoundPageId): string {
  return `cuppath:team-round:${pageId}`;
}

export function readTeamRoundPreference(
  pageId: TeamRoundPageId,
): PathStage | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(storageKey(pageId));
  if (!raw) return null;

  return parseTeamRound(raw);
}

export function writeTeamRoundPreference(
  pageId: TeamRoundPageId,
  teamRound: PathStage,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(pageId), teamRound);
}

export function readInitialTeamRound(pageId: TeamRoundPageId): PathStage {
  return readTeamRoundPreference(pageId) ?? parseTeamRound(null);
}
