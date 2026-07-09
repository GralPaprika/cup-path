import type { OpenFootballMatch, OpenFootballTeam } from "@/lib/types";

export const WORLDCUP_BLOB_PATH = "worldcup/bundle.json";
export const WORLDCUP_RUNTIME_FILE = "bundle.json";

export function worldcupCacheTag(): string {
  return "worldcup:bundle";
}

export interface WorldCupGroupsFile {
  name: string;
  groups: Array<{ name: string; teams: string[] }>;
}

export interface WorldCupBundle {
  fetchedAt: string;
  name: string;
  matches: OpenFootballMatch[];
  teams: OpenFootballTeam[];
  groups: WorldCupGroupsFile;
}
