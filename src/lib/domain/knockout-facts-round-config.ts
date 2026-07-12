import type { KnockoutFactsRoundDefinition } from "@/lib/types";

export const KNOCKOUT_FACTS_ROUNDS: KnockoutFactsRoundDefinition[] = [
  {
    id: "r32",
    roundName: "Round of 32",
    translationNamespace: "home.roundOf32",
    wideOpponentDifficultyBars: false,
  },
  {
    id: "r16",
    roundName: "Round of 16",
    translationNamespace: "home.roundOf16",
    wideOpponentDifficultyBars: true,
  },
  {
    id: "qf",
    roundName: "Quarter-final",
    translationNamespace: "home.quarterFinal",
    wideOpponentDifficultyBars: true,
  },
];
