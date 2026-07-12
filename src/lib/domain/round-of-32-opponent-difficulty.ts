import type {
  KnockoutOpponentDifficultyStrip,
  Round32FixtureEntry,
} from "@/lib/types";
import { buildKnockoutOpponentDifficultyStrip } from "@/lib/domain/knockout-opponent-difficulty";

export function buildRound32OpponentDifficultyStrip(
  fixtures: Round32FixtureEntry[],
): KnockoutOpponentDifficultyStrip | null {
  return buildKnockoutOpponentDifficultyStrip(fixtures);
}
