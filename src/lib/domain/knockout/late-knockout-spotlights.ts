import type {
  KnockoutFixtureEntry,
  LateKnockoutMatchSpotlight,
  LateKnockoutPathSide,
  PathStage,
  RankingEntry,
} from "@/lib/types";
import type { TournamentContext } from "@/lib/domain/tournament/tournament-context";
import { buildTeamPathSummary } from "@/lib/domain/core/difficulty";
import {
  getMatchStage,
  isThirdPlaceMatch,
  previousPathStage,
  stagesBefore,
} from "@/lib/domain/match/match-stages";
import { isMatchPlayed } from "@/lib/domain/match/match-result";
import { buildPathChartDataFromSummary } from "@/lib/domain/path/path-opponent-observations";
import {
  getMatchScorePairForGoals,
  getTeamGoals,
  getTeamMatches,
} from "@/lib/domain/path/path-builder";

/**
 * Below this many ties, mean ± SD gap stats and scatters are not useful
 * (semi-finals and the final). Spotlights replace that deep dive.
 */
export const MIN_TIES_FOR_DISTRIBUTIONAL_ANALYSIS = 4;

function aggregateGoalsBeforeStage(
  ctx: TournamentContext,
  teamId: string,
  currentStage: PathStage,
): { goalsFor: number; goalsAgainst: number; goalDiff: number } {
  const priorStages = stagesBefore(currentStage);
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const match of getTeamMatches(ctx, teamId)) {
    if (!isMatchPlayed(match) || isThirdPlaceMatch(match.round)) continue;
    const stage = getMatchStage(match.round);
    if (stage === null || !priorStages.has(stage)) continue;

    const pair = getMatchScorePairForGoals(match);
    if (!pair) continue;
    const goals = getTeamGoals(ctx, match, teamId, pair);
    if (!goals) continue;

    goalsFor += goals[0];
    goalsAgainst += goals[1];
  }

  return {
    goalsFor,
    goalsAgainst,
    goalDiff: goalsFor - goalsAgainst,
  };
}

function buildPathSide(
  ctx: TournamentContext,
  teamId: string,
  teamFifaPoints: number | null,
  rankings: Map<string, RankingEntry>,
  currentStage: PathStage,
): LateKnockoutPathSide | null {
  const summary = buildTeamPathSummary(ctx, teamId, rankings);
  if (!summary) return null;

  const roadMaxStage = previousPathStage(currentStage);
  const chart = buildPathChartDataFromSummary(summary, roadMaxStage);
  const goals = aggregateGoalsBeforeStage(ctx, teamId, currentStage);

  return {
    team: summary.team,
    teamFifaPoints,
    avgOpponentPoints: chart.avgOpponentPoints,
    goalsFor: goals.goalsFor,
    goalsAgainst: goals.goalsAgainst,
    goalDiff: goals.goalDiff,
    opponents: chart.opponents,
  };
}

function compareFixturesChronologically(
  a: KnockoutFixtureEntry,
  b: KnockoutFixtureEntry,
): number {
  const byDate = a.date.localeCompare(b.date);
  if (byDate !== 0) return byDate;
  return (a.matchNum ?? 0) - (b.matchNum ?? 0);
}

export function buildLateKnockoutMatchSpotlights(
  ctx: TournamentContext,
  roundName: string,
  fixtures: KnockoutFixtureEntry[],
  rankings: Map<string, RankingEntry>,
): LateKnockoutMatchSpotlight[] | null {
  if (fixtures.length === 0) return null;
  if (fixtures.length >= MIN_TIES_FOR_DISTRIBUTIONAL_ANALYSIS) return null;

  const currentStage = getMatchStage(roundName);
  if (currentStage !== "sf" && currentStage !== "final") return null;

  const spotlights: LateKnockoutMatchSpotlight[] = [];

  for (const fixture of [...fixtures].sort(compareFixturesChronologically)) {
    const team1Path = buildPathSide(
      ctx,
      fixture.team1.id,
      fixture.team1FifaPoints,
      rankings,
      currentStage,
    );
    const team2Path = buildPathSide(
      ctx,
      fixture.team2.id,
      fixture.team2FifaPoints,
      rankings,
      currentStage,
    );
    if (!team1Path || !team2Path) continue;

    spotlights.push({ fixture, team1Path, team2Path });
  }

  return spotlights.length > 0 ? spotlights : null;
}
