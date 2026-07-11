import type {
  ComparisonEntry,
  GroupComparisonCard,
  GroupComparisonTeamEntry,
  GroupQualificationStatus,
  PathStage,
  RankingEntry,
} from "@/lib/types";
import { getTeamById } from "@/lib/data/team-registry";
import { getAllMatches } from "@/lib/data/worldcup-loader";
import {
  computeGroupStandings,
  getAdvancingTeamIds,
} from "@/lib/domain/group-standings";
import { computeNumericStats, computeMean } from "@/lib/domain/group-stats";
import { getGroupNames } from "@/lib/domain/path-builder";
import { getTeamsAtStage } from "@/lib/domain/team-stages";

function average(values: number[]): number | null {
  return computeMean(values);
}

function getQualificationStatus(
  standing: { position: number; teamId: string },
  advancing: Set<string>,
  isAdvancingThird: boolean,
): GroupQualificationStatus {
  if (!advancing.has(standing.teamId)) return null;
  if (isAdvancingThird) return "bestThird";
  if (standing.position === 1) return "first";
  if (standing.position === 2) return "second";
  return null;
}

export function buildGroupComparisonCards(
  allComparison: ComparisonEntry[],
  rankings: Map<string, RankingEntry>,
  teamRound: PathStage = "group",
): GroupComparisonCard[] {
  const groupNames = getGroupNames();
  const allGroupMatches = getAllMatches().filter((match) => match.group);
  const advancing = getAdvancingTeamIds(allGroupMatches, groupNames);
  const comparisonById = new Map(
    allComparison.map((entry) => [entry.team.id, entry]),
  );
  const visibleTeamIds =
    teamRound === "group" ? null : getTeamsAtStage(teamRound);

  return groupNames.map((groupName) => {
    const groupLetter = groupName.replace("Group ", "");
    const groupMatches = allGroupMatches.filter(
      (match) => match.group === groupName,
    );
    const standings = computeGroupStandings(groupMatches);
    const isComplete = standings.every((standing) => standing.played === 3);

    const teams: GroupComparisonTeamEntry[] = standings.map((standing) => {
      const comparison = comparisonById.get(standing.teamId);
      const ranking = rankings.get(standing.teamId);
      const team = comparison?.team ?? getTeamById(standing.teamId);
      if (!team) {
        throw new Error(`Unknown team: ${standing.teamId}`);
      }

      const isAdvancingThird =
        standing.position === 3 &&
        isComplete &&
        advancing.has(standing.teamId);

      return {
        team,
        standing,
        fifaRank: ranking?.rank ?? null,
        fifaPoints: ranking?.points ?? null,
        avgOpponentPoints: comparison?.avgOpponentPoints ?? null,
        avgOpponentRank: comparison?.avgOpponentRank ?? null,
        isEliminated: comparison?.isEliminated ?? false,
        rankAmongTeams: comparison?.rankAmongTeams ?? null,
        isAdvancingThird,
        isFilteredOut: visibleTeamIds
          ? !visibleTeamIds.has(standing.teamId)
          : false,
        qualificationStatus: getQualificationStatus(
          standing,
          advancing,
          isAdvancingThird,
        ),
      };
    });

    const fifaRankValues = teams
      .map((entry) => entry.fifaRank)
      .filter((value): value is number => value !== null);
    const fifaPointValues = teams
      .map((entry) => entry.fifaPoints)
      .filter((value): value is number => value !== null);

    return {
      groupName,
      groupLetter,
      teams,
      isComplete,
      avgFifaRank: average(fifaRankValues),
      avgFifaPoints: average(fifaPointValues),
      fifaRankStats: computeNumericStats(fifaRankValues),
      fifaPointsStats: computeNumericStats(fifaPointValues),
    };
  });
}
