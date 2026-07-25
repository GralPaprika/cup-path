import type {
  AvgPointsContext,
  PathChartData,
  PathStage,
  TeamPathSummary,
} from "./path";

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
  /** When a comparison team is set, all path charts truncate at this shared stage. */
  pathChartMaxStage: PathStage | null;
  actualPathChart: PathChartData;
  simulatedPathChart: PathChartData;
  comparisonPathChart: PathChartData | null;
}
