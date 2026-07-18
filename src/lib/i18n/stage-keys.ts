import type { KnockoutFactsRoundId, PathStage } from "@/lib/types";

/** Keys under `compare.stages` for each path stage. */
export const COMPARE_STAGE_I18N_KEYS: Record<PathStage, string> = {
  group: "groupStage",
  r32: "round32",
  r16: "round16",
  qf: "quarterFinal",
  sf: "semiFinal",
  final: "final",
};

/** Keys under `home.*` for knockout facts round panels. */
export const HOME_FACTS_ROUND_I18N_KEYS: Record<KnockoutFactsRoundId, string> =
  {
    r32: "roundOf32",
    r16: "roundOf16",
    qf: "quarterFinal",
    sf: "semiFinal",
    final: "final",
  };

export type HomeFactsRoundNamespace =
  `home.${(typeof HOME_FACTS_ROUND_I18N_KEYS)[KnockoutFactsRoundId]}`;

export function homeFactsRoundNamespace(
  roundId: KnockoutFactsRoundId,
): HomeFactsRoundNamespace {
  return `home.${HOME_FACTS_ROUND_I18N_KEYS[roundId]}`;
}
