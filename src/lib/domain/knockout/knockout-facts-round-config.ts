import type { KnockoutFactsRoundDefinition } from "@/lib/types";

export const KNOCKOUT_FACTS_ROUNDS: KnockoutFactsRoundDefinition[] = [
  {
    id: "r32",
    roundName: "Round of 32",
    wideOpponentDifficultyBars: false,
  },
  {
    id: "r16",
    roundName: "Round of 16",
    wideOpponentDifficultyBars: true,
  },
  {
    id: "qf",
    roundName: "Quarter-final",
    wideOpponentDifficultyBars: true,
  },
  {
    id: "sf",
    roundName: "Semi-final",
    wideOpponentDifficultyBars: true,
  },
  {
    id: "final",
    roundName: "Final",
    wideOpponentDifficultyBars: true,
  },
];
