import type { PathStage } from "@/lib/types";

export const PATH_STAGES: PathStage[] = [
  "group",
  "r32",
  "r16",
  "qf",
  "sf",
  "final",
];

export const DEFAULT_PATH_STAGES: PathStage[] = ["group"];

export function stageIndex(stage: PathStage): number {
  return PATH_STAGES.indexOf(stage);
}

export function getFurthestStage(stages: Set<PathStage>): PathStage {
  let highest = 0;
  for (const stage of PATH_STAGES) {
    if (stages.has(stage)) {
      highest = Math.max(highest, stageIndex(stage));
    }
  }
  return PATH_STAGES[highest];
}

export function isStageWithinReach(
  stage: PathStage,
  maxStage: PathStage,
): boolean {
  return stageIndex(stage) <= stageIndex(maxStage);
}

export function clampPathStages(
  stages: Set<PathStage>,
  maxStage: PathStage,
): Set<PathStage> {
  const clamped = new Set(
    [...stages].filter((stage) => isStageWithinReach(stage, maxStage)),
  );
  if (clamped.size === 0) clamped.add("group");
  return clamped;
}

export function getMatchStage(round: string): PathStage | null {
  if (round.startsWith("Matchday")) return "group";
  if (round === "Round of 32") return "r32";
  if (round === "Round of 16") return "r16";
  if (round === "Quarter-final") return "qf";
  if (round === "Semi-final") return "sf";
  if (round === "Final") return "final";
  if (round === "Match for third place") return "final";
  return null;
}

export function parsePathStages(value: string | null): Set<PathStage> {
  if (!value) return new Set(DEFAULT_PATH_STAGES);

  const parsed = value
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is PathStage =>
      PATH_STAGES.includes(item as PathStage),
    );

  return parsed.length > 0 ? new Set(parsed) : new Set(DEFAULT_PATH_STAGES);
}

export function serializePathStages(stages: Set<PathStage>): string {
  return PATH_STAGES.filter((stage) => stages.has(stage)).join(",");
}

export function parseTeamRound(value: string | null): PathStage {
  if (value && PATH_STAGES.includes(value as PathStage)) {
    return value as PathStage;
  }
  return "group";
}

export function ensureTeamRoundAtLeast(
  teamRound: PathStage,
  minRound: PathStage,
): PathStage {
  return stageIndex(teamRound) < stageIndex(minRound) ? minRound : teamRound;
}

export function syncTeamRoundToStages(
  teamRound: PathStage,
  stages: Set<PathStage>,
): PathStage {
  const furthest = getFurthestStage(stages);
  if (stageIndex(teamRound) > stageIndex(furthest)) {
    return furthest;
  }
  return ensureTeamRoundAtLeast(teamRound, furthest);
}
