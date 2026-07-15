import type { GroupExpectedMatchEntry, GroupMatchResult } from "@/lib/types";
import type { GapMatchTooltipEntry } from "@/components/facts/match-outcome-gap-match-tooltip";

export function favoriteResultForGroupMatch(
  entry: GroupExpectedMatchEntry,
): GroupMatchResult {
  if (entry.team1Actual === "D" || entry.team2Actual === "D") return "D";
  if (!entry.favoriteTeamId) return "W";

  const favoriteIsTeam1 = entry.favoriteTeamId === entry.team1.id;
  const favoriteActual = favoriteIsTeam1
    ? entry.team1Actual
    : entry.team2Actual;

  return favoriteActual === "W" ? "W" : "L";
}

export function toGapMatchTooltipEntry(
  entry: GroupExpectedMatchEntry,
  isOutlier: boolean,
): GapMatchTooltipEntry {
  return {
    team1: entry.team1,
    team2: entry.team2,
    team1FifaPoints: entry.team1FifaPoints,
    team2FifaPoints: entry.team2FifaPoints,
    gapPoints: entry.gapPoints,
    favoriteTeamId: entry.favoriteTeamId,
    favoriteResult: favoriteResultForGroupMatch(entry),
    isEqualRating: entry.isEqualRating,
    scoreLabel: entry.scoreLabel,
    isOutlier,
    groupLetter: entry.groupLetter,
  };
}

export function groupMatchPointId(entry: GroupExpectedMatchEntry): string {
  return `${entry.groupLetter}-${entry.team1.id}-${entry.team2.id}-${entry.scoreLabel}`;
}
