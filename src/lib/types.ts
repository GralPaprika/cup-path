export type RankingMode =
  | "live"
  | "june11"
  | "april"
  | "january"
  | "november19";

export interface NumericStats {
  count: number;
  mean: number | null;
  median: number | null;
  variance: number | null;
  stdDev: number | null;
  min: number | null;
  max: number | null;
}

export interface CohortOrderingCorrelation {
  spearmanRho: number | null;
  kendallTau: number | null;
  comparableTeamCount: number;
}

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

export interface OpponentPointsObservation {
  teamId: string;
  displayName: string;
  flagUrl: string;
  points: number;
}

export interface PathChartData {
  opponents: OpponentPointsObservation[];
  avgOpponentPoints: number | null;
}

export type PathStage = "group" | "r32" | "r16" | "qf" | "sf" | "final";

export type MatchResult = "W" | "D" | "L" | null;

export interface Team {
  id: string;
  displayName: string;
  aliases: string[];
  group: string;
  flagUrl: string;
  confederation: string;
}

export interface RankingEntry {
  teamId: string;
  rank: number;
  points: number;
  flagUrl?: string;
  previousRank?: number;
}

export interface RankingsSnapshot {
  mode: RankingMode | "snapshot";
  fetchedAt: string;
  sourceDate: string;
  entries: RankingEntry[];
}

export interface RankingsMeta {
  liveLastUpdated: string | null;
  januaryDate: string | null;
  aprilDate: string | null;
  june11Date: string | null;
  november19Date: string | null;
}

export interface OpenFootballScore {
  ft?: [number, number];
  ht?: [number, number];
  et?: [number, number];
  p?: [number, number];
}

export interface OpenFootballMatch {
  round: string;
  num?: number;
  date: string;
  time?: string;
  team1: string;
  team2: string;
  score?: OpenFootballScore;
  group?: string;
  ground?: string;
}

export type BracketSlotKind =
  | "groupPosition"
  | "thirdAssigned"
  | "winner"
  | "loser";

export interface BracketSlotSpec {
  kind: BracketSlotKind;
  group?: string;
  position?: 1 | 2 | 3;
  matchNum?: number;
  eligibleGroups?: string[];
}

export interface BracketTemplateMatch {
  num: number;
  round: string;
  home: BracketSlotSpec;
  away: BracketSlotSpec;
}

export interface ResolvedMatchSide {
  slotLabel: string;
  slotKind: BracketSlotKind;
  group?: string;
  position?: 1 | 2 | 3;
  sourceMatchNum?: number;
  eligibleGroups?: string[];
  teamId: string | null;
}

export interface ResolvedBracketMatch {
  num: number;
  round: string;
  date: string;
  ground?: string;
  home: ResolvedMatchSide;
  away: ResolvedMatchSide;
  winnerTeamId: string | null;
  isPlayed: boolean;
  scoreLabel: string | null;
}

export interface SimulationScenario {
  knockoutWinners?: Record<number, string>;
  slotOverrides?: Record<string, string>;
  groupFinishes?: Record<string, [string, string, string, string]>;
}

export interface PathDiffRow {
  round: string;
  date: string;
  actualOpponentId: string | null;
  simulatedOpponentId: string | null;
  opponentChanged: boolean;
}

export interface GroupFinishCard {
  groupLetter: string;
  positions: Array<{
    position: 1 | 2 | 3 | 4;
    teamId: string;
  }>;
  thirdQualifies: boolean;
}

export interface BestThirdRankingEntry {
  rank: number;
  groupLetter: string;
  teamId: string;
  points: number;
  gd: number;
  gf: number;
  ga: number;
  played: number;
  qualifies: boolean;
}

export interface SimulationResult {
  teamId: string;
  actualSummary: TeamPathSummary;
  simulatedSummary: TeamPathSummary;
  comparisonActualSummary: TeamPathSummary | null;
  actualAvgPointsContext: AvgPointsContext | null;
  simulatedAvgPointsContext: AvgPointsContext | null;
  comparisonAvgPointsContext: AvgPointsContext | null;
  bracket: ResolvedBracketMatch[];
  changedMatchNums: number[];
  pendingWinnerMatchNums: number[];
  affectedMatchNums: number[];
  actualWinnersByMatchNum: Record<number, string | null>;
  canPickAllStrongestWinners: boolean;
  canPickSimulatedStrongestWinners: boolean;
  pathDiff: PathDiffRow[];
  baselineGroupFinishes: Record<string, [string, string, string, string]>;
  groupCards: GroupFinishCard[];
  bestThirdRanking: BestThirdRankingEntry[];
  teamRankings: Record<string, { rank: number; points: number }>;
  focusTeamMatchNums: number[];
  /** When a comparison team is set, chart slots stop at this shared stage. */
  comparisonChartMaxStage: PathStage | null;
  actualPathChart: PathChartData;
  simulatedPathChart: PathChartData;
  comparisonPathChart: PathChartData | null;
}

export interface OpenFootballTeam {
  name: string;
  name_normalised?: string;
  fifa_code: string;
  group: string;
  confed: string;
  flag_icon: string;
}

export interface WorldCupData {
  name: string;
  matches: OpenFootballMatch[];
}

export interface MatchDifficulty {
  round: string;
  date: string;
  opponent: Team;
  opponentRank: number | null;
  opponentPoints: number | null;
  teamRank: number | null;
  teamPoints: number | null;
  rankGap: number | null;
  pointsGap: number | null;
  result: MatchResult;
  scoreLabel: string | null;
  isNext: boolean;
  isPlayed: boolean;
}

export interface TeamPathSummary {
  team: Team;
  teamRank: number | null;
  teamPoints: number | null;
  matches: MatchDifficulty[];
  avgOpponentPoints: number | null;
  avgOpponentRank: number | null;
  isEliminated: boolean;
  nextOpponent: Team | null;
  playedCount: number;
  totalCount: number;
}

export interface PointsAnchor {
  team: Team;
  points: number;
  rank: number;
  gap: number;
}

export interface AvgPointsContext {
  percentile: number;
  poolSize: number;
  anchor: PointsAnchor | null;
}

export interface ComparisonEntry {
  team: Team;
  avgOpponentPoints: number | null;
  avgOpponentRank: number | null;
  avgPointsContext: AvgPointsContext | null;
  isEliminated: boolean;
  rankAmongTeams: number | null;
  deltaVsSelected: number | null;
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

export interface TournamentSnapshot {
  avgFifaPoints: number | null;
  medianFifaRank: number | null;
  teamCounts: Record<PathStage, number>;
}

export interface GroupStagePoolFact {
  teamCount: number;
  avgFifaPoints: number | null;
  avgFifaPointsContext: AvgPointsContext | null;
  medianFifaRank: number | null;
  lowestRankedQualifier: {
    team: Team;
    fifaRank: number;
    fifaPoints: number;
    groupLetter: string;
  } | null;
}

export interface UpsetMatchFact {
  team: Team;
  opponent: Team;
  pointsGap: number;
  round: string;
  scoreLabel: string | null;
}

export interface TeamHighlightFact {
  team: Team;
  fifaRank: number | null;
  fifaPoints: number | null;
  maxStageReached: PathStage;
  value: number;
}

export interface GroupOfDeathFact {
  groupLetter: string;
  avgFifaPoints: number | null;
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

export interface KnockoutOpponentDifficultyEntry {
  team: Team;
  opponent: Team;
  opponentFifaPoints: number;
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

export type KnockoutFactsRoundId = "r32" | "r16" | "qf";

export interface KnockoutFactsRoundDefinition {
  id: KnockoutFactsRoundId;
  roundName: string;
  wideOpponentDifficultyBars: boolean;
}

export interface TournamentHighlights {
  overPerformer: TeamHighlightFact | null;
  underPerformer: TeamHighlightFact | null;
  biggestGiantKilling: UpsetMatchFact | null;
  biggestFavoriteUpset: UpsetMatchFact | null;
  giantKillerLeader: TeamHighlightFact | null;
  hardestRemainingPath: TeamHighlightFact | null;
  easiestRemainingPath: TeamHighlightFact | null;
  groupOfDeath: GroupOfDeathFact | null;
}

export interface TournamentFacts {
  snapshot: TournamentSnapshot;
  groupStagePool: GroupStagePoolFact;
  highlights: TournamentHighlights;
  groupExpectedAnalysis: GroupExpectedAnalysis | null;
  groupStageDifficulty: GroupStageDifficultyStrip | null;
  knockoutAnalyses: Partial<Record<KnockoutFactsRoundId, KnockoutStageAnalysis>>;
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
