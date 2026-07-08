export type RankingMode = "yearStart" | "tournamentStart" | "live";

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
  yearStartDate: string | null;
  tournamentStartDate: string | null;
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
  matches: MatchDifficulty[];
  avgOpponentPoints: number | null;
  avgOpponentRank: number | null;
  isEliminated: boolean;
  nextOpponent: Team | null;
  playedCount: number;
  totalCount: number;
}

export interface ComparisonEntry {
  team: Team;
  avgOpponentPoints: number | null;
  avgOpponentRank: number | null;
  isEliminated: boolean;
  rankAmongTeams: number;
  deltaVsSelected: number | null;
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
