import type { OpenFootballMatch, WorldCupData } from "@/lib/types";
import type { WorldCupBundle } from "@/lib/data/worldcup-paths";
import bundledWorldcup from "../../../data/worldcup/2026/worldcup.json";

let worldCupData: WorldCupData = bundledWorldcup as WorldCupData;
let cachedMatches: OpenFootballMatch[] | null = null;

export function applyWorldCupBundle(bundle: Pick<WorldCupBundle, "name" | "matches">): void {
  worldCupData = {
    name: bundle.name,
    matches: bundle.matches,
  };
  cachedMatches = null;
}

export function getWorldCupData(): WorldCupData {
  return worldCupData;
}

export function getAllMatches(): OpenFootballMatch[] {
  if (!cachedMatches) {
    cachedMatches = getWorldCupData().matches;
  }
  return cachedMatches;
}

export function getGroupMatches(groupName: string): OpenFootballMatch[] {
  return getAllMatches().filter((match) => match.group === groupName);
}
