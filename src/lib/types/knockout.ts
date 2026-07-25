import type { GroupStageDifficultyCohort } from "./group";
import type { AvgPointsContext, Team } from "./path";

export interface KnockoutOpponentDifficultyEntry {
  team: Team;
  opponent: Team;
  opponentFifaPoints: number;
  teamFifaPoints: number;
  qualified: boolean;
  matchNum: number | null;
}

export interface KnockoutOpponentDifficultySpotlight {
  team: Team;
  opponent: Team;
  opponentFifaPoints: number;
  deltaFromMean: number;
  isSdOutlier: boolean;
  matchNum: number | null;
}

export interface KnockoutOpponentDifficultyInsights {
  aboveMean: GroupStageDifficultyCohort;
  belowMean: GroupStageDifficultyCohort;
  atMean: GroupStageDifficultyCohort;
  stdDevOpponentPoints: number | null;
  medianQualifiedOpponent: number | null;
  medianEliminatedOpponent: number | null;
  qualificationRateGap: number | null;
  hardestOpponentQualifier: KnockoutOpponentDifficultySpotlight | null;
  easiestOpponentEliminated: KnockoutOpponentDifficultySpotlight | null;
}

export interface KnockoutOpponentDifficultyStrip {
  entries: KnockoutOpponentDifficultyEntry[];
  meanOpponentPoints: number | null;
  stdDevOpponentPoints: number | null;
  minOpponentPoints: number | null;
  maxOpponentPoints: number | null;
  insights: KnockoutOpponentDifficultyInsights;
}

export interface KnockoutFixtureEntry {
  matchNum: number | null;
  date: string;
  team1: Team;
  team2: Team;
  team1FifaPoints: number | null;
  team2FifaPoints: number | null;
  gapPoints: number;
  scoreFt: string;
  scoreEt: string | null;
  scorePens: string | null;
  winnerTeamId: string;
  upsetWin: boolean;
  isGapOutlier: boolean;
}

export interface KnockoutQualifierSpotlight {
  team: Team;
  fifaRank: number;
  fifaPoints: number | null;
  gapPoints: number;
  opponent: Team;
}

export interface KnockoutStageAnalysis {
  matchCount: number;
  participantCount: number;
  qualifiedCount: number;
  eliminatedCount: number;
  avgParticipantFifaPoints: number | null;
  avgParticipantFifaPointsContext: AvgPointsContext | null;
  medianParticipantFifaRank: number | null;
  meanGap: number | null;
  stdDevGap: number | null;
  maxGap: number | null;
  minGap: number | null;
  highestGapMatch: KnockoutFixtureEntry | null;
  lowestGapMatch: KnockoutFixtureEntry | null;
  biggestUnderdogWin: KnockoutFixtureEntry | null;
  lowestRankedQualifier: KnockoutQualifierSpotlight | null;
  fixtures: KnockoutFixtureEntry[];
  opponentDifficulty: KnockoutOpponentDifficultyStrip | null;
}

export type KnockoutFactsRoundId = "r32" | "r16" | "qf" | "sf" | "final";

export interface KnockoutFactsRoundDefinition {
  id: KnockoutFactsRoundId;
  roundName: string;
  wideOpponentDifficultyBars: boolean;
}
