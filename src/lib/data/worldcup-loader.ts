import type { OpenFootballMatch, WorldCupData } from "@/lib/types";
import worldcupData from "../../../data/worldcup/2026/worldcup.json";

let cachedMatches: OpenFootballMatch[] | null = null;

export function getWorldCupData(): WorldCupData {
  return worldcupData as WorldCupData;
}

export function getAllMatches(): OpenFootballMatch[] {
  if (!cachedMatches) {
    cachedMatches = getWorldCupData().matches;
  }
  return cachedMatches;
}

export function getGroupMatches(groupName: string): OpenFootballMatch[] {
  return getAllMatches().filter((match) => match.group === groupName);
}

export function isKnockoutRound(round: string): boolean {
  return !round.startsWith("Matchday");
}

export function isMatchPlayed(match: OpenFootballMatch): boolean {
  return Boolean(match.score?.ft);
}

export function getMatchWinner(match: OpenFootballMatch): string | null {
  if (!match.score?.ft) return null;

  const [home, away] = match.score.ft;
  if (home === away) {
    if (match.score.et) {
      const [etHome, etAway] = match.score.et;
      if (etHome !== etAway) {
        return etHome > etAway ? match.team1 : match.team2;
      }
    }
    if (match.score.p) {
      const [pHome, pAway] = match.score.p;
      return pHome > pAway ? match.team1 : match.team2;
    }
    return null;
  }

  return home > away ? match.team1 : match.team2;
}
