import type { PodiumFinish } from "@/lib/types";

export const PODIUM_BADGE_STYLES: Record<PodiumFinish, string> = {
  champion: "border-wc-orange/40 bg-wc-orange/15 text-wc-orange",
  runnerUp: "border-white/20 bg-white/10 text-white",
  thirdPlace: "border-amber-500/40 bg-amber-500/15 text-amber-200",
};

export const PODIUM_BADGE_HOVER_STYLES: Record<PodiumFinish, string> = {
  champion: "hover:border-wc-orange/60 hover:bg-wc-orange/25",
  runnerUp: "hover:border-white/35 hover:bg-white/15",
  thirdPlace: "hover:border-amber-500/60 hover:bg-amber-500/25",
};

export const ELIMINATED_BADGE_STYLE =
  "border-wc-red/30 bg-wc-red/20 text-wc-red";

export const ELIMINATED_BADGE_HOVER_STYLE =
  "hover:border-wc-red/50 hover:bg-wc-red/30";

export const ACTIVE_BADGE_STYLE =
  "border-wc-green/30 bg-wc-green/20 text-wc-green";

/** Keys under `summary` for podium finish labels. */
export const PODIUM_LABEL_KEYS: Record<PodiumFinish, string> = {
  champion: "outcomeChampion",
  runnerUp: "outcomeRunnerUp",
  thirdPlace: "outcomeThirdPlace",
};
