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

export function stagesThrough(maxStage: PathStage): Set<PathStage> {
  return new Set(
    PATH_STAGES.filter((stage) => isStageWithinReach(stage, maxStage)),
  );
}

/** Stage immediately before `stage`, or null when `stage` is group. */
export function previousPathStage(stage: PathStage): PathStage | null {
  const idx = stageIndex(stage);
  if (idx <= 0) return null;
  return PATH_STAGES[idx - 1] ?? null;
}

/** All stages strictly before `stage` (empty for group). */
export function stagesBefore(stage: PathStage): Set<PathStage> {
  const previous = previousPathStage(stage);
  if (!previous) return new Set();
  return stagesThrough(previous);
}

export function getMatchStage(round: string): PathStage | null {
  if (round.startsWith("Matchday")) return "group";
  if (round === "Round of 32") return "r32";
  if (round === "Round of 16") return "r16";
  if (round === "Quarter-final") return "qf";
  if (round === "Semi-final") return "sf";
  if (round === "Final") return "final";
  return null;
}

/** Consolation match — shown in the bracket but ignored for path difficulty. */
export function isThirdPlaceMatch(round: string): boolean {
  return round === "Match for third place";
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
  // Show-teams filter must be at least the furthest stage included in averages,
  // but may go further (e.g. Final when averages only run through SF).
  return ensureTeamRoundAtLeast(teamRound, furthest);
}

/** Stages shown in COUNT MATCHES FROM for a SHOW TEAMS selection. Empty when All. */
export function visibleCountStages(teamRound: PathStage): PathStage[] {
  if (teamRound === "group") return [];
  return PATH_STAGES.filter((stage) => isStageWithinReach(stage, teamRound));
}

/**
 * Next average-stage set when SHOW TEAMS changes.
 * All → every stage (UI hidden). Otherwise: keep still-visible toggles,
 * turn newly visible stages on, drop out-of-range stages.
 */
export function stagesForTeamRoundChange(
  prevRound: PathStage,
  nextRound: PathStage,
  currentStages: Set<PathStage>,
): Set<PathStage> {
  if (nextRound === "group") {
    return new Set(PATH_STAGES);
  }

  const visible = stagesThrough(nextRound);
  if (prevRound === "group") {
    return visible;
  }

  const prevVisible = stagesThrough(prevRound);
  const next = new Set<PathStage>();
  for (const stage of visible) {
    if (currentStages.has(stage) || !prevVisible.has(stage)) {
      next.add(stage);
    }
  }
  return next.size > 0 ? next : visible;
}

/** Align persisted stages to a hydrated SHOW TEAMS selection. */
export function stagesAlignedToTeamRound(
  teamRound: PathStage,
  currentStages: Set<PathStage>,
): Set<PathStage> {
  if (teamRound === "group") {
    return new Set(PATH_STAGES);
  }
  const visible = stagesThrough(teamRound);
  const clamped = new Set(
    [...currentStages].filter((stage) => visible.has(stage)),
  );
  return clamped.size > 0 ? clamped : visible;
}
