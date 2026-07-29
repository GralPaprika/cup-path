import type { GroupStageDifficultyCohort } from "./group";
import type {
  AvgPointsContext,
  OpponentPointsObservation,
  Team,
} from "./path";

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
  favoriteTeamId: string | null;
  isEqualRating: boolean;
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

/** Path-to-match metrics for one side of a late-round (SF/Final) fixture. */
export interface LateKnockoutPathSide {
  team: Team;
  teamFifaPoints: number | null;
  avgOpponentPoints: number | null;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  opponents: OpponentPointsObservation[];
}

/**
 * Per-fixture spotlight for rounds with too few ties for distributional
 * gap stats (semi-finals and the final).
 */
export interface LateKnockoutMatchSpotlight {
  fixture: KnockoutFixtureEntry;
  team1Path: LateKnockoutPathSide;
  team2Path: LateKnockoutPathSide;
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
  /** Populated when matchCount < 4 (SF/Final); otherwise null. */
  lateMatchSpotlights: LateKnockoutMatchSpotlight[] | null;
}

export type KnockoutFactsRoundId = "r32" | "r16" | "qf" | "sf" | "final";

export interface KnockoutFactsRoundDefinition {
  id: KnockoutFactsRoundId;
  roundName: string;
  wideOpponentDifficultyBars: boolean;
}
