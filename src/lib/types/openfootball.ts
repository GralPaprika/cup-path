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
