import type { MatchDifficulty, PodiumFinish } from "@/lib/types";
import {
  getMatchStage,
  isThirdPlaceMatch,
} from "@/lib/domain/match/match-stages";

export function getPodiumFinish(
  matches: MatchDifficulty[],
): PodiumFinish | null {
  const finalMatch = matches.find(
    (match) => match.isPlayed && getMatchStage(match.round) === "final",
  );
  if (finalMatch?.result === "W") return "champion";
  if (finalMatch?.result === "L") return "runnerUp";

  const thirdPlaceMatch = matches.find(
    (match) => match.isPlayed && isThirdPlaceMatch(match.round),
  );
  if (thirdPlaceMatch?.result === "W") return "thirdPlace";

  return null;
}
