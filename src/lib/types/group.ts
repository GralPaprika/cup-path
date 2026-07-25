import type { CohortOrderingCorrelation, NumericStats } from "./stats";
import type { Team } from "./path";

export interface GroupPointsBenchmarks {
  weakest: { groupLetter: string; avgFifaPoints: number };
  strongest: { groupLetter: string; avgFifaPoints: number };
  tournamentAverage: number;
}

export interface GroupStrengthOrdering {
  correlation: CohortOrderingCorrelation;
  rankByPoints: Record<string, number>;
  rankByAvgRank: Record<string, number>;
  groupCount: number;
}

export interface GroupStanding {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  position: number;
}

export type GroupQualificationStatus = "first" | "second" | "bestThird" | null;

export interface GroupComparisonTeamEntry {
  team: Team;
  standing: GroupStanding;
  fifaRank: number | null;
  fifaPoints: number | null;
  avgOpponentPoints: number | null;
  avgOpponentRank: number | null;
  isEliminated: boolean;
  rankAmongTeams: number | null;
  isAdvancingThird: boolean;
  isFilteredOut: boolean;
  qualificationStatus: GroupQualificationStatus;
}

export interface GroupComparisonCard {
  groupName: string;
  groupLetter: string;
  teams: GroupComparisonTeamEntry[];
  isComplete: boolean;
  avgFifaRank: number | null;
  avgFifaPoints: number | null;
  fifaRankStats: NumericStats;
  fifaPointsStats: NumericStats;
}

export type GroupMatchResult = "W" | "D" | "L";

export type PaperDrawNote = "equalRating" | "favoriteDrew";

export interface GroupExpectedMatchEntry {
  team1: Team;
  team2: Team;
  groupLetter: string;
  scoreLabel: string;
  team1FifaPoints: number | null;
  team2FifaPoints: number | null;
  pointsGap: number | null;
  gapPoints: number;
  paperDrawNote: PaperDrawNote | null;
  isDrawGapOutlier: boolean;
  isWinLossGapOutlier: boolean;
  isEqualRating: boolean;
  favoriteTeamId: string | null;
  underdogTeamId: string | null;
  team1Expected: GroupMatchResult;
  team2Expected: GroupMatchResult;
  team1Actual: GroupMatchResult;
  team2Actual: GroupMatchResult;
  expectedWinLanded: boolean;
  expectedWinMissed: boolean;
  unexpectedDefeat: boolean;
  upsetWin: boolean;
}

export interface GroupExpectedFinishEntry {
  team: Team;
  groupLetter: string;
  fifaRank: number | null;
  fifaPoints: number | null;
  expectedPoints: number;
  expectedPosition: number;
  actualPosition: number;
  positionDelta: number;
}

export interface GroupExpectedUnderperformer {
  team: Team;
  groupLetter: string;
  fifaRank: number | null;
  fifaPoints: number | null;
  expectedPosition: number;
  actualPosition: number;
  positionDelta: number;
}

export interface GroupExpectedAnalysis {
  meanAbsPointsGap: number | null;
  medianAbsPointsGap: number | null;
  meanAbsPointsGapFavorite: number | null;
  medianAbsPointsGapFavorite: number | null;
  actualDrawCount: number;
  meanPointsGapOnDraws: number | null;
  stdDevPointsGapOnDraws: number | null;
  maxPointsGapOnDraw: number | null;
  minPointsGapOnDraw: number | null;
  drawMatches: GroupExpectedMatchEntry[];
  highestGapDrawMatch: GroupExpectedMatchEntry | null;
  lowestGapDrawMatch: GroupExpectedMatchEntry | null;
  biggestUnderdogDrawMatch: GroupExpectedMatchEntry | null;
  actualWinLossCount: number;
  meanPointsGapOnWinLoss: number | null;
  stdDevPointsGapOnWinLoss: number | null;
  maxPointsGapOnWinLoss: number | null;
  minPointsGapOnWinLoss: number | null;
  highestGapWinLossMatch: GroupExpectedMatchEntry | null;
  lowestGapWinLossMatch: GroupExpectedMatchEntry | null;
  biggestUnderdogWinMatch: GroupExpectedMatchEntry | null;
  winLossMatches: GroupExpectedMatchEntry[];
  favoriteMatchCount: number;
  equalRatingMatchCount: number;
  expectedDrawLandedCount: number;
  expectedDrawMissedCount: number;
  matchCount: number;
  expectedWinLandedCount: number;
  expectedWinMissedCount: number;
  unexpectedDefeatCount: number;
  upsetWinCount: number;
  matchLedger: GroupExpectedMatchEntry[];
  expectedFinishes: GroupExpectedFinishEntry[];
  eliminatedUnderperformers: GroupExpectedUnderperformer[];
}

export interface GroupStageDifficultyEntry {
  team: Team;
  groupLetter: string;
  avgOpponentPoints: number;
  teamFifaPoints: number;
  qualified: boolean;
}

export interface GroupStageDifficultyCohort {
  total: number;
  qualified: number;
  eliminated: number;
}

export interface GroupStageDifficultySpotlight {
  team: Team;
  groupLetter: string;
  avgOpponentPoints: number;
  deltaFromMean: number;
  isSdOutlier: boolean;
}

export interface GroupStageDifficultyInsights {
  aboveMean: GroupStageDifficultyCohort;
  belowMean: GroupStageDifficultyCohort;
  atMean: GroupStageDifficultyCohort;
  stdDevAvgOpponentPoints: number | null;
  medianQualifiedAvg: number | null;
  medianEliminatedAvg: number | null;
  qualificationRateGap: number | null;
  hardestDrawSurvivor: GroupStageDifficultySpotlight | null;
  easiestDrawCasualty: GroupStageDifficultySpotlight | null;
}

export interface GroupStageDifficultyStrip {
  entries: GroupStageDifficultyEntry[];
  meanAvgOpponentPoints: number | null;
  stdDevAvgOpponentPoints: number | null;
  minAvgOpponentPoints: number | null;
  maxAvgOpponentPoints: number | null;
  insights: GroupStageDifficultyInsights;
}
