import type { OpenFootballMatch, OpenFootballTeam } from "@/lib/types";
import {
  createTournamentContext,
  type TournamentContext,
} from "@/lib/domain/tournament/tournament-context";
import { getAllMatches } from "@/lib/data/worldcup-loader";
import {
  getAllTeams,
  teamFromOpenFootball,
} from "@/lib/data/team-registry";

export function getTournamentContext(): TournamentContext {
  return createTournamentContext(getAllMatches(), getAllTeams());
}

export function createTournamentContextFromOpenFootball(
  matches: OpenFootballMatch[],
  rawTeams: OpenFootballTeam[],
): TournamentContext {
  return createTournamentContext(
    matches,
    rawTeams.map(teamFromOpenFootball),
  );
}
