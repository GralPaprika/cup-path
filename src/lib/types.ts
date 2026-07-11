export type RankingMode =
  | "live"
  | "june11"
  | "april"
  | "january"
  | "november19";

import type { NumericStats } from "@/lib/domain/group-stats";

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

export type { NumericStats } from "@/lib/domain/group-stats";

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
