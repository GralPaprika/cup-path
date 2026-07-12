import type {
  OpenFootballMatch,
  OpenFootballTeam,
  RankingEntry,
  WorldCupData,
} from "@/lib/types";
import type { TournamentContext } from "@/lib/domain/tournament/tournament-context";
import { createTournamentContextFromOpenFootball } from "@/lib/data/tournament-context";
import bundledWorldcup from "../../../../data/worldcup/2026/worldcup.json";
import bundledTeams from "../../../../data/worldcup/2026/worldcup.teams.json";

export function rankingEntry(
  teamId: string,
  rank: number,
  points: number,
): RankingEntry {
  return { teamId, rank, points };
}

export function playedGroupMatch(
  team1: string,
  team2: string,
  homeGoals: number,
  awayGoals: number,
  options: {
    group?: string;
    round?: string;
    date?: string;
  } = {},
): OpenFootballMatch {
  return {
    team1,
    team2,
    group: options.group ?? "Group A",
    round: options.round ?? "Matchday 1",
    date: options.date ?? "2026-06-11",
    score: { ft: [homeGoals, awayGoals] },
  };
}

export function scheduledMatch(
  team1: string,
  team2: string,
  round: string,
  options: {
    group?: string;
    date?: string;
    num?: number;
  } = {},
): OpenFootballMatch {
  return {
    team1,
    team2,
    group: options.group,
    round,
    date: options.date ?? "2026-07-01",
    num: options.num,
  };
}

/** Complete Group A: MEX 1st, CZE 2nd, KOR 3rd, RSA 4th */
export function groupAMatchesComplete(): OpenFootballMatch[] {
  return [
    playedGroupMatch("Mexico", "South Africa", 2, 0, {
      round: "Matchday 1",
      date: "2026-06-11",
    }),
    playedGroupMatch("Korea Republic", "Czechia", 1, 1, {
      round: "Matchday 1",
      date: "2026-06-11",
    }),
    playedGroupMatch("Mexico", "Korea Republic", 1, 0, {
      round: "Matchday 2",
      date: "2026-06-18",
    }),
    playedGroupMatch("South Africa", "Czechia", 0, 3, {
      round: "Matchday 2",
      date: "2026-06-18",
    }),
    playedGroupMatch("Mexico", "Czechia", 3, 1, {
      round: "Matchday 3",
      date: "2026-06-25",
    }),
    playedGroupMatch("South Africa", "Korea Republic", 2, 1, {
      round: "Matchday 3",
      date: "2026-06-25",
    }),
  ];
}

/** Complete Group B: CAN 1st, SUI 2nd, BIH 3rd, QAT 4th */
export function groupBMatchesComplete(): OpenFootballMatch[] {
  return [
    playedGroupMatch("Canada", "Qatar", 2, 0, {
      group: "Group B",
      round: "Matchday 1",
      date: "2026-06-12",
    }),
    playedGroupMatch("Switzerland", "Bosnia and Herzegovina", 1, 0, {
      group: "Group B",
      round: "Matchday 1",
      date: "2026-06-12",
    }),
    playedGroupMatch("Canada", "Switzerland", 1, 0, {
      group: "Group B",
      round: "Matchday 2",
      date: "2026-06-19",
    }),
    playedGroupMatch("Qatar", "Bosnia and Herzegovina", 0, 3, {
      group: "Group B",
      round: "Matchday 2",
      date: "2026-06-19",
    }),
    playedGroupMatch("Canada", "Bosnia and Herzegovina", 2, 1, {
      group: "Group B",
      round: "Matchday 3",
      date: "2026-06-26",
    }),
    playedGroupMatch("Qatar", "Switzerland", 0, 2, {
      group: "Group B",
      round: "Matchday 3",
      date: "2026-06-26",
    }),
  ];
}

const BUNDLED_TEAMS = bundledTeams as OpenFootballTeam[];

export function createTestContext(
  matches: OpenFootballMatch[],
  rawTeams: OpenFootballTeam[] = BUNDLED_TEAMS,
): TournamentContext {
  return createTournamentContextFromOpenFootball(matches, rawTeams);
}

export function bundledTestContext(): TournamentContext {
  return createTestContext((bundledWorldcup as WorldCupData).matches);
}

export { bundledWorldcup };
