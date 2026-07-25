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
  scorePensLabel: string | null;
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
