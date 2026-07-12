import type { PathStage } from "@/lib/types";

/** Keys under `compare.stages` for each path stage. */
export const COMPARE_STAGE_I18N_KEYS: Record<PathStage, string> = {
  group: "groupStage",
  r32: "round32",
  r16: "round16",
  qf: "quarterFinal",
  sf: "semiFinal",
  final: "final",
};
