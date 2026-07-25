import type {
  GroupExpectedAnalysis,
  GroupMatchResult,
  GroupStageDifficultyStrip,
} from "./group";
import type {
  KnockoutFactsRoundId,
  KnockoutStageAnalysis,
} from "./knockout";
import type { AvgPointsContext, PathStage, Team } from "./path";

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

export interface MatchOutcomeGapEntry {
  id: string;
  matchNum: number | null;
  stage: PathStage;
  round: string;
  groupLetter: string | null;
  team1: Team;
  team2: Team;
  team1FifaPoints: number | null;
  team2FifaPoints: number | null;
  gapPoints: number;
  favoriteTeamId: string | null;
  favoriteResult: GroupMatchResult;
  isEqualRating: boolean;
  scoreLabel: string;
  isOutlier: boolean;
  outlierKind: "draw" | "upset" | null;
}

export interface MatchOutcomeGapDataset {
  matches: MatchOutcomeGapEntry[];
  drawGapMean: number | null;
  drawGapStdDev: number | null;
  upsetGapMean: number | null;
  upsetGapStdDev: number | null;
}

export type TeamTierId =
  | "titleFavorites"
  | "contenders"
  | "darkHorses"
  | "outsiders"
  | "makeweights";

export interface EvenMatchesByTierRow {
  tier: TeamTierId;
  count: number;
}

export interface EvenMatchesByTierInsight {
  groupStagePct: number;
  groupMatchCount: number;
  totalMatchCount: number;
  evenMatchCount: number;
  rows: EvenMatchesByTierRow[];
}

export interface TeamTierMember {
  team: Team;
  fifaRank: number;
  fifaPoints: number;
}

export interface TeamTiersDataset {
  tiers: Record<TeamTierId, TeamTierMember[]>;
}

export interface TournamentFacts {
  snapshot: TournamentSnapshot;
  groupStagePool: GroupStagePoolFact;
  highlights: TournamentHighlights;
  teamTiers: TeamTiersDataset;
  groupExpectedAnalysis: GroupExpectedAnalysis | null;
  groupStageDifficulty: GroupStageDifficultyStrip | null;
  knockoutAnalyses: Partial<Record<KnockoutFactsRoundId, KnockoutStageAnalysis>>;
  matchOutcomeGap: MatchOutcomeGapDataset | null;
  /** Group-stage even matches (≤100 pts), bucketed by the higher of the two tiers. */
  evenMatchesByTier: EvenMatchesByTierInsight | null;
}
